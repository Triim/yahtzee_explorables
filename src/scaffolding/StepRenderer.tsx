import type { Step } from './types'
import { Formula } from './Formula'
import './StepRenderer.css'

interface StepRendererProps {
  step: Step
}

export function StepRenderer({ step }: StepRendererProps) {
  const renderContent = (text: string) => {
    const parts: React.ReactNode[] = []

    // Simple LaTeX detection: $...$ for inline, $$...$$ for block
    const blockRegex = /\$\$(.*?)\$\$/g
    const displayMatches = Array.from(text.matchAll(blockRegex))

    if (displayMatches.length > 0) {
      // Has display math
      let currentPos = 0
      displayMatches.forEach((m) => {
        if (m.index! > currentPos) {
          parts.push(text.substring(currentPos, m.index))
        }
        parts.push(<Formula key={`formula-${m.index}`} latex={m[1]} />)
        currentPos = m.index! + m[0].length
      })
      if (currentPos < text.length) {
        parts.push(text.substring(currentPos))
      }
    } else {
      // No display math, handle inline
      const inlineRegex = /\$(.*?)\$/g
      const inlineMatches = Array.from(text.matchAll(inlineRegex))

      if (inlineMatches.length > 0) {
        let currentPos = 0
        inlineMatches.forEach((m) => {
          if (m.index! > currentPos) {
            parts.push(text.substring(currentPos, m.index))
          }
          parts.push(
            <Formula key={`formula-${m.index}`} latex={m[1]} inline={true} />
          )
          currentPos = m.index! + m[0].length
        })
        if (currentPos < text.length) {
          parts.push(text.substring(currentPos))
        }
      } else {
        parts.push(text)
      }
    }

    return parts
  }

  return (
    <div className={`step-content step-${step.copyType} register-${step.register}`}>
      <p>{renderContent(step.text)}</p>
    </div>
  )
}
