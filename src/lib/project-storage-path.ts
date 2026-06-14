import { getFileName, getFileStem, isAbsolutePath, joinPath, normalizePath } from "@/lib/path-utils"

export const STORY_OUTLINE_FILE_NAMES = ["总大纲.md", "story-outline.md"] as const
export const STORY_OUTLINE_FOLDER_NAMES = ["总大纲", "story-outline"] as const

/** Virtual knowledge root used by the UI and legacy paths. */
export const VIRTUAL_KNOWLEDGE_DIR = "wiki"
/** On-disk knowledge root for newer projects. */
export const PHYSICAL_KNOWLEDGE_DIR = "QM"

const KNOWLEDGE_ROOTS = [VIRTUAL_KNOWLEDGE_DIR, PHYSICAL_KNOWLEDGE_DIR] as const

export type KnowledgeScope = "chapters" | "outlines"

export function getKnowledgeRoot(projectPath: string): string {
  return joinPath(normalizePath(projectPath), VIRTUAL_KNOWLEDGE_DIR)
}

export function getKnowledgeScopeDir(projectPath: string, scope: KnowledgeScope): string {
  const segment = scope === "chapters" ? "chapters" : "outlines"
  return joinPath(getKnowledgeRoot(projectPath), segment)
}

function knowledgeScopePattern(root: string, scope: KnowledgeScope): string {
  const segment = scope === "chapters" ? "chapters" : "outlines"
  return `/${root}/${segment}/`
}

export function isKnowledgeScopePath(path: string, scope: KnowledgeScope): boolean {
  const normalized = normalizePath(path)
  return KNOWLEDGE_ROOTS.some((root) => normalized.includes(knowledgeScopePattern(root, scope)))
}

export function isEditableKnowledgePath(path: string): boolean {
  return isKnowledgeScopePath(path, "chapters") || isKnowledgeScopePath(path, "outlines")
}

/**
 * Resolve a file-edit path to an absolute project path.
 * Accepts wiki/* and QM/* aliases; IO commands map wiki -> QM on disk.
 */
export function resolveKnowledgeFilePath(projectPath: string, filePath: string): string {
  const pp = normalizePath(projectPath)
  const normalized = normalizePath(filePath)

  if (isAbsolutePath(normalized)) {
    return normalized
  }

  if (
    normalized.startsWith(`${VIRTUAL_KNOWLEDGE_DIR}/`)
    || normalized.startsWith(`${PHYSICAL_KNOWLEDGE_DIR}/`)
  ) {
    return joinPath(pp, normalized)
  }

  if (normalized.startsWith("chapters/") || normalized.startsWith("outlines/")) {
    return joinPath(pp, VIRTUAL_KNOWLEDGE_DIR, normalized)
  }

  return joinPath(pp, normalized)
}

function pushUnique(candidates: string[], path: string): void {
  const normalized = normalizePath(path)
  if (!candidates.includes(normalized)) {
    candidates.push(normalized)
  }
}

function appendStoryOutlineCandidates(candidates: string[], pp: string): void {
  for (const fileName of STORY_OUTLINE_FILE_NAMES) {
    pushUnique(candidates, joinPath(pp, VIRTUAL_KNOWLEDGE_DIR, "outlines", fileName))
    for (const folderName of STORY_OUTLINE_FOLDER_NAMES) {
      pushUnique(candidates, joinPath(pp, VIRTUAL_KNOWLEDGE_DIR, "outlines", folderName, fileName))
    }
  }
}

/**
 * Build candidate absolute paths for a file edit, including common outline layouts.
 */
export function buildEditablePathCandidates(projectPath: string, filePath: string): string[] {
  const pp = normalizePath(projectPath)
  const normalized = normalizePath(filePath)
  const candidates: string[] = []

  pushUnique(candidates, resolveKnowledgeFilePath(projectPath, filePath))

  const fileName = getFileName(normalized)
  const stem = getFileStem(normalized)
  const outlinesRoot = joinPath(pp, VIRTUAL_KNOWLEDGE_DIR, "outlines")

  if (!normalized.includes("/")) {
    pushUnique(candidates, joinPath(outlinesRoot, fileName))
    pushUnique(candidates, joinPath(outlinesRoot, stem, fileName))
    pushUnique(candidates, joinPath(pp, VIRTUAL_KNOWLEDGE_DIR, "chapters", fileName))
  }

  if (
    STORY_OUTLINE_FILE_NAMES.includes(fileName as typeof STORY_OUTLINE_FILE_NAMES[number])
    || STORY_OUTLINE_FOLDER_NAMES.includes(stem as typeof STORY_OUTLINE_FOLDER_NAMES[number])
    || normalized === "总大纲"
    || normalized.toLowerCase() === "story-outline"
  ) {
    appendStoryOutlineCandidates(candidates, pp)
  }

  for (const root of KNOWLEDGE_ROOTS) {
    const prefix = `${root}/`
    if (normalized.startsWith(prefix) && !normalized.includes("/outlines/") && !normalized.includes("/chapters/")) {
      pushUnique(candidates, joinPath(pp, root, "outlines", normalized.slice(prefix.length)))
    }
  }

  return candidates.filter(isEditableKnowledgePath)
}

export function knowledgeScopeDescription(scope: KnowledgeScope): string {
  if (scope === "chapters") {
    return "章节文件（wiki/chapters/ 或 QM/chapters/）"
  }
  return "大纲文件（wiki/outlines/ 或 QM/outlines/）"
}
