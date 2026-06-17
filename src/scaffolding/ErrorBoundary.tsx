import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Identifier shown in the fallback so we know which model threw. */
  label?: string
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Wraps a scene model so a thrown error shows a visible red fallback
 * instead of silently blanking the stage. Resets when `resetKey` changes
 * (passed via React `key` from the parent).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error) {
    // Surface in the console too, per Acceptance A.
    console.error(`[ErrorBoundary${this.props.label ? ` ${this.props.label}` : ''}]`, error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="stage-error">
          <strong>Model error{this.props.label ? ` (${this.props.label})` : ''}</strong>
          <pre>{this.state.error.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
