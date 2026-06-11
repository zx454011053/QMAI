const THINK_BLOCK_REGEX = /<(?:redacted_)?think(?:ing)?>([\s\S]*?)<\/(?:redacted_)?think(?:ing)?>/gi
const THINK_STRIP_REGEX = /<(?:redacted_)?think(?:ing)?>[\s\S]*?<\/(?:redacted_)?think(?:ing)?>/gi
const THINK_UNCLOSED_REGEX = /<(?:redacted_)?think(?:ing)?>([\s\S]*)$/i
const THINK_UNCLOSED_STRIP_REGEX = /<(?:redacted_)?think(?:ing)?>[\s\S]*$/i

/**
 * Separate thinking blocks from the main answer.
 * Supports `<thinking>`, ``, and `<think>`.
 */
export function separateThinking(text: string): { thinking: string | null; answer: string } {
  const thinkParts: string[] = []
  let answer = text

  let match: RegExpExecArray | null
  const blockRegex = new RegExp(THINK_BLOCK_REGEX.source, THINK_BLOCK_REGEX.flags)
  while ((match = blockRegex.exec(text)) !== null) {
    thinkParts.push(match[1].trim())
  }
  answer = answer.replace(THINK_STRIP_REGEX, "").trim()

  const unclosedMatch = answer.match(THINK_UNCLOSED_REGEX)
  if (unclosedMatch) {
    thinkParts.push(unclosedMatch[1].trim())
    answer = answer.replace(THINK_UNCLOSED_STRIP_REGEX, "").trim()
  }

  const thinking = thinkParts.length > 0 ? thinkParts.join("\n\n") : null
  return { thinking, answer }
}

export function stripThinkingBlocks(text: string): string {
  return separateThinking(text).answer
}
