import type { ChatMessage } from "@/lib/llm-providers"
import { readFile, writeFileAtomic } from "@/commands/fs"
import { joinPath, normalizePath } from "@/lib/path-utils"
import qmQuaiSkillMarkdown from "../../../QM-QUAI.md?raw"
import { CHINESE_NOVEL_DE_AI_RULES } from "./de-ai-rules"

const QM_QUAI_SYSTEM_PROMPT = [
  qmQuaiSkillMarkdown.trim(),
  "",
  CHINESE_NOVEL_DE_AI_RULES,
].join("\n")

export const DE_AI_SKILL_FILENAME = "de-ai-skill.txt"

export function getDeAiSkillPath(projectPath: string): string {
  return joinPath(normalizePath(projectPath), DE_AI_SKILL_FILENAME)
}

export async function loadCustomDeAiSkill(projectPath?: string | null): Promise<string | null> {
  if (!projectPath) return null
  try {
    const content = await readFile(getDeAiSkillPath(projectPath))
    const trimmed = content.trim()
    return trimmed || null
  } catch {
    return null
  }
}

export async function saveCustomDeAiSkill(projectPath: string, content: string): Promise<void> {
  await writeFileAtomic(getDeAiSkillPath(projectPath), content)
}

export function buildQmQuaiSystemPrompt(customSkill?: string): string {
  if (customSkill && customSkill.trim()) {
    return customSkill.trim()
  }
  return QM_QUAI_SYSTEM_PROMPT
}

export function buildDeAiSystemPrompt(customSkill?: string): string {
  return buildQmQuaiSystemPrompt(customSkill)
}

export function buildQmQuaiRewriteMessages(content: string, customSkill?: string): ChatMessage[] {
  if (!content.trim()) throw new Error("去AI味内容为空，无法处理")
  return [
    { role: "system", content: buildQmQuaiSystemPrompt(customSkill) },
    {
      role: "user",
      content: "请严格按照 QM-QUAI skill 规则处理下面正文。\n\n输出仅返回改写后的正文，不要解释。\n\n正文如下：\n\n" + content,
    },
  ]
}

export function buildDeAiRewriteMessages(content: string, customSkill?: string): ChatMessage[] {
  return buildQmQuaiRewriteMessages(content, customSkill)
}

const DIRECTIVE_PREFIX = [
  "请保持剧情一致，并用更自然、更像真人网文作者的方式输出。",
  "减少套话、总结腔和机械解释。",
  "注意中文小说适配：保留角色声线、对白毛边、叙事节奏和必要停顿，不要按非虚构文章规则硬删副词或压缩到固定字数。",
  "",
  "任务内容：",
  "",
].join("\n")

export function injectDeAiDirective(content: string, enabled: boolean): string {
  if (!enabled) return content
  return DIRECTIVE_PREFIX + content
}
