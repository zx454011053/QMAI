import { createDirectory, fileExists, readFile, writeFile } from "@/commands/fs"
import { normalizePath } from "@/lib/path-utils"
import {
  DEFAULT_PROMPT_CONFIG,
  mergePromptConfig,
  normalizeCustomPrompts,
  PROMPT_CONFIG_KEYS,
  type CustomPrompt,
  type ProjectPromptConfig,
  type PromptConfig,
  type PromptConfigKey,
} from "./prompt-config-defaults"

const PROMPT_CONFIG_FILE = ".qmai/prompt-config.json"

function promptConfigFilePath(projectPath: string): string {
  return `${normalizePath(projectPath)}/${PROMPT_CONFIG_FILE}`
}

function parseProjectPromptConfig(raw: Record<string, unknown>): ProjectPromptConfig {
  const templates: Partial<PromptConfig> = {}
  for (const key of PROMPT_CONFIG_KEYS) {
    const value = raw[key]
    if (typeof value === "string") {
      templates[key] = value
    }
  }
  return {
    templates: mergePromptConfig(templates),
    customPrompts: normalizeCustomPrompts(raw.customPrompts),
  }
}

export async function loadProjectPromptConfig(projectPath: string): Promise<ProjectPromptConfig> {
  const filePath = promptConfigFilePath(projectPath)
  try {
    if (!(await fileExists(filePath))) {
      return { templates: { ...DEFAULT_PROMPT_CONFIG }, customPrompts: [] }
    }
    const raw = JSON.parse(await readFile(filePath)) as Record<string, unknown>
    return parseProjectPromptConfig(raw)
  } catch {
    return { templates: { ...DEFAULT_PROMPT_CONFIG }, customPrompts: [] }
  }
}

/** @deprecated Use loadProjectPromptConfig */
export async function loadPromptConfig(projectPath: string): Promise<PromptConfig> {
  const config = await loadProjectPromptConfig(projectPath)
  return config.templates
}

export async function saveProjectPromptConfig(
  projectPath: string,
  config: ProjectPromptConfig,
): Promise<void> {
  const pp = normalizePath(projectPath)
  const dir = `${pp}/.qmai`
  await createDirectory(dir)
  await writeFile(
    promptConfigFilePath(pp),
    JSON.stringify({ ...config.templates, customPrompts: config.customPrompts }, null, 2),
  )
}

/** @deprecated Use saveProjectPromptConfig */
export async function savePromptConfig(projectPath: string, config: PromptConfig): Promise<void> {
  await saveProjectPromptConfig(projectPath, { templates: config, customPrompts: [] })
}

export function buildCustomVariableMap(customPrompts: CustomPrompt[]): Record<string, string> {
  return Object.fromEntries(customPrompts.map((item) => [item.variableName, item.content]))
}

export function renderPromptTemplate(
  template: string,
  vars: Record<string, string>,
  customPrompts: CustomPrompt[] = [],
): string {
  const merged = { ...buildCustomVariableMap(customPrompts), ...vars }
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => merged[key] ?? "")
}

export function getPromptTemplate(config: PromptConfig, key: PromptConfigKey): string {
  return config[key] ?? DEFAULT_PROMPT_CONFIG[key]
}
