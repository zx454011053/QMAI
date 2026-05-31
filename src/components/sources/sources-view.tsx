import { useState } from "react"
import { Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useWikiStore } from "@/stores/wiki-store"
import { OutlineGeneratorDialog, type OutlineGeneratorMode } from "@/components/sources/outline-generator-dialog"
import { PreviewPanel } from "@/components/layout/preview-panel"

export function SourcesView() {
  const { t } = useTranslation()
  const novelMode = useWikiStore((s) => s.novelMode)
  const [outlineDialogOpen, setOutlineDialogOpen] = useState(false)
  const [outlineDialogMode, setOutlineDialogMode] = useState<OutlineGeneratorMode>("outline")

  function openOutlineDialog(mode: OutlineGeneratorMode) {
    setOutlineDialogMode(mode)
    setOutlineDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{t(novelMode ? "novel.sources.title" : "sources.title")}</h2>
        <div className="flex flex-wrap gap-1">
          {novelMode ? (
            <Button size="sm" onClick={() => openOutlineDialog("outline")}>
              <Sparkles className="mr-1 h-4 w-4" />
              {t("novel.outlineGenerator.title")}
            </Button>
          ) : null}
          {novelMode ? (
            <Button size="sm" variant="outline" onClick={() => openOutlineDialog("refine")}>
              {t("novel.outlineGenerator.refineTitle")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <PreviewPanel />
      </div>

      <OutlineGeneratorDialog
        open={outlineDialogOpen}
        onOpenChange={setOutlineDialogOpen}
        mode={outlineDialogMode}
      />
    </div>
  )
}
