import { Plus, ScrollText, Variable } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PROMPT_CONFIG_META } from "@/lib/novel/prompt-config-defaults"
import { usePromptConfigStore } from "@/stores/prompt-config-store"

export function PromptConfigListPanel() {
  const selected = usePromptConfigStore((s) => s.selected)
  const customPrompts = usePromptConfigStore((s) => s.customPrompts)
  const setSelected = usePromptConfigStore((s) => s.setSelected)
  const addCustomPrompt = usePromptConfigStore((s) => s.addCustomPrompt)

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b px-3 py-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">提示词</div>
          <div className="truncate text-[11px] text-muted-foreground">按项目保存，支持 {"{{变量}}"} 占位符</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-1">
          {PROMPT_CONFIG_META.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={selected.kind === "builtin" && selected.key === item.key ? "secondary" : "ghost"}
              className="h-auto w-full justify-start px-3 py-2.5"
              onClick={() => setSelected({ kind: "builtin", key: item.key })}
            >
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <ScrollText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{item.label}</span>
              </span>
            </Button>
          ))}
        </div>

        <div className="my-3 border-t" />

        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-xs font-medium text-muted-foreground">自定义</div>
          <button
            type="button"
            onClick={() => addCustomPrompt()}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="新建自定义提示词"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {customPrompts.length === 0 ? (
          <div className="px-1 py-2 text-xs text-muted-foreground">暂无自定义提示词</div>
        ) : (
          <div className="space-y-1">
            {customPrompts.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={selected.kind === "custom" && selected.id === item.id ? "secondary" : "ghost"}
                className="h-auto w-full justify-start px-3 py-2.5"
                onClick={() => setSelected({ kind: "custom", id: item.id })}
              >
                <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                  <span className="flex w-full min-w-0 items-center gap-2 text-sm font-medium">
                    <Variable className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="pl-6 font-mono text-[11px] text-muted-foreground">{`{{${item.variableName}}}`}</span>
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
