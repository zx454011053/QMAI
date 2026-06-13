import {
  DEEP_THINKING_CONTEXT_SOURCES,
  DEEP_THINKING_OPTIONAL_FEATURES,
  DEEP_THINKING_PIPELINE_STAGES,
  DEEP_THINKING_SKILLS,
} from "@/lib/novel/deep-thinking-features"

function FeatureList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <div className="font-medium text-foreground">{title}</div>
      <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export function DeepThinkingFeatureTooltipContent() {
  return (
    <div className="max-w-sm space-y-2 text-xs leading-5">
      <p>深度思考会按阶段生成章节正文，并引用以下能力：</p>
      <FeatureList title="流程" items={DEEP_THINKING_PIPELINE_STAGES} />
      <FeatureList title="上下文来源" items={DEEP_THINKING_CONTEXT_SOURCES} />
      <FeatureList title="技能与规则" items={DEEP_THINKING_SKILLS} />
      <FeatureList title="可选" items={DEEP_THINKING_OPTIONAL_FEATURES} />
    </div>
  )
}
