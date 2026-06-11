export type PromptConfigKey =
  | "chapterGeneration"
  | "chapterContinuation"
  | "chapterRevision"
  | "outlineGeneration"
  | "outlineRefinementGeneration"
  | "outlineSectionRefinement"
  | "consistencyCheck"

export type PromptConfig = Record<PromptConfigKey, string>

export const PROMPT_CONFIG_KEYS = [
  "chapterGeneration",
  "chapterContinuation",
  "chapterRevision",
  "outlineGeneration",
  "outlineRefinementGeneration",
  "outlineSectionRefinement",
  "consistencyCheck",
] as const satisfies readonly PromptConfigKey[]

export interface CustomPrompt {
  id: string
  name: string
  variableName: string
  content: string
}

export interface ProjectPromptConfig {
  templates: PromptConfig
  customPrompts: CustomPrompt[]
}

export const CUSTOM_PROMPT_VARIABLE_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/

export type PromptConfigSelection =
  | { kind: "builtin"; key: PromptConfigKey }
  | { kind: "custom"; id: string }

export interface PromptVariableInfo {
  name: string
  description: string
}

export interface PromptConfigMeta {
  key: PromptConfigKey
  label: string
  description: string
  variables: PromptVariableInfo[]
}

export const PROMPT_CONFIG_META: PromptConfigMeta[] = [
  {
    key: "chapterGeneration",
    label: "章节生成",
    description: "根据上下文包与章节目标撰写新章节。",
    variables: [
      {
        name: "contextPack",
        description: "自动组装的上下文包，含大纲、人物状态、伏笔、时间线、检索结果、修改反馈等。",
      },
      {
        name: "chapterGoal",
        description: "当前章节的写作目标与情节要点，来自总纲与章节细纲。",
      },
    ],
  },
  {
    key: "chapterContinuation",
    label: "章节续写",
    description: "基于上一段内容续写，保持风格一致。",
    variables: [
      {
        name: "contextPack",
        description: "自动组装的上下文包，用于保持人设、设定与剧情连贯。",
      },
      {
        name: "lastParagraph",
        description: "待续写的上一段正文末尾，模型将从此处接着写。",
      },
    ],
  },
  {
    key: "chapterRevision",
    label: "章节改写",
    description: "按修改要求重写章节（原文已截断至 6000 字）。",
    variables: [
      {
        name: "contextPack",
        description: "自动组装的上下文包，确保改写后仍符合大纲与设定。",
      },
      {
        name: "originalContent",
        description: "待改写的原始章节正文，系统最长传入 6000 字。",
      },
      {
        name: "revisionNotes",
        description: "用户或审稿给出的修改要求与反馈说明。",
      },
    ],
  },
  {
    key: "outlineGeneration",
    label: "生成总大纲",
    description: "从零生成小说总大纲（含分卷、人物、世界观、伏笔）。",
    variables: [
      {
        name: "genre",
        description: "用户在「生成大纲」对话框中填写的小说类型，如玄幻、悬疑。",
      },
      {
        name: "scale",
        description: "小说规模（如 10 万、100 万字），用于决定分卷结构与章节密度。",
      },
      {
        name: "premise",
        description: "核心设定或一句话梗概，作为大纲生成的主题输入。",
      },
      {
        name: "context",
        description: "从项目记忆、已有大纲、人物、伏笔、时间线等自动组装的背景资料。",
      },
      {
        name: "languageDirective",
        description: "输出语言约束段落，根据 premise 等内容自动推断写作语言。",
      },
      {
        name: "volumeChapterRange",
        description: "根据 scale 计算的分卷章节数建议，如「每卷 15-30 章」。",
      },
    ],
  },
  {
    key: "outlineRefinementGeneration",
    label: "大纲细化（JSON）",
    description: "一次性细化 6 类设定并返回 JSON（预留模板）。",
    variables: [
      {
        name: "outlineContext",
        description: "已有大纲与项目记忆的汇总，含人物、伏笔、时间线、检索结果等。",
      },
      {
        name: "sectionHints",
        description: "6 类细化内容（章节细纲、人物小传等）的字段说明列表。",
      },
      {
        name: "userRequest",
        description: "用户在细化对话框中的补充要求；未填写时使用默认提示。",
      },
      {
        name: "languageDirective",
        description: "输出语言约束段落，根据用户要求或上下文自动推断。",
      },
    ],
  },
  {
    key: "outlineSectionRefinement",
    label: "大纲板块细化",
    description: "按板块（章节细纲、人物小传等）单独生成 Markdown。",
    variables: [
      {
        name: "context",
        description: "已有大纲与项目记忆的 Markdown 汇总，作为细化的依据。",
      },
      {
        name: "userRequest",
        description: "用户本次细化的补充说明；未填写时使用默认提示。",
      },
      {
        name: "sectionTitle",
        description: "当前要生成的板块名称，如「章节细纲」「人物小传」。",
      },
      {
        name: "requestHint",
        description: "该板块的生成侧重点，由系统根据板块类型自动填入。",
      },
    ],
  },
  {
    key: "consistencyCheck",
    label: "连贯性检查",
    description: "检查章节在人设、时间线、伏笔等方面的一致性。",
    variables: [
      {
        name: "contextPack",
        description: "自动组装的上下文包，提供检查所需的大纲与设定参照。",
      },
      {
        name: "chapterContent",
        description: "待检查的章节正文，系统最长传入 8000 字。",
      },
    ],
  },
]

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  chapterGeneration: `{{contextPack}}

请根据以上上下文包和大纲，撰写以下章节：
{{chapterGoal}}

要求：
1. 严格遵循大纲中的情节走向
2. 保持人物性格和说话方式一致
3. 不要泄露角色尚不知道的信息
4. 注意伏笔的埋设和回收
5. 章节结尾要有钩子，吸引读者继续阅读
6. 字数控制在 3000-5000 字`,

  chapterContinuation: `{{contextPack}}

上一段内容：
{{lastParagraph}}

请续写以下内容，保持风格和节奏一致：`,

  chapterRevision: `{{contextPack}}

原始章节内容：
{{originalContent}}

修改要求：
{{revisionNotes}}

请根据修改要求重写章节，保持其他部分不变：`,

  outlineGeneration: `请为以下小说生成大纲：

类型：{{genre}}
规模：{{scale}}
核心设定：{{premise}}

已有故事记忆与项目资料（如果有）：
{{context}}

{{languageDirective}}

请输出以下内容：
1. 总大纲（包含起承转合、主要冲突线、情感线）
2. 分卷大纲（根据规模合理分卷，{{volumeChapterRange}}，标注每卷核心事件和转折点）
3. 主要人物设定（姓名、性格、动机、人物弧线、关键关系）
4. 世界观设定（核心设定规则、势力分布、能力体系、重要地点）
5. 伏笔计划（主要伏笔的埋设、推进、回收节点）`,

  outlineRefinementGeneration: `请基于已有大纲和项目记忆，对小说进行一次统一的细化生成。

硬性约束：
1. 已有大纲、人物状态、角色认知、伏笔状态、时间线、正史规则和项目记忆都是最高优先级，不得推翻。
2. 本次用户要求只能用于补充、聚焦和完善，不得改写既定主线和核心设定。
3. 如果信息不足，只能做最小必要补完，且必须与现有设定兼容。

已有大纲与项目记忆：
{{outlineContext}}

本次细化重点：
{{userRequest}}

{{languageDirective}}

请一次性覆盖以下 6 类细化内容：
{{sectionHints}}

输出要求：
1. 只返回一个 JSON 对象，不要输出解释、前言、额外说明或代码块外文本。
2. JSON 必须包含以下 6 个字段，且每个字段的值都必须是字符串形式的中文 Markdown：
   - "chapterOutlines"
   - "characterBriefs"
   - "organizationsOutline"
   - "powerSystem"
   - "foreshadowingPlan"
   - "locationsOutline"
3. chapterOutlines 必须体现章节目标、冲突、转折和结尾钩子。
4. characterBriefs 必须覆盖人物动机、弧线、关系和当前状态。
5. organizationsOutline、powerSystem、locationsOutline 必须写清规则、限制、代价、归属与剧情作用。
6. foreshadowingPlan 必须体现伏笔的埋设、推进、回收节点和对应章节。`,

  outlineSectionRefinement: `请基于已有大纲和项目记忆，生成指定类型的小说设定文件。

硬性约束：
1. 已有大纲、人物状态、角色认知、伏笔状态、时间线、正史规则和项目记忆都是最高优先级，不得推翻。
2. 本次用户要求只能用于补充、聚焦和完善，不得改写既定主线和核心设定。
3. 如果信息不足，只能做最小必要补完，且必须与现有设定兼容。
4. 只输出正文 Markdown，不要输出 JSON、代码块、解释、前言或额外说明。

已有大纲与项目记忆：
{{context}}

本次细化重点：
{{userRequest}}

本次只生成：{{sectionTitle}}
{{requestHint}}`,

  consistencyCheck: `{{contextPack}}

请检查以下章节的连贯性：
{{chapterContent}}

检查维度：
1. 人设一致性
2. 时间线准确性
3. 伏笔状态
4. 角色认知合理性
5. 设定一致性`,
}

