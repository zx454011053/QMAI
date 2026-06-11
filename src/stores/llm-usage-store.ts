import { create } from "zustand"
import { normalizePath } from "@/lib/path-utils"
import {
  schedulePersistLlmUsage,
  syncLlmUsageRecordCounter,
} from "@/lib/llm-usage-storage"
import { remapProjectUsageScopeKeys, trimRecords, type LlmUsageRecord } from "@/lib/llm-usage"

interface LlmUsageState {
  recordsByScope: Record<string, LlmUsageRecord[]>
  activeProjectPath: string | null
  addRecord: (scopeKey: string, record: Omit<LlmUsageRecord, "id" | "timestamp">) => void
  getRecords: (scopeKey: string) => LlmUsageRecord[]
  clearScope: (scopeKey: string) => void
  hydrateForProject: (projectPath: string, recordsByScope: Record<string, LlmUsageRecord[]>) => void
  resetAll: () => void
}

let recordCounter = 0

function maybePersist(scopeKey: string, activeProjectPath: string | null) {
  if (!activeProjectPath) return
  if (scopeKey.startsWith(`${activeProjectPath}::`)) {
    schedulePersistLlmUsage(activeProjectPath)
  }
}

export const useLlmUsageStore = create<LlmUsageState>((set, get) => ({
  recordsByScope: {},
  activeProjectPath: null,

  addRecord: (scopeKey, record) => {
    const activeProjectPath = get().activeProjectPath
    set((state) => {
      const existing = state.recordsByScope[scopeKey] ?? []
      const nextRecord: LlmUsageRecord = {
        ...record,
        id: `llm-usage-${++recordCounter}`,
        timestamp: Date.now(),
      }
      return {
        recordsByScope: {
          ...state.recordsByScope,
          [scopeKey]: trimRecords([...existing, nextRecord]),
        },
      }
    })
    maybePersist(scopeKey, activeProjectPath)
  },

  getRecords: (scopeKey) => get().recordsByScope[scopeKey] ?? [],

  clearScope: (scopeKey) => {
    const activeProjectPath = get().activeProjectPath
    set((state) => {
      const next = { ...state.recordsByScope }
      delete next[scopeKey]
      return { recordsByScope: next }
    })
    maybePersist(scopeKey, activeProjectPath)
  },

  hydrateForProject: (projectPath, recordsByScope) => {
    const pp = normalizePath(projectPath)
    const prefix = `${pp}::`
    const normalizedRecords = remapProjectUsageScopeKeys(recordsByScope, pp)
    recordCounter = Math.max(recordCounter, syncLlmUsageRecordCounter(normalizedRecords))
    set((state) => {
      const next = { ...state.recordsByScope }
      for (const key of Object.keys(next)) {
        if (key.startsWith(prefix)) delete next[key]
      }
      return {
        activeProjectPath: pp,
        recordsByScope: { ...next, ...normalizedRecords },
      }
    })
  },

  resetAll: () => set({ recordsByScope: {}, activeProjectPath: null }),
}))
