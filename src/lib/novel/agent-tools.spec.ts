import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/commands/fs", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  listDirectory: vi.fn(),
  fileExists: vi.fn(),
}))

import { fileExists, readFile, writeFile } from "@/commands/fs"
import { applyFileEdit } from "./agent-tools"
import { tryReplaceInContent } from "./file-edit-match"

describe("agent-tools applyFileEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("allows edits under QM/chapters paths", async () => {
    vi.mocked(fileExists).mockResolvedValue(true)
    vi.mocked(readFile).mockResolvedValue("旧正文")
    vi.mocked(writeFile).mockResolvedValue(undefined)

    const result = await applyFileEdit("D:/Novel", {
      filePath: "D:/Novel/QM/chapters/001.md",
      search: "旧正文",
      replace: "新正文",
    })

    expect(result.success).toBe(true)
    expect(readFile).toHaveBeenCalledWith("D:/Novel/QM/chapters/001.md")
    expect(writeFile).toHaveBeenCalledWith("D:/Novel/QM/chapters/001.md", "新正文")
  })

  it("rejects edits outside chapter and outline scopes", async () => {
    vi.mocked(fileExists).mockResolvedValue(false)

    const result = await applyFileEdit("D:/Novel", {
      filePath: "D:/Novel/QM/entities/hero.md",
      search: "a",
      replace: "b",
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain("QM/chapters")
    expect(readFile).not.toHaveBeenCalled()
  })

  it("resolves bare 总大纲.md to outlines directory", async () => {
    vi.mocked(fileExists).mockImplementation(async (path) => path === "D:/Novel/wiki/outlines/总大纲.md")
    vi.mocked(readFile).mockResolvedValue("旧大纲")
    vi.mocked(writeFile).mockResolvedValue(undefined)

    const result = await applyFileEdit("D:/Novel", {
      filePath: "总大纲.md",
      search: "旧大纲",
      replace: "新大纲",
    })

    expect(result.success).toBe(true)
    expect(readFile).toHaveBeenCalledWith("D:/Novel/wiki/outlines/总大纲.md")
  })
})

describe("file-edit-match", () => {
  it("matches content with normalized line endings", () => {
    const result = tryReplaceInContent("第一行\r\n第二行", "第一行\n第二行", "改后")
    expect(result.matched).toBe(true)
    expect(result.content).toBe("改后")
  })
})
