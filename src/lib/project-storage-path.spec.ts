import { describe, expect, it } from "vitest"
import {
  buildEditablePathCandidates,
  getKnowledgeScopeDir,
  isEditableKnowledgePath,
  isKnowledgeScopePath,
  resolveKnowledgeFilePath,
} from "./project-storage-path"

describe("project-storage-path", () => {
  const projectPath = "D:/Novel"

  it("resolves virtual wiki scope directories", () => {
    expect(getKnowledgeScopeDir(projectPath, "chapters")).toBe("D:/Novel/wiki/chapters")
    expect(getKnowledgeScopeDir(projectPath, "outlines")).toBe("D:/Novel/wiki/outlines")
  })

  it("accepts wiki and QM chapter paths", () => {
    expect(isKnowledgeScopePath("D:/Novel/wiki/chapters/001.md", "chapters")).toBe(true)
    expect(isKnowledgeScopePath("D:/Novel/QM/chapters/001.md", "chapters")).toBe(true)
    expect(isKnowledgeScopePath("D:/Novel/wiki/outlines/001.md", "chapters")).toBe(false)
  })

  it("accepts wiki and QM outline paths", () => {
    expect(isKnowledgeScopePath("D:/Novel/wiki/outlines/plot/main.md", "outlines")).toBe(true)
    expect(isKnowledgeScopePath("D:/Novel/QM/outlines/plot/main.md", "outlines")).toBe(true)
  })

  it("detects editable knowledge paths", () => {
    expect(isEditableKnowledgePath("D:/Novel/QM/chapters/001.md")).toBe(true)
    expect(isEditableKnowledgePath("D:/Novel/wiki/outlines/main.md")).toBe(true)
    expect(isEditableKnowledgePath("D:/Novel/QM/entities/hero.md")).toBe(false)
  })

  it("resolves relative edit paths under wiki or QM", () => {
    expect(resolveKnowledgeFilePath(projectPath, "wiki/chapters/001.md"))
      .toBe("D:/Novel/wiki/chapters/001.md")
    expect(resolveKnowledgeFilePath(projectPath, "QM/chapters/001.md"))
      .toBe("D:/Novel/QM/chapters/001.md")
    expect(resolveKnowledgeFilePath(projectPath, "chapters/001.md"))
      .toBe("D:/Novel/wiki/chapters/001.md")
    expect(resolveKnowledgeFilePath(projectPath, "D:/Novel/QM/chapters/001.md"))
      .toBe("D:/Novel/QM/chapters/001.md")
  })

  it("builds story outline path candidates for bare filenames", () => {
    const candidates = buildEditablePathCandidates(projectPath, "总大纲.md")
    expect(candidates).toContain("D:/Novel/wiki/outlines/总大纲.md")
    expect(candidates).toContain("D:/Novel/wiki/outlines/总大纲/总大纲.md")
    expect(candidates.every(isEditableKnowledgePath)).toBe(true)
  })
})
