import { useState } from "react"

interface ThinkingBlockProps {
  content: string
  /** Defaults to Chinese copy for generation history / novel UI. */
  label?: (lineCount: number) => string
}

export function ThinkingBlock({ content, label }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const lines = content.split("\n").filter((line) => line.trim())
  const summary = label ? label(lines.length) : `思考过程 · ${lines.length} 行`

  return (
    <div className="rounded-md border border-dashed border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs text-amber-700 transition-colors hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-900/20"
      >
        <span className="text-sm">💭</span>
        <span className="font-medium">{summary}</span>
        <span className="text-amber-600/60 dark:text-amber-500/60">{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded ? (
        <div className="max-h-64 overflow-y-auto border-t border-amber-500/20 px-2.5 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap text-amber-800/80 dark:text-amber-300/70">
          {content}
        </div>
      ) : null}
    </div>
  )
}
