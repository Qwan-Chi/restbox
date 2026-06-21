import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null })
  }

  handleHardReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    const errorMsg = this.state.error?.message ?? 'Неизвестная ошибка'
    const stack = this.state.error?.stack ?? ''

    return (
      <div className="flex h-screen w-screen items-center justify-center bg-app-bg p-8">
        <div className="max-w-lg w-full bg-app-panel border border-app-border rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💥</span>
            <h1 className="text-lg font-bold text-text-primary">
              Что-то сломалось
            </h1>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Произошла непредвиденная ошибка рендера. Попробуй перезагрузить страницу
            или вернуться назад — последние действия сохранены.
          </p>
          <div className="bg-app-input border border-app-border rounded-lg p-3 mb-4 max-h-40 overflow-auto scrollbar-thin">
            <p className="text-xs font-mono text-error mb-2">{errorMsg}</p>
            {stack && (
              <pre className="text-[10px] text-text-secondary whitespace-pre-wrap break-all">
                {stack.slice(0, 1000)}
              </pre>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={this.handleReload}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              Попробовать снова
            </button>
            <button
              onClick={this.handleHardReload}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-app-border text-text-primary hover:bg-app-hover transition-colors"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      </div>
    )
  }
}