export function mergePromptConfig(partial: Partial<PromptConfig> | null | undefined): PromptConfig {
  return { ...DEFAULT_PROMPT_CONFIG, ...(partial ?? {}) }
}

export function collectReservedVariableNames(): Set<string> {
  const names = new Set<string>()
  for (const meta of PROMPT_CONFIG_META) {
    for (const variable of meta.variables) {
      names.add(variable.name)
    }
  }
  return names
}

export const RESERVED_PROMPT_VARIABLES = collectReservedVariableNames()

export function createCustomPrompt(partial?: Partial<CustomPrompt>): CustomPrompt {
  const id = partial?.id ?? crypto.randomUUID()
  const suffix = id.replace(/-/g, "").slice(0, 8)
  return {
    id,
    name: partial?.name ?? "新建提示词",
    variableName: partial?.variableName ?? `custom_${suffix}`,
    content: partial?.content ?? "",
  }
}

export function validateCustomPromptVariableName(
  variableName: string,
  customPrompts: CustomPrompt[],
  excludeId?: string,
): string | null {
  const trimmed = variableName.trim()
  if (!trimmed) return "变量名不能为空"
  if (!CUSTOM_PROMPT_VARIABLE_PATTERN.test(trimmed)) {
    return "变量名仅可使用英文字母、数字、下划线，且须以字母开头"
  }
  if (RESERVED_PROMPT_VARIABLES.has(trimmed)) {
    return "该变量名与系统内置变量冲突"
  }
  if (customPrompts.some((item) => item.id !== excludeId && item.variableName === trimmed)) {
    return "变量名已被其他自定义提示词使用"
  }
  return null
}

export function validateAllCustomPrompts(customPrompts: CustomPrompt[]): string | null {
  for (const item of customPrompts) {
    const error = validateCustomPromptVariableName(item.variableName, customPrompts, item.id)
    if (error) return `${item.name || "未命名提示词"}：${error}`
  }
  return null
}

export function normalizeCustomPrompts(value: unknown): CustomPrompt[] {
  if (!Array.isArray(value)) return []
  const result: CustomPrompt[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const record = item as Partial<CustomPrompt>
    if (typeof record.id !== "string" || typeof record.name !== "string") continue
    if (typeof record.variableName !== "string" || typeof record.content !== "string") continue
    if (validateCustomPromptVariableName(record.variableName, result)) continue
    result.push({
      id: record.id,
      name: record.name.trim() || "未命名提示词",
      variableName: record.variableName.trim(),
      content: record.content,
    })
  }
  return result
}
