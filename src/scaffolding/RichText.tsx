import type { ReactNode } from 'react'
import { Formula } from './Formula'

/**
 * Renders a string with **bold**, inline ($...$) and block ($$...$$) LaTeX.
 * Used across the beat track and section models.
 */
export function RichText({ text }: { text: string }) {
  return <>{render(text)}</>
}

// Tokenize on $$block$$, $inline$, and **bold** (math takes precedence).
const TOKEN = /\$\$(.+?)\$\$|\$(.+?)\$|\*\*(.+?)\*\*/g

function render(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let pos = 0
  let m: RegExpExecArray | null
  TOKEN.lastIndex = 0

  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > pos) parts.push(text.substring(pos, m.index))
    const key = `t-${m.index}`
    if (m[1] !== undefined) {
      parts.push(<Formula key={key} latex={m[1]} />)
    } else if (m[2] !== undefined) {
      parts.push(<Formula key={key} latex={m[2]} inline />)
    } else if (m[3] !== undefined) {
      parts.push(<strong key={key}>{m[3]}</strong>)
    }
    pos = m.index + m[0].length
  }
  if (pos < text.length) parts.push(text.substring(pos))
  return parts
}
