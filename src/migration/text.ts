/** Lesbarer Text aus Feldwerten (Lexical, Listen, Gruppen) – für die Diff-Anzeige der Inbox. */

type Node = { type?: string; text?: string; children?: Node[]; fields?: Record<string, unknown>; tag?: string }

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listitem', 'quote', 'tablerow'])

function lexicalText(node: Node): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'linebreak') return '\n'
  if (node.type === 'upload') return '[Bild]'
  if (node.type === 'block') return `[Video: ${String(node.fields?.title ?? node.fields?.url ?? '')}]`
  if (node.type === 'tablecell') return (node.children ?? []).map(lexicalText).join(' ') + ' | '
  const inner = (node.children ?? []).map(lexicalText).join('')
  if (node.type === 'heading') return `\n## ${inner.trim()}\n`
  if (node.type === 'listitem') return `• ${inner.trim()}\n`
  return BLOCK_TYPES.has(node.type ?? '') ? `${inner.trim()}\n` : inner
}

export function valueToText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map((v) => valueToText(v)).filter(Boolean).join('\n\n')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (record.root && typeof record.root === 'object') return lexicalText(record.root as Node).replace(/\n{3,}/g, '\n\n').trim()
    return Object.entries(record)
      .filter(([key]) => key !== 'id')
      .map(([key, v]) => {
        const t = valueToText(v)
        return t ? `[${key}] ${t}` : ''
      })
      .filter(Boolean)
      .join('\n\n')
  }
  return ''
}
