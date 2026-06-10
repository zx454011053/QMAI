import { create } from "zustand"
import { trimRecords, type LlmUsageRecord } from "@/lib/llm-usage"

interface LlmUsageState {
  recordsByScope: Record<string, LlmUsageRecord[]>
  addRecord: (scopeKey: string, record: Omit<LlmUsageRecord, "id" | "timestamp">) => void
  getRecords: (scopeKey: string) => LlmUsageRecord[]
  clearScope: (scopeKey: string) => void
}

let recordCounter = 0

export const useLlmUsageStore = create<LlmUsageState>((set, get) => ({
  recordsByScope: {},

  addRecord: (scopeKey, record) =>
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
    }),

  getRecords: (scopeKey) => get().recordsByScope[scopeKey] ?? [],

  clearScope: (scopeKey) =>
    set((state) => {
      const next = { ...state.recordsByScope }
      delete next[scopeKey]
      return { recordsByScope: next }
    }),
}))
