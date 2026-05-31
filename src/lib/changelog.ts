export interface ChangelogEntry {
  version: string
  date: string
  highlights: {
    en: string[]
    zh: string[]
  }
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.4.15",
    date: "2026-05-31",
    highlights: {
      en: [
        "左下角状态指示器改为模型连接检测（绿色=连接正常，红色=连接失败）。",
        "删除网络设置中的网页剪藏端口配置。",
        "修复模型连接检测URL构建错误导致始终显示红色的问题。",
      ],
      zh: [
        "左下角状态指示器改为模型连接检测（绿色=连接正常，红色=连接失败）。",
        "删除网络设置中的网页剪藏端口配置。",
        "修复模型连接检测URL构建错误导致始终显示红色的问题。",
      ],
    },
  },
  {
    version: "0.4.13",
    date: "2026-05-31",
    highlights: {
      en: [
        "大纲模块增加\u201c查看快照\u201d功能，提取初始记忆后可直接查看和编辑快照内容。",
        "修复\u201c提取初始记忆\u201d按钮状态无法保持的问题，切换页面后返回仍显示已提取状态。",
        "设置页面更新日志增加完整版本历史和\u201c检查更新\u201d功能。",
      ],
      zh: [
        "大纲模块增加\u201c查看快照\u201d功能，提取初始记忆后可直接查看和编辑快照内容。",
        "修复\u201c提取初始记忆\u201d按钮状态无法保持的问题，切换页面后返回仍显示已提取状态。",
        "设置页面更新日志增加完整版本历史和\u201c检查更新\u201d功能。",
      ],
    },
  },
  {
    version: "0.4.12",
    date: "2026-05-31",
    highlights: {
      en: [
        "修复大纲提取初始记忆在记忆中心显示\u201c第0章\u201d的问题，现在正确显示大纲名称。",
        "修复人物小传提取初始记忆后无法在记忆中心显示的问题（之前会被总大纲覆盖）。",
      ],
      zh: [
        "修复大纲提取初始记忆在记忆中心显示\u201c第0章\u201d的问题，现在正确显示大纲名称。",
        "修复人物小传提取初始记忆后无法在记忆中心显示的问题（之前会被总大纲覆盖）。",
      ],
    },
  },
  {
    version: "0.4.11",
    date: "2026-05-31",
    highlights: {
      en: [
        "新增用户统计功能（下载人数 + 在线人数），基于 Cloudflare Workers + D1 零成本方案。",
      ],
      zh: [
        "新增用户统计功能（下载人数 + 在线人数），基于 Cloudflare Workers + D1 零成本方案。",
      ],
    },
  },
  {
    version: "0.4.10",
    date: "2026-05-20",
    highlights: {
      en: [
        "更新为小说写作助手定位，围绕长篇小说创作整理章节、大纲、人物状态、伏笔、时间线和图谱能力。",
        "强化写作上下文、章节记忆、审稿检查与长篇连续性相关功能，减少长篇创作中的遗忘和设定冲突。",
      ],
      zh: [
        "更新为小说写作助手定位，围绕长篇小说创作整理章节、大纲、人物状态、伏笔、时间线和图谱能力。",
        "强化写作上下文、章节记忆、审稿检查与长篇连续性相关功能，减少长篇创作中的遗忘和设定冲突。",
      ],
    },
  },
]

export function currentVersionChangelog(version: string): ChangelogEntry[] {
  return CHANGELOG.filter((entry) => entry.version === version)
}

export function allChangelog(): ChangelogEntry[] {
  return CHANGELOG
}
