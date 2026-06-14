export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

function stripXmlWrapperWhitespace(text: string): string {
  return text.replace(/^\s+/, "").replace(/\s+$/, "")
}

export function normalizeFileEditSearchText(text: string): string {
  return stripXmlWrapperWhitespace(text)
}

export function normalizeFileEditReplaceText(text: string): string {
  return stripXmlWrapperWhitespace(text)
}

export function tryReplaceInContent(
  originalContent: string,
  search: string,
  replace: string,
): { matched: boolean; content: string } {
  const normalizedSearch = normalizeFileEditSearchText(search)
  const normalizedReplace = normalizeFileEditReplaceText(replace)

  if (originalContent.includes(normalizedSearch)) {
    return {
      matched: true,
      content: originalContent.split(normalizedSearch).join(normalizedReplace),
    }
  }

  const normalizedOriginal = normalizeLineEndings(originalContent)
  const normalizedSearchLf = normalizeLineEndings(normalizedSearch)
  if (normalizedOriginal.includes(normalizedSearchLf)) {
    return {
      matched: true,
      content: normalizedOriginal.split(normalizedSearchLf).join(normalizeLineEndings(normalizedReplace)),
    }
  }

  const trimmedSearch = normalizedSearch.trim()
  if (trimmedSearch && trimmedSearch !== normalizedSearch && originalContent.includes(trimmedSearch)) {
    return {
      matched: true,
      content: originalContent.split(trimmedSearch).join(normalizedReplace),
    }
  }

  return { matched: false, content: originalContent }
}
