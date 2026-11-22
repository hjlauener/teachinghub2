export type DiffPart = { type: 'same' | 'added' | 'removed'; text: string }

/**
 * Wort-Diff (LCS) für die Inbox-Ansicht. Bei sehr langen Texten wird ohne Diff angezeigt,
 * damit der Browser nicht blockiert.
 */
export function wordDiff(before: string, after: string, maxTokens = 4000): DiffPart[] {
  const a = before.split(/(\s+)/)
  const b = after.split(/(\s+)/)
  if (a.length * b.length > maxTokens * maxTokens) return [{ type: 'removed', text: before }, { type: 'added', text: after }]
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const parts: DiffPart[] = []
  const push = (type: DiffPart['type'], text: string) => {
    const last = parts[parts.length - 1]
    if (last?.type === type) last.text += text
    else parts.push({ type, text })
  }
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push('same', a[i])
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) push('removed', a[i++])
    else push('added', b[j++])
  }
  while (i < a.length) push('removed', a[i++])
  while (j < b.length) push('added', b[j++])
  return parts
}
