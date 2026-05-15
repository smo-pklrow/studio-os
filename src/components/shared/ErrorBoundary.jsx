import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col flex-1 items-center justify-center py-24 gap-3 text-center px-6">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Something went wrong
          </p>
          <p className="text-xs max-w-sm leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn mt-2"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
