import type { ContentBlock } from "@/lib/llm-providers"
import type { UsageData } from "@/lib/llm-client"
import { normalizePath } from "@/lib/path-utils"

export type LlmUsageScope = "outline" | "chapter"

export interface LlmUsageMessage {
  role: string
  content: string
}

export interface LlmUsageRecord {
  id: string
  timestamp: number
  label: string
  model: string
  provider: string
  messages: LlmUsageMessage[]
  response?: string
  filePath?: string
  usage?: UsageData
  error?: string
  durationMs?: number
}

export interface LlmUsageTracking {
  projectPath: string
  label: string
  filePath?: string
  /** @deprecated Kept for call-site compatibility; not used for storage. */
  scope?: LlmUsageScope
}

const MAX_RECORDS_PER_SCOPE = 200

export function makeLlmUsageScopeKey(projectPath: string, filePath: string): string {
  return `${normalizePath(projectPath)}::${normalizePath(filePath)}`
}

const PROJECT_HISTORY_SCOPE_SUFFIX = "__generation_history__"

export function makeProjectHistoryScopeKey(projectPath: string): string {
  return `${normalizePath(projectPath)}::${PROJECT_HISTORY_SCOPE_SUFFIX}`
}

function findProjectHistoryScopeKey(
  recordsByScope: Record<string, LlmUsageRecord[]>,
  projectPath: string,
): string | null {
  const exactKey = makeProjectHistoryScopeKey(projectPath)
  if (recordsByScope[exactKey]) return exactKey

  const suffix = `::${PROJECT_HISTORY_SCOPE_SUFFIX}`
  for (const key of Object.keys(recordsByScope)) {
    if (key.endsWith(suffix)) return key
  }
  return null
}

export function getProjectHistoryScopeKey(
  recordsByScope: Record<string, LlmUsageRecord[]>,
  projectPath: string,
): string {
  return findProjectHistoryScopeKey(recordsByScope, projectPath) ?? makeProjectHistoryScopeKey(projectPath)
}

export function getProjectHistoryRecords(
  recordsByScope: Record<string, LlmUsageRecord[]>,
  projectPath: string,
): LlmUsageRecord[] {
  const scopeKey = findProjectHistoryScopeKey(recordsByScope, projectPath)
  return scopeKey ? recordsByScope[scopeKey] ?? [] : []
}

export function remapProjectUsageScopeKeys(
  recordsByScope: Record<string, LlmUsageRecord[]>,
  projectPath: string,
): Record<string, LlmUsageRecord[]> {
  const pp = normalizePath(projectPath)
  const remapped: Record<string, LlmUsageRecord[]> = {}

  for (const [scopeKey, records] of Object.entries(recordsByScope)) {
    const separator = scopeKey.indexOf("::")
    if (separator < 0) continue
    const scopePart = scopeKey.slice(separator + 2)
    remapped[`${pp}::${scopePart}`] = records
  }

  return remapped
}

export function serializeMessageContent(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content
  return content
    .map((block) => {
      if (block.type === "text") return block.text
      return `[image:${block.mediaType}]`
    })
    .join("\n")
}

export function formatTokenCount(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return value.toLocaleString()
}

export function formatCacheHitSummary(usage: UsageData | undefined): string | null {
  if (!usage) return null
  const hit = usage.promptCacheHitTokens
  const miss = usage.promptCacheMissTokens
  if (hit == null && miss == null) return null
  const hitCount = hit ?? 0
  const missCount = miss ?? 0
  const total = hitCount + missCount
  if (total <= 0) return null
  const rate = ((hitCount / total) * 100).toFixed(1)
  return `缓存命中 ${rate}%（${formatTokenCount(hitCount)} / ${formatTokenCount(total)}）`
}

export function trimRecords(records: LlmUsageRecord[]): LlmUsageRecord[] {
  if (records.length <= MAX_RECORDS_PER_SCOPE) return records
  return records.slice(records.length - MAX_RECORDS_PER_SCOPE)
}

export function inferLlmUsageScope(filePath: string): LlmUsageScope | null {
  const normalized = filePath.replace(/\\/g, "/")
  if (normalized.includes("/wiki/chapters/")) return "chapter"
  if (normalized.includes("/wiki/outlines/")) return "outline"
  return null
}

export function buildLlmUsageTracking(
  projectPath: string,
  label: string,
  filePath?: string,
): LlmUsageTracking {
  return {
    projectPath,
    label,
    filePath,
  }
}

export function buildLlmUsageTrackingFromFile(
  projectPath: string,
  filePath: string,
  label: string,
): LlmUsageTracking | undefined {
  const scope = inferLlmUsageScope(filePath)
  if (!scope) return undefined
  return {
    projectPath,
    filePath,
    scope,
    label,
  }
}
