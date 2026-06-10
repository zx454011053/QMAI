import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, BarChart3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  formatCacheHitSummary,
  formatTokenCount,
  makeLlmUsageScopeKey,
  type LlmUsageRecord,
} from "@/lib/llm-usage"
import { useLlmUsageStore } from "@/stores/llm-usage-store"

interface LlmUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectPath: string
  filePath: string
  title?: string
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function UsageRecordRow({ record }: { record: LlmUsageRecord }) {
  const [expanded, setExpanded] = useState(false)
  const cacheSummary = formatCacheHitSummary(record.usage)
  const promptTokens = record.usage?.promptTokens
  const completionTokens = record.usage?.completionTokens
  const totalTokens =
    promptTokens != null || completionTokens != null
      ? (promptTokens ?? 0) + (completionTokens ?? 0)
      : undefined

  return (
    <div className="rounded-md border border-border/70 bg-muted/20">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-accent/40"
      >
        {expanded ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-foreground">{record.label}</span>
            {record.error ? (
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] text-destructive">
                失败
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {formatTimestamp(record.timestamp)}
            {record.durationMs != null ? ` · ${(record.durationMs / 1000).toFixed(1)}s` : ""}
            {record.model ? ` · ${record.model}` : ""}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground/80">
            <span>输入 {formatTokenCount(promptTokens)}</span>
            <span>输出 {formatTokenCount(completionTokens)}</span>
            <span>合计 {formatTokenCount(totalTokens)}</span>
            {cacheSummary ? <span className="text-emerald-700 dark:text-emerald-400">{cacheSummary}</span> : null}
          </div>
          {record.error ? (
            <p className="mt-1 text-xs text-destructive">{record.error}</p>
          ) : null}
        </div>
      </button>
      {expanded ? (
        <div className="space-y-2 border-t border-border/60 px-3 py-2">
          {record.messages.map((message, index) => (
            <div key={`${record.id}-${index}`} className="rounded border border-border/50 bg-background/80">
              <div className="border-b border-border/40 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {message.role}
              </div>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words px-2 py-2 text-xs text-foreground">
                {message.content}
              </pre>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function LlmUsageDialog({
  open,
  onOpenChange,
  projectPath,
  filePath,
  title = "LLM 用量",
}: LlmUsageDialogProps) {
  const scopeKey = makeLlmUsageScopeKey(projectPath, filePath)
  const records = useLlmUsageStore((s) => s.recordsByScope[scopeKey] ?? [])
  const clearScope = useLlmUsageStore((s) => s.clearScope)

  const totals = useMemo(() => {
    let promptTokens = 0
    let completionTokens = 0
    let cacheHit = 0
    let cacheMiss = 0
    let hasUsage = false

    for (const record of records) {
      if (record.error) continue
      const usage = record.usage
      if (!usage) continue
      hasUsage = true
      promptTokens += usage.promptTokens ?? 0
      completionTokens += usage.completionTokens ?? 0
      cacheHit += usage.promptCacheHitTokens ?? 0
      cacheMiss += usage.promptCacheMissTokens ?? 0
    }

    return {
      hasUsage,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      cacheSummary: formatCacheHitSummary({
        promptCacheHitTokens: cacheHit,
        promptCacheMissTokens: cacheMiss,
      }),
    }
  }, [records])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {title}
          </DialogTitle>
          <DialogDescription className="truncate text-xs">
            {filePath.replace(/\\/g, "/")}
          </DialogDescription>
        </DialogHeader>

        <div className="border-b px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>请求次数 <strong>{records.length}</strong></span>
            {totals.hasUsage ? (
              <>
                <span>累计输入 {formatTokenCount(totals.promptTokens)}</span>
                <span>累计输出 {formatTokenCount(totals.completionTokens)}</span>
                <span>累计合计 {formatTokenCount(totals.totalTokens)}</span>
                {totals.cacheSummary ? (
                  <span className="text-emerald-700 dark:text-emerald-400">{totals.cacheSummary}</span>
                ) : null}
              </>
            ) : (
              <span className="text-muted-foreground">暂无 token 统计（部分模型不返回 usage）</span>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              当前文件还没有记录到 LLM 请求。
            </p>
          ) : (
            <div className="space-y-2">
              {[...records].reverse().map((record) => (
                <UsageRecordRow key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={records.length === 0}
            onClick={() => clearScope(scopeKey)}
          >
            清空记录
          </Button>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
