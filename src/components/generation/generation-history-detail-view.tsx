import { useEffect } from "react"
import { History, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UsageRecordDetail } from "@/components/llm/usage-record-detail"
import { getProjectHistoryRecords, getProjectHistoryScopeKey } from "@/lib/llm-usage"
import { useLlmUsageStore } from "@/stores/llm-usage-store"
import { useWikiStore } from "@/stores/wiki-store"
import { GenerationHistoryList } from "@/components/generation/generation-history-list-panel"
import { useTranslation } from "react-i18next"

export function GenerationHistoryView() {
  const { t } = useTranslation()
  const project = useWikiStore((s) => s.project)
  const activeView = useWikiStore((s) => s.activeView)
  const selectedId = useWikiStore((s) => s.selectedGenerationHistoryId)
  const setSelectedId = useWikiStore((s) => s.setSelectedGenerationHistoryId)
  const recordsByScope = useLlmUsageStore((s) => s.recordsByScope)
  const clearScope = useLlmUsageStore((s) => s.clearScope)
  const records = project ? getProjectHistoryRecords(recordsByScope, project.path) : []
  const scopeKey = project ? getProjectHistoryScopeKey(recordsByScope, project.path) : ""
  const record = selectedId ? records.find((item) => item.id === selectedId) : undefined

  useEffect(() => {
    if (activeView !== "generationHistory" || records.length === 0) return
    if (selectedId && records.some((item) => item.id === selectedId)) return
    setSelectedId(records[records.length - 1].id)
  }, [activeView, records, selectedId, setSelectedId])

  const handleClear = () => {
    if (!scopeKey) return
    clearScope(scopeKey)
    setSelectedId(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-foreground">{t("generationHistory.title")}</div>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("generationHistory.subtitle")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 px-3 text-xs"
          disabled={records.length === 0}
          onClick={handleClear}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {t("generationHistory.clear")}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex w-72 shrink-0 flex-col border-r bg-muted/15">
          <GenerationHistoryList showHeader={false} />
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          {!record ? (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
              <History className="h-10 w-10 opacity-40" />
              <p className="text-sm">{t("generationHistory.selectHint")}</p>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b px-4 py-3">
                <div className="text-base font-semibold text-foreground">{record.label}</div>
                <p className="mt-0.5 text-sm text-muted-foreground">{t("generationHistory.detailSubtitle")}</p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <UsageRecordDetail record={record} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** @deprecated Use GenerationHistoryView */
export function GenerationHistoryDetailView() {
  return <GenerationHistoryView />
}
