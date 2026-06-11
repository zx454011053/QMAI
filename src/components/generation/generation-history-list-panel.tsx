import { History, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProjectHistoryRecords, getProjectHistoryScopeKey } from "@/lib/llm-usage"
import { useLlmUsageStore } from "@/stores/llm-usage-store"
import { useWikiStore } from "@/stores/wiki-store"
import { formatUsageRecordSummary } from "@/components/llm/usage-record-detail"
import { useTranslation } from "react-i18next"

interface GenerationHistoryListProps {
  showHeader?: boolean
}

export function GenerationHistoryList({ showHeader = true }: GenerationHistoryListProps) {
  const { t } = useTranslation()
  const project = useWikiStore((s) => s.project)
  const selectedId = useWikiStore((s) => s.selectedGenerationHistoryId)
  const setSelectedId = useWikiStore((s) => s.setSelectedGenerationHistoryId)
  const recordsByScope = useLlmUsageStore((s) => s.recordsByScope)
  const clearScope = useLlmUsageStore((s) => s.clearScope)
  const records = project ? getProjectHistoryRecords(recordsByScope, project.path) : []
  const scopeKey = project ? getProjectHistoryScopeKey(recordsByScope, project.path) : ""

  const sortedRecords = [...records].reverse()

  const handleClear = () => {
    if (!scopeKey) return
    clearScope(scopeKey)
    setSelectedId(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showHeader ? (
        <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">{t("generationHistory.title")}</div>
            <div className="truncate text-[11px] text-muted-foreground">{t("generationHistory.subtitle")}</div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            disabled={records.length === 0}
            onClick={handleClear}
            title={t("generationHistory.clear")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {sortedRecords.length === 0 ? (
          <div className="px-1 py-8 text-center text-xs text-muted-foreground">
            {t("generationHistory.empty")}
          </div>
        ) : (
          <div className="space-y-1">
            {sortedRecords.map((record) => {
              const { timeLabel, durationLabel } = formatUsageRecordSummary(record)
              return (
                <Button
                  key={record.id}
                  type="button"
                  variant={selectedId === record.id ? "secondary" : "ghost"}
                  className="h-auto w-full justify-start px-3 py-2.5"
                  onClick={() => setSelectedId(record.id)}
                >
                  <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                    <span className="flex w-full min-w-0 items-center gap-2 text-sm font-medium">
                      <History className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{record.label}</span>
                      {record.error ? (
                        <span className="shrink-0 rounded bg-destructive/10 px-1 py-0.5 text-[10px] text-destructive">
                          {t("generationHistory.failed")}
                        </span>
                      ) : null}
                    </span>
                    <span className="pl-6 text-[11px] text-muted-foreground">
                      {timeLabel}
                      {record.durationMs != null ? ` · ${durationLabel}` : ""}
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function GenerationHistoryListPanel() {
  return <GenerationHistoryList showHeader />
}
