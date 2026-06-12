export type GoldenThreeChapterOutputMode = "first_chapter_with_directions" | "chapter_only"

export interface GoldenThreeChapterRequest {
  enabled: boolean
  targetChapter?: 1 | 2 | 3
  outputMode?: GoldenThreeChapterOutputMode
  requestedFirstThree: boolean
}

const disabledGoldenThreeChapterRequest: GoldenThreeChapterRequest = {
  enabled: false,
  requestedFirstThree: false,
}

const firstThreePatterns = [
  /生成前三章/,
  /写前三章/,
  /黄金三章/,
]

const firstChapterPatterns = [
  /首章/,
  /第一章/,
  /第\s*1\s*章/,
  /开篇章节/,
  /开篇/,
  /开局/,
  /小说开头/,
]

const secondChapterPatterns = [
  /第二章/,
  /第\s*2\s*章/,
]

const thirdChapterPatterns = [
  /第三章/,
  /第\s*3\s*章/,
]

export function detectGoldenThreeChapterRequest(text: string, chapterNumber?: number): GoldenThreeChapterRequest {
  const normalized = text.trim()
  if (!normalized) return disabledGoldenThreeChapterRequest

  const requestedFirstThree = firstThreePatterns.some((pattern) => pattern.test(normalized))
  if (requestedFirstThree || firstChapterPatterns.some((pattern) => pattern.test(normalized)) || chapterNumber === 1) {
    return {
      enabled: true,
      targetChapter: 1,
      outputMode: "first_chapter_with_directions",
      requestedFirstThree,
    }
  }

  if (secondChapterPatterns.some((pattern) => pattern.test(normalized)) || chapterNumber === 2) {
    return {
      enabled: true,
      targetChapter: 2,
      outputMode: "chapter_only",
      requestedFirstThree: false,
    }
  }

  if (thirdChapterPatterns.some((pattern) => pattern.test(normalized)) || chapterNumber === 3) {
    return {
      enabled: true,
      targetChapter: 3,
      outputMode: "chapter_only",
      requestedFirstThree: false,
    }
  }

  return disabledGoldenThreeChapterRequest
}

export function buildGoldenThreeChapterDirective(result: GoldenThreeChapterRequest | undefined): string {
  if (!result?.enabled || !result.targetChapter || !result.outputMode) return ""

  const outputRules = result.outputMode === "first_chapter_with_directions"
    ? [
        "输出策略：只生成第一章正文，正文结束后给出“第二章写作方向”和“第三章写作方向”。",
        "第二章写作方向：强调冲突升级、阻力加重、代价扩大，让主角必须继续行动。",
        "第三章写作方向：明确阶段主线，建立长期期待，并让读者知道后续故事追什么、怕什么、盼什么。",
      ]
    : [
        `输出策略：只生成第${result.targetChapter}章正文，不输出后续方向、分析、说明或写作建议。`,
      ]

  return [
    "## 黄金三章写作约束",
    ...outputRules,
    "硬性边界：",
    "- 前 300-500 字内必须进入主体事件、危机、任务、冲突或异常。",
    "- 主角必须尽早登场，并用行动推动局面变化。",
    "- 穿越、前世、背景、设定只一笔带过，不展开成独立剧情。",
    "- 禁止长环境描写、长氛围描写、长心理描写和大段世界观说明。",
    "- 每段必须推动故事、冲突、人物关系、行动或期待。",
    "- 第一章结尾必须留下可承接第二章的钩子。",
  ].join("\n")
}
