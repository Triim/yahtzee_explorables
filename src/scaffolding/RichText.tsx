import type { ReactNode } from 'react'
import { Formula } from './Formula'

/**
 * Renders a string with rich, partly block-level markup:
 *
 *   **bold**            inline emphasis
 *   $inline$            inline LaTeX
 *   $$block$$           a display formula on its own highlighted line
 *   [[ definition ]]    a highlighted callout block on its own line
 *                       (used to set definitions/formulas apart from prose)
 *
 * Block tokens ($$…$$, [[…]]) break the surrounding prose into flow blocks so
 * the highlighted definition/formula always lands on a fresh line. The wrapping
 * element (.beat-payoff / .beat-prompt) is a <div>, so block children are valid.
 */
export function RichText({ text }: { text: string }) {
  return <>{renderBlocks(text)}</>
}

// Top-level split: definition callouts [[…]] and display formulas $$…$$.
const BLOCK = /\[\[([\s\S]+?)\]\]|\$\$([\s\S]+?)\$\$/g
// Inline split inside a flow run: $inline$ and **bold** (math takes precedence).
const INLINE = /\$(.+?)\$|\*\*(.+?)\*\*/g

function renderBlocks(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let pos = 0
  let m: RegExpExecArray | null
  BLOCK.lastIndex = 0

  while ((m = BLOCK.exec(text)) !== null) {
    if (m.index > pos) {
      out.push(
        <span key={`run-${pos}`} className="rt-run">
          {renderInline(text.slice(pos, m.index))}
        </span>
      )
    }
    if (m[1] !== undefined) {
      out.push(
        <span key={`call-${m.index}`} className="rt-callout">
          {renderInline(m[1].trim())}
        </span>
      )
    } else if (m[2] !== undefined) {
      out.push(<Formula key={`disp-${m.index}`} latex={m[2].trim()} className="rt-display" />)
    }
    pos = m.index + m[0].length
  }
  if (pos < text.length) {
    out.push(
      <span key={`run-${pos}`} className="rt-run">
        {renderInline(text.slice(pos))}
      </span>
    )
  }
  return out
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let pos = 0
  let m: RegExpExecArray | null
  INLINE.lastIndex = 0

  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > pos) parts.push(text.substring(pos, m.index))
    if (m[1] !== undefined) {
      parts.push(<Formula key={`i-${m.index}`} latex={m[1]} inline />)
    } else if (m[2] !== undefined) {
      parts.push(<strong key={`b-${m.index}`}>{m[2]}</strong>)
    }
    pos = m.index + m[0].length
  }
  if (pos < text.length) parts.push(text.substring(pos))
  return parts
}
