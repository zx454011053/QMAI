export const DEEP_THINKING_PIPELINE_STAGES = [
  "阶段0：前情分析（第2章起读取前3章完整正文）",
  "阶段1：上下文分析（组装小说上下文包）",
  "阶段2：写作任务书",
  "阶段3：正文初稿（不足时自动扩写）",
  "阶段4：AI审稿",
  "阶段5：自动返修（仅在有阻断问题时）",
  "阶段6：简单审查与去AI味",
] as const

export const DEEP_THINKING_CONTEXT_SOURCES = [
  "项目灵魂 / 章节目标 / 大纲",
  "章节记忆快照（摘要、上一章结尾、人物、伏笔、时间线）",
  "角色灵魂 / 角色认知状态",
  "设定检索 / 记忆检索 / 图谱检索",
  "修改反馈 / 写作风格 / 正史规则",
] as const

export const DEEP_THINKING_SKILLS = [
  "去AI味 Skill（阶段6，可在「灵魂 → 去AI味Skill」自定义）",
  "写作模型（设置中的章节写作模型）",
] as const

export const DEEP_THINKING_OPTIONAL_FEATURES = [
  "黄金三章指令（用户消息触发时）",
] as const
