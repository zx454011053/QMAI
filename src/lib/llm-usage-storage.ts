import { createDirectory, fileExists, readFile, writeFile } from "@/commands/fs"
import { normalizePath } from "@/lib/path-utils"
import { trimRecords, remapProjectUsageScopeKeys, type LlmUsageRecord } from "@/lib/llm-usage"

const LLM_USAGE_FILE = ".qmai/llm-generation-history.json"
const PERSIST_VERSION = 1

interface PersistedLlmUsageFile {
  version: typeof PERSIST_VERSION
  recordsByScope: Record<string, LlmUsageRecord[]>
}

function usageFilePath(projectPath: string): string {
  return `${normalizePath(projectPath)}/${LLM_USAGE_FILE}`
}

function projectScopePrefix(projectPath: string): string {
  return `${normalizePath(projectPath)}::`
}

function isUsageMessage(value: unknown): value is LlmUsageRecord["messages"][number] {
  const item = value as Partial<LlmUsageRecord["messages"][number]>
  return typeof item?.role === "string" && typeof item?.content === "string"
}

function isUsageData(value: unknown): value is NonNullable<LlmUsageRecord["usage"]> {
  if (!value || typeof value !== "object") return false
  const usage = value as Record<string, unknown>
  const numericKeys = [
    "promptTokens",
    "completionTokens",
    "promptCacheHitTokens",
    "promptCacheMissTokens",
  ] as const
  return numericKeys.every((key) => usage[key] == null || typeof usage[key] === "number")
}

function isLlmUsageRecord(value: unknown): value is LlmUsageRecord {
  const record = value as Partial<LlmUsageRecord>
  return Boolean(
    record &&
      typeof record.id === "string" &&
      typeof record.timestamp === "number" &&
      typeof record.label === "string" &&
      typeof record.model === "string" &&
      typeof record.provider === "string" &&
      Array.isArray(record.messages) &&
      record.messages.every(isUsageMessage) &&
      (record.response == null || typeof record.response === "string") &&
      (record.filePath == null || typeof record.filePath === "string") &&
      (record.error == null || typeof record.error === "string") &&
      (record.durationMs == null || typeof record.durationMs === "number") &&
      (record.usage == null || isUsageData(record.usage)),
  )
}

function parsePersistedFile(raw: unknown): Record<string, LlmUsageRecord[]> {
  if (!raw || typeof raw !== "object") return {}
  const data = raw as Partial<PersistedLlmUsageFile>
  if (data.version !== PERSIST_VERSION || !data.recordsByScope || typeof data.recordsByScope !== "object") {
    return {}
  }

  const parsed: Record<string, LlmUsageRecord[]> = {}
  for (const [scopeKey, records] of Object.entries(data.recordsByScope)) {
    if (!Array.isArray(records)) continue
    const valid = records.filter(isLlmUsageRecord)
    if (valid.length > 0) {
      parsed[scopeKey] = trimRecords(valid)
    }
  }
  return parsed
}

export function extractProjectUsageRecords(
  recordsByScope: Record<string, LlmUsageRecord[]>,
  projectPath: string,
): Record<string, LlmUsageRecord[]> {
  const prefix = projectScopePrefix(projectPath)
  const result: Record<string, LlmUsageRecord[]> = {}
  for (const [scopeKey, records] of Object.entries(recordsByScope)) {
    if (!scopeKey.startsWith(prefix) || records.length === 0) continue
    result[scopeKey] = records
  }
  return result
}

export async function loadLlmUsageRecords(projectPath: string): Promise<Record<string, LlmUsageRecord[]>> {
  const filePath = usageFilePath(projectPath)
  try {
    if (!(await fileExists(filePath))) return {}
    const raw = JSON.parse(await readFile(filePath)) as unknown
    return remapProjectUsageScopeKeys(parsePersistedFile(raw), projectPath)
  } catch {
    return {}
  }
}

export async function saveLlmUsageRecords(
  projectPath: string,
  recordsByScope: Record<string, LlmUsageRecord[]>,
): Promise<void> {
  const pp = normalizePath(projectPath)
  await createDirectory(`${pp}/.qmai`)
  const payload: PersistedLlmUsageFile = {
    version: PERSIST_VERSION,
    recordsByScope,
  }
  await writeFile(usageFilePath(pp), JSON.stringify(payload, null, 2))
}

export async function persistLlmUsageForProject(projectPath: string): Promise<void> {
  const { useLlmUsageStore } = await import("@/stores/llm-usage-store")
  const recordsByScope = extractProjectUsageRecords(
    useLlmUsageStore.getState().recordsByScope,
    projectPath,
  )
  await saveLlmUsageRecords(projectPath, recordsByScope)
}

let persistTimer: ReturnType<typeof setTimeout> | null = null
let pendingProjectPath: string | null = null

export function schedulePersistLlmUsage(projectPath: string): void {
  pendingProjectPath = normalizePath(projectPath)
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    void flushPersistLlmUsage()
  }, 400)
}

export async function flushActiveProjectLlmUsage(): Promise<void> {
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  const projectPath = pendingProjectPath ?? (await import("@/stores/llm-usage-store")).useLlmUsageStore.getState().activeProjectPath
  pendingProjectPath = null
  if (!projectPath) return
  await persistLlmUsageForProject(projectPath)
}

async function flushPersistLlmUsage(): Promise<void> {
  const projectPath = pendingProjectPath
  pendingProjectPath = null
  if (!projectPath) return
  await persistLlmUsageForProject(projectPath)
}

export function syncLlmUsageRecordCounter(recordsByScope: Record<string, LlmUsageRecord[]>): number {
  let max = 0
  for (const records of Object.values(recordsByScope)) {
    for (const record of records) {
      const match = /^llm-usage-(\d+)$/.exec(record.id)
      if (match) max = Math.max(max, Number(match[1]))
    }
  }
  return max
}
