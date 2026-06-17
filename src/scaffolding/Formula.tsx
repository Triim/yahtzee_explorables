import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface FormulaProps {
  latex: string
  inline?: boolean
  className?: string
}

export function Formula({ latex, inline = false, className = '' }: FormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode: !inline,
          throwOnError: false,
        })
      } catch (e) {
        console.error('KaTeX error:', e)
      }
    }
  }, [latex, inline])

  if (inline) {
    return <span ref={containerRef} className={className} />
  }

  return <div ref={containerRef} className={`formula-block ${className}`} />
}
