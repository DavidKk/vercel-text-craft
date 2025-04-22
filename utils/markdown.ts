import { isJson } from '@/utils/json'
import { isToml } from '@/utils/toml'

interface CodeBlock {
  type: 'json' | 'toml' | 'unknown'
  content: string
  language?: string
}

export function extractCodeBlocksFromMarkdown(markdown: string): CodeBlock[] {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g
  const blocks: CodeBlock[] = []

  let match
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const [_, language, content] = match
    const trimmedContent = content.trim()

    let type: CodeBlock['type'] = 'unknown'

    if (language === 'json' && isJson(trimmedContent)) {
      type = 'json'
    } else if (language === 'toml' && isToml(trimmedContent)) {
      type = 'toml'
    }

    blocks.push({
      type,
      content: trimmedContent,
      language: language || undefined,
    })
  }

  return blocks
}
