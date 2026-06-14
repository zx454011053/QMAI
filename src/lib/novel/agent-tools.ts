/**
 * Agent Tools - 文件操作工具层
 *
 * 为 AI Agent 提供安全的文件读写能力：
 * - 读取指定范围的文件
 * - 应用修改（search & replace）
 * - 列出可操作的文件
 */

import { readFile, writeFile, listDirectory, fileExists } from "@/commands/fs"
import { getRelativePath, normalizePath } from "@/lib/path-utils"
import {
  buildEditablePathCandidates,
  getKnowledgeScopeDir,
  isEditableKnowledgePath,
  STORY_OUTLINE_FILE_NAMES,
  type KnowledgeScope,
} from "@/lib/project-storage-path"
import type { FileNode } from "@/types/wiki"
import type { FileEditAction } from "./agent-parser"
import { tryReplaceInContent } from "./file-edit-match"

export interface FileEditResult {
  filePath: string
  success: boolean
  error?: string
  /** 实际读写的绝对路径（用于 undo） */
  resolvedPath?: string
  /** 修改前的完整内容（用于 undo） */
  originalContent?: string
  /** 修改后的完整内容 */
  newContent?: string
}

/**
 * 列出指定目录下的所有 markdown 文件
 */
function collectMarkdownFiles(nodes: FileNode[]): { name: string; path: string }[] {
  const files: { name: string; path: string }[] = []
  for (const node of nodes) {
    if (!node.is_dir && node.name.endsWith(".md")) {
      files.push({ name: node.name, path: node.path })
    }
    if (node.children?.length) {
      files.push(...collectMarkdownFiles(node.children))
    }
  }
  return files
}

function prioritizeScopeFiles(
  scope: KnowledgeScope,
  files: { name: string; path: string }[],
): { name: string; path: string }[] {
  if (scope !== "outlines") return files
  const priority = (file: { name: string; path: string }): number => {
    if ((STORY_OUTLINE_FILE_NAMES as readonly string[]).includes(file.name)) return 0
    if (file.path.includes("/总大纲/") || file.path.includes("/story-outline/")) return 1
    return 2
  }
  return [...files].sort((a, b) => priority(a) - priority(b))
}

export async function listScopeFiles(
  projectPath: string,
  scope: KnowledgeScope,
): Promise<{ name: string; path: string }[]> {
  const dir = getKnowledgeScopeDir(projectPath, scope)
  try {
    const tree = await listDirectory(dir)
    return prioritizeScopeFiles(scope, collectMarkdownFiles(tree))
  } catch {
    return []
  }
}

/**
 * 读取指定范围内的文件内容（用于注入 Agent 上下文）
 */
export async function readScopeFileContents(
  projectPath: string,
  scope: KnowledgeScope,
  maxFiles = 20,
): Promise<{ name: string; path: string; content: string }[]> {
  const files = await listScopeFiles(projectPath, scope)
  const results: { name: string; path: string; content: string }[] = []

  for (const file of files.slice(0, maxFiles)) {
    try {
      const content = await readFile(file.path)
      results.push({ ...file, content })
    } catch {
      // skip unreadable files
    }
  }

  return results
}

export function formatScopeFilesForAgent(
  projectPath: string,
  files: { name: string; path: string; content: string }[],
): string {
  const pp = normalizePath(projectPath)
  return files.map((file) => {
    const relativePath = getRelativePath(file.path, pp)
    return [
      `### 文件：${file.name}`,
      `路径（file_edit 的 path 必须原样使用）：${relativePath}`,
      "```",
      file.content,
      "```",
    ].join("\n")
  }).join("\n\n")
}

async function resolveExistingEditablePath(
  projectPath: string,
  filePath: string,
): Promise<string | null> {
  for (const candidate of buildEditablePathCandidates(projectPath, filePath)) {
    if (await fileExists(candidate)) {
      return candidate
    }
  }
  const fallback = buildEditablePathCandidates(projectPath, filePath)[0]
  return fallback ?? null
}

/**
 * 应用单个文件修改
 * 使用 search & replace 策略：在文件中找到 search 文本，替换为 replace 文本
 */
export async function applyFileEdit(
  projectPath: string,
  edit: FileEditAction,
): Promise<FileEditResult> {
  const normalizedPath = await resolveExistingEditablePath(projectPath, edit.filePath)

  if (!normalizedPath || !isEditableKnowledgePath(normalizedPath)) {
    return {
      filePath: edit.filePath,
      success: false,
      error: "只能修改章节或大纲文件（wiki/chapters、wiki/outlines、QM/chapters、QM/outlines）",
    }
  }

  try {
    const originalContent = await readFile(normalizedPath)
    const replacement = tryReplaceInContent(originalContent, edit.search, edit.replace)

    if (!replacement.matched) {
      return {
        filePath: edit.filePath,
        resolvedPath: normalizedPath,
        success: false,
        error: "未找到要替换的内容（search 文本不匹配）",
        originalContent,
      }
    }

    await writeFile(normalizedPath, replacement.content)

    return {
      filePath: edit.filePath,
      resolvedPath: normalizedPath,
      success: true,
      originalContent,
      newContent: replacement.content,
    }
  } catch (err) {
    return {
      filePath: edit.filePath,
      resolvedPath: normalizedPath,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * 批量应用文件修改
 */
export async function applyFileEdits(
  projectPath: string,
  edits: FileEditAction[],
): Promise<FileEditResult[]> {
  const results: FileEditResult[] = []
  for (const edit of edits) {
    results.push(await applyFileEdit(projectPath, edit))
  }
  return results
}

/**
 * 撤销文件修改（恢复原始内容）
 */
export async function undoFileEdit(result: FileEditResult): Promise<boolean> {
  if (!result.success || !result.originalContent || !result.resolvedPath) return false
  try {
    await writeFile(result.resolvedPath, result.originalContent)
    return true
  } catch {
    return false
  }
}
