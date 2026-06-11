import { buildLanguageDirective } from "@/lib/output-language"
import { usePromptConfigStore } from "@/stores/prompt-config-store"
import type { PromptConfigKey } from "./prompt-config-defaults"
import { renderPromptTemplate } from "./prompt-config-storage"

/** Per-volume chapter count guidance by novel word-count scale. */
function volumeChapterRangeForScale(scale: string): string {
  const s = scale.trim().toLowerCase()
  if (!s) return "每卷 10-20 章"

  if (s === "epic" || s.includes("200万") || s.includes("超长篇")) {
    return "每卷 25-50 章"
  }
  if (s === "long" || s.includes("100万") || (s.includes("长篇") && !s.includes("超长篇"))) {
    return "每卷 15-30 章"
  }
  return "每卷 10-20 章"
}

function render(key: PromptConfigKey, vars: Record<string, string>): string {
  const state = usePromptConfigStore.getState()
  return renderPromptTemplate(state.getTemplate(key), vars, state.customPrompts)
}

export const PROMPTS = {
  chapterGeneration: (contextPack: string, chapterGoal: string) =>
    render("chapterGeneration", {
      contextPack,
      chapterGoal,
    }),

  chapterContinuation: (contextPack: string, lastParagraph: string) =>
    render("chapterContinuation", {
      contextPack,
      lastParagraph,
    }),

  chapterRevision: (contextPack: string, originalContent: string, revisionNotes: string) =>
    render("chapterRevision", {
      contextPack,
      originalContent: originalContent.slice(0, 6000),
      revisionNotes,
    }),

  outlineGeneration: (genre: string, scale: string, premise: string, context = "") =>
    render("outlineGeneration", {
      genre,
      scale,
      premise,
      context: context || "暂无可用的剧情记忆、卡片故事或设定，请基于本次大纲提示词先生成初始版大纲。",
      languageDirective: buildLanguageDirective(premise),
      volumeChapterRange: volumeChapterRangeForScale(scale),
    }),

  outlineRefinementGeneration: (outlineContext: string, sectionHints: string, userRequest: string) =>
    render("outlineRefinementGeneration", {
      outlineContext,
      sectionHints,
      userRequest: userRequest.trim() || "未额外指定，请基于已有大纲与项目记忆完成全量细化。",
      languageDirective: buildLanguageDirective(userRequest || outlineContext),
    }),

  outlineSectionRefinement: (
    context: string,
    userRequest: string,
    sectionTitle: string,
    requestHint: string,
  ) =>
    render("outlineSectionRefinement", {
      context: context || "当前暂无可读取的项目记忆，请仅基于已有大纲与本次要求进行细化。",
      userRequest: userRequest.trim() || "未额外指定，请基于已有大纲与项目记忆完成细化。",
      sectionTitle,
      requestHint,
    }),

  consistencyCheck: (contextPack: string, chapterContent: string) =>
    render("consistencyCheck", {
      contextPack,
      chapterContent: chapterContent.slice(0, 8000),
    }),
}
