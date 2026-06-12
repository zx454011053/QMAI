import { describe, expect, it, vi } from "vitest"
import { resolveTargetChapterNumberForChat } from "./chapter-utils"

vi.mock("@/commands/fs", () => ({
  listDirectory: vi.fn(async () => [
    { name: "chapter-006.md", path: "E:/Novel/wiki/chapters/chapter-006.md", is_dir: false },
  ]),
  readFile: vi.fn(async () => "---\nchapter_number: 6\n---\n# 第6章\n"),
}))

describe("resolveTargetChapterNumberForChat", () => {
  it("uses the selected chapter plus one for continue-next-chapter requests", async () => {
    await expect(resolveTargetChapterNumberForChat({
      projectPath: "E:/Novel",
      userRequest: "继续生成下一章",
      routeIntent: "continue_chapter",
      selectedFile: "E:/Novel/wiki/chapters/chapter-007.md",
    })).resolves.toBe(8)
  })

  it("uses the next available chapter when no chapter is selected", async () => {
    await expect(resolveTargetChapterNumberForChat({
      projectPath: "E:/Novel",
      userRequest: "请根据当前小说上下文继续生成下一章正文",
      routeIntent: "continue_chapter",
    })).resolves.toBe(7)
  })

  it("keeps an explicit chapter number instead of advancing it", async () => {
    await expect(resolveTargetChapterNumberForChat({
      projectPath: "E:/Novel",
      userRequest: "继续生成第7章",
      routeIntent: "continue_chapter",
      routeChapterNumber: 7,
      selectedFile: "E:/Novel/wiki/chapters/chapter-007.md",
    })).resolves.toBe(7)
  })

  it("does not force a target chapter for ordinary current-chapter continuation", async () => {
    await expect(resolveTargetChapterNumberForChat({
      projectPath: "E:/Novel",
      userRequest: "继续写当前这一章",
      routeIntent: "continue_chapter",
      selectedFile: "E:/Novel/wiki/chapters/chapter-007.md",
    })).resolves.toBeUndefined()
  })
})
