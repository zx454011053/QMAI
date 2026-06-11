import {
  formatCacheHitSummary,
  formatTokenCount,
  type LlmUsageRecord,
} from "@/lib/llm-usage"
import { AssistantResponseContent } from "@/components/llm/assistant-response-content"

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function formatDuration(durationMs: number | undefined): string {
  if (durationMs == null) return "—"
  if (durationMs < 1000) return `${durationMs}ms`
  return `${(durationMs / 1000).toFixed(1)}s`
}

function MessageBlock({ role, content }: { role: string; content: string }) {
  return (
    <div className="rounded border border-border/50 bg-background/80">
      <div className="border-b border-border/40 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {role}
      </div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words px-2 py-2 text-xs text-foreground">
        {content}
      </pre>
    </div>
  )
}

export function UsageRecordDetail({ record }: { record: LlmUsageRecord }) {
  const cacheSummary = formatCacheHitSummary(record.usage)
  const promptTokens = record.usage?.promptTokens
  const completionTokens = record.usage?.completionTokens
  const totalTokens =
    promptTokens != null || completionTokens != null
      ? (promptTokens ?? 0) + (completionTokens ?? 0)
      : undefined

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <div className="text-[11px] text-muted-foreground">功能</div>
          <div className="mt-0.5 text-sm font-medium text-foreground">{record.label}</div>
        </div>
        <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <div className="text-[11px] text-muted-foreground">请求时间</div>
          <div className="mt-0.5 text-sm text-foreground">{formatTimestamp(record.timestamp)}</div>
        </div>
        <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <div className="text-[11px] text-muted-foreground">耗时</div>
          <div className="mt-0.5 text-sm text-foreground">{formatDuration(record.durationMs)}</div>
        </div>
        <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <div className="text-[11px] text-muted-foreground">模型</div>
          <div className="mt-0.5 truncate text-sm text-foreground">
            {record.provider} / {record.model}
          </div>
        </div>
      </div>

      {record.filePath ? (
        <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2">
          <div className="text-[11px] text-muted-foreground">关联文件</div>
          <div className="mt-0.5 truncate font-mono text-xs text-foreground">
            {record.filePath.replace(/\\/g, "/")}
          </div>
        </div>
      ) : null}

      <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2">
        <div className="text-[11px] text-muted-foreground">用量</div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground">
          <span>输入 {formatTokenCount(promptTokens)}</span>
          <span>输出 {formatTokenCount(completionTokens)}</span>
          <span>合计 {formatTokenCount(totalTokens)}</span>
        </div>
        {cacheSummary ? (
          <div className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">{cacheSummary}</div>
        ) : (
          <div className="mt-1 text-xs text-muted-foreground">暂无缓存命中统计</div>
        )}
      </div>

      {record.error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2">
          <div className="text-[11px] text-destructive">错误</div>
          <p className="mt-1 text-sm text-destructive">{record.error}</p>
        </div>
      ) : null}

      <div>
        <div className="mb-2 text-sm font-medium text-foreground">发送的请求 / 提示词</div>
        <div className="space-y-2">
          {record.messages.map((message, index) => (
            <MessageBlock key={`${record.id}-req-${index}`} role={message.role} content={message.content} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-foreground">收到的返回</div>
        {record.response ? (
          <div className="rounded border border-border/50 bg-background/80">
            <div className="border-b border-border/40 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              assistant
            </div>
            <AssistantResponseContent content={record.response} className="space-y-2 px-2 py-2" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无返回内容（可能请求失败或未记录）</p>
        )}
      </div>
    </div>
  )
}

export function formatUsageRecordSummary(record: LlmUsageRecord): {
  timeLabel: string
  durationLabel: string
} {
  return {
    timeLabel: formatTimestamp(record.timestamp),
    durationLabel: formatDuration(record.durationMs),
  }
}
