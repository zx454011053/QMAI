import { describe, expect, it } from "vitest"
import {
  buildGoldenThreeChapterDirective,
  detectGoldenThreeChapterRequest,
} from "./golden-three-chapters"

describe("golden three chapter constraints", () => {
  it("treats first-three and opening requests as first chapter plus chapter two and three directions", () => {
    const result = detectGoldenThreeChapterRequest("生成前三章")

    expect(result.enabled).toBe(true)
    expect(result.targetChapter).toBe(1)
    expect(result.outputMode).toBe("first_chapter_with_directions")

    const directive = buildGoldenThreeChapterDirective(result)
    expect(directive).toContain("只生成第一章正文")
    expect(directive).toContain("第二章写作方向")
    expect(directive).toContain("第三章写作方向")
    expect(directive).toContain("300-500 字")
    expect(directive).toContain("穿越、前世、背景、设定只一笔带过")
  })

  it("treats first chapter and opening synonyms as golden opening requests", () => {
    for (const text of ["写首章", "开篇章节", "小说开头", "写开局"]) {
      const result = detectGoldenThreeChapterRequest(text)

      expect(result.enabled).toBe(true)
      expect(result.targetChapter).toBe(1)
      expect(result.outputMode).toBe("first_chapter_with_directions")
    }
  })

  it("keeps explicit second and third chapter requests chapter-only", () => {
    for (const [text, chapter] of [["生成第二章", 2], ["生成第三章", 3]] as const) {
      const result = detectGoldenThreeChapterRequest(text)

      expect(result.enabled).toBe(true)
      expect(result.targetChapter).toBe(chapter)
      expect(result.outputMode).toBe("chapter_only")

      const directive = buildGoldenThreeChapterDirective(result)
      expect(directive).toContain(`只生成第${chapter}章正文`)
      expect(directive).not.toContain("第二章写作方向")
      expect(directive).not.toContain("第三章写作方向")
      expect(directive).toContain("每段必须推动故事、冲突、人物关系、行动或期待")
    }
  })

  it("does not enable golden constraints for ordinary chapter continuation", () => {
    const result = detectGoldenThreeChapterRequest("继续生成下一章")

    expect(result.enabled).toBe(false)
    expect(buildGoldenThreeChapterDirective(result)).toBe("")
  })
})
