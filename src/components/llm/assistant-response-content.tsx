import { useMemo } from "react"
import { separateThinking } from "@/lib/thinking-content"
import { ThinkingBlock } from "@/components/llm/thinking-block"

interface AssistantResponseContentProps {
  content: string
  className?: string
}

export function AssistantResponseContent({ content, className }: AssistantResponseContentProps) {
  const { thinking, answer } = useMemo(() => separateThinking(content), [content])

  return (
    <div className={className ?? "space-y-2"}>
      {thinking ? <ThinkingBlock content={thinking} /> : null}
      {answer ? (
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words px-2 py-2 text-xs text-foreground">
          {answer}
        </pre>
      ) : thinking ? (
        <p className="px-2 py-1 text-xs text-muted-foreground">模型仅返回思考过程，无正文内容。</p>
      ) : null}
    </div>
  )
}
