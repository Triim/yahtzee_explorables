import type { ReactNode } from 'react'
import { Formula } from './Formula'

/**
 * Renders a string with inline ($...$) and block ($$...$$) LaTeX via KaTeX.
 * Shared by the legacy StepRenderer and the Part 2 beat track.
 */
export function RichText({ text }: { text: string }) {
  return <>{render(text)}</>
}

function render(text: string): ReactNode[] {
  const parts: ReactNode[] = []

  const blockRegex = /\$\$(.*?)\$\$/g
  const displayMatches = Array.from(text.matchAll(blockRegex))

  if (displayMatches.length > 0) {
    let pos = 0
    displayMatches.forEach((m) => {
      if (m.index! > pos) parts.push(text.substring(pos, m.index))
      parts.push(<Formula key={`f-${m.index}`} latex={m[1]} />)
      pos = m.index! + m[0].length
    })
    if (pos < text.length) parts.push(text.substring(pos))
    return parts
  }

  const inlineRegex = /\$(.*?)\$/g
  const inlineMatches = Array.from(text.matchAll(inlineRegex))
  if (inlineMatches.length > 0) {
    let pos = 0
    inlineMatches.forEach((m) => {
      if (m.index! > pos) parts.push(text.substring(pos, m.index))
      parts.push(<Formula key={`f-${m.index}`} latex={m[1]} inline />)
      pos = m.index! + m[0].length
    })
    if (pos < text.length) parts.push(text.substring(pos))
    return parts
  }

  parts.push(text)
  return parts
}
