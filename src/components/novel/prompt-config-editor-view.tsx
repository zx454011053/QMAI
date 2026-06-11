import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { RotateCcw, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PROMPT_CONFIG_META,
  validateAllCustomPrompts,
  validateCustomPromptVariableName,
} from "@/lib/novel/prompt-config-defaults"
import { usePromptConfigStore } from "@/stores/prompt-config-store"

function insertAtCursor(textarea: HTMLTextAreaElement, text: string): number {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  textarea.value = value.slice(0, start) + text + value.slice(end)
  const nextPos = start + text.length
  textarea.selectionStart = nextPos
  textarea.selectionEnd = nextPos
  return nextPos
}

function PromptConfigSaveHeader({
  title,
  description,
  saving,
  dirty,
  onSave,
  onResetAll,
  extraActions,
}: {
  title: string
  description?: string
  saving: boolean
  dirty: boolean
  onSave: () => void
  onResetAll?: () => void
  extraActions?: React.ReactNode
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
      <div className="min-w-0">
        <div className="text-base font-semibold text-foreground">{title}</div>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {extraActions}
        {onResetAll ? (
          <Button type="button" size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={onResetAll}>
            全部重置
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          className="h-8 px-3 text-xs"
          disabled={saving || !dirty}
          onClick={() => void onSave()}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {saving ? "保存中" : "保存"}
        </Button>
      </div>
    </div>
  )
}

function BuiltinPromptEditor({
  saving,
  saveMessage,
  onSave,
}: {
  saving: boolean
  saveMessage: string | null
  onSave: () => void
}) {
  const selected = usePromptConfigStore((s) => s.selected)
  const config = usePromptConfigStore((s) => s.config)
  const customPrompts = usePromptConfigStore((s) => s.customPrompts)
  const dirty = usePromptConfigStore((s) => s.dirty)
  const updateTemplate = usePromptConfigStore((s) => s.updateTemplate)
  const resetTemplate = usePromptConfigStore((s) => s.resetTemplate)
  const resetAll = usePromptConfigStore((s) => s.resetAll)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPos, setCursorPos] = useState<number | null>(null)

  const selectedKey = selected.kind === "builtin" ? selected.key : "outlineGeneration"
  const meta = useMemo(
    () => PROMPT_CONFIG_META.find((item) => item.key === selectedKey) ?? PROMPT_CONFIG_META[0],
    [selectedKey],
  )

  function handleInsertVariable(variableName: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const token = `{{${variableName}}}`
    const nextPos = insertAtCursor(textarea, token)
    updateTemplate(selectedKey, textarea.value)
    setCursorPos(nextPos)
  }

  useLayoutEffect(() => {
    if (cursorPos == null || !textareaRef.current) return
    textareaRef.current.focus()
    textareaRef.current.selectionStart = cursorPos
    textareaRef.current.selectionEnd = cursorPos
    setCursorPos(null)
  }, [cursorPos, config[selectedKey]])

  return (
    <>
      <PromptConfigSaveHeader
        title={meta.label}
        description={meta.description}
        saving={saving}
        dirty={dirty}
        onSave={onSave}
        onResetAll={() => resetAll()}
      />

      {saveMessage ? (
        <div className="border-b px-4 py-2 text-xs text-muted-foreground">{saveMessage}</div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-3">
            <div className="text-xs font-medium text-muted-foreground">系统变量</div>
            <ul className="mt-2 space-y-2">
              {meta.variables.map((variable) => (
                <li key={variable.name} className="text-xs leading-relaxed">
                  <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">
                    {`{{${variable.name}}}`}
                  </code>
                  <span className="ml-2 text-muted-foreground">{variable.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {customPrompts.length > 0 ? (
            <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-3">
              <div className="text-xs font-medium text-muted-foreground">自定义变量（点击插入模板）</div>
              <ul className="mt-2 space-y-2">
                {customPrompts.map((item) => (
                  <li key={item.id} className="text-xs leading-relaxed">
                    <button
                      type="button"
                      onClick={() => handleInsertVariable(item.variableName)}
                      className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground transition-colors hover:bg-accent"
                      title="插入到模板"
                    >
                      {`{{${item.variableName}}}`}
                    </button>
                    <span className="ml-2 text-muted-foreground">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">模板内容</Label>
              <button
                type="button"
                onClick={() => resetTemplate(selectedKey)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                恢复默认
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={config[selectedKey]}
              onChange={(event) => updateTemplate(selectedKey, event.target.value)}
              className="min-h-[480px] w-full resize-y rounded-md border bg-background px-3 py-3 font-mono text-sm leading-relaxed outline-none focus:ring-1 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function CustomPromptEditor({
  saving,
  saveMessage,
  onSave,
}: {
  saving: boolean
  saveMessage: string | null
  onSave: () => void
}) {
  const selected = usePromptConfigStore((s) => s.selected)
  const customPrompts = usePromptConfigStore((s) => s.customPrompts)
  const dirty = usePromptConfigStore((s) => s.dirty)
  const updateCustomPrompt = usePromptConfigStore((s) => s.updateCustomPrompt)
  const removeCustomPrompt = usePromptConfigStore((s) => s.removeCustomPrompt)

  const item = useMemo(() => {
    if (selected.kind !== "custom") return null
    return customPrompts.find((entry) => entry.id === selected.id) ?? null
  }, [customPrompts, selected])

  const variableError = useMemo(() => {
    if (!item) return null
    return validateCustomPromptVariableName(item.variableName, customPrompts, item.id)
  }, [customPrompts, item])

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        请从左侧选择或新建自定义提示词
      </div>
    )
  }

  return (
    <>
      <PromptConfigSaveHeader
        title={item.name || "自定义提示词"}
        description="定义可复用的提示词片段，在系统模板中通过变量名引用"
        saving={saving}
        dirty={dirty && !variableError}
        onSave={onSave}
        extraActions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs text-destructive hover:text-destructive"
            onClick={() => removeCustomPrompt(item.id)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            删除
          </Button>
        }
      />

      {saveMessage ? (
        <div className="border-b px-4 py-2 text-xs text-muted-foreground">{saveMessage}</div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="custom-prompt-name" className="text-sm">
                名称
              </Label>
              <Input
                id="custom-prompt-name"
                value={item.name}
                onChange={(event) => updateCustomPrompt(item.id, { name: event.target.value })}
                placeholder="例如：写作风格要求"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-prompt-variable" className="text-sm">
                变量名（英文）
              </Label>
              <Input
                id="custom-prompt-variable"
                value={item.variableName}
                onChange={(event) =>
                  updateCustomPrompt(item.id, { variableName: event.target.value.replace(/\s/g, "") })
                }
                placeholder="例如：writingStyleGuide"
                className="font-mono"
                spellCheck={false}
              />
              {variableError ? (
                <p className="text-xs text-destructive">{variableError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  在系统提示词中使用{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">{`{{${item.variableName || "variableName"}}}`}</code>{" "}
                  引用；仅支持英文字母、数字、下划线
                </p>
              )}
            </div>
          </div>

          <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
            变量名须以英文字母开头，仅可包含英文字母、数字、下划线。
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-prompt-content" className="text-sm">
              内容
            </Label>
            <textarea
              id="custom-prompt-content"
              value={item.content}
              onChange={(event) => updateCustomPrompt(item.id, { content: event.target.value })}
              className="min-h-[480px] w-full resize-y rounded-md border bg-background px-3 py-3 font-mono text-sm leading-relaxed outline-none focus:ring-1 focus:ring-ring"
              spellCheck={false}
              placeholder="输入要插入到系统提示词中的内容..."
            />
          </div>
        </div>
      </div>
    </>
  )
}

export function PromptConfigEditorView() {
  const selected = usePromptConfigStore((s) => s.selected)
  const customPrompts = usePromptConfigStore((s) => s.customPrompts)
  const save = usePromptConfigStore((s) => s.save)

  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  async function handleSave() {
    const validationError = validateAllCustomPrompts(customPrompts)
    if (validationError) {
      setSaveMessage(validationError)
      return
    }

    setSaving(true)
    setSaveMessage(null)
    try {
      await save()
      setSaveMessage("已保存")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setSaveMessage(`保存失败：${message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {selected.kind === "custom" ? (
        <CustomPromptEditor saving={saving} saveMessage={saveMessage} onSave={() => void handleSave()} />
      ) : (
        <BuiltinPromptEditor saving={saving} saveMessage={saveMessage} onSave={() => void handleSave()} />
      )}
    </div>
  )
}
