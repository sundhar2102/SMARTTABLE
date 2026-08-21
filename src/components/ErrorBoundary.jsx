import React from 'react';

/**
 * AppErrorBoundary — catches any thrown error inside its subtree.
 *
 * Usage:
 *   <AppErrorBoundary context="Auth">
 *     <SomeComponent />
 *   </AppErrorBoundary>
 *
 * Props:
 *   context  (string)  — label shown in the fallback UI for debugging
 *   fallback (element) — optional custom fallback; renders default if omitted
 */
export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(
      `[ErrorBoundary]${this.props.context ? ` (${this.props.context})` : ''} Caught render error:`,
      error,
      errorInfo?.componentStack
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.handleReset();
    // Clear any stale OAuth hash/search that may have caused the crash
    try {
      window.history.replaceState({}, document.title, '/');
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const { error } = this.state;
    const isDev = import.meta.env.DEV;

    return (
      <div
        className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-6 font-sans"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-6 text-center">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-black" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#0a0d0a] tracking-tight">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              An unexpected error occurred
              {this.props.context ? ` in the ${this.props.context} area` : ''}.
              Your session data is safe — tap the button below to reload.
            </p>
          </div>

          {/* Dev-mode error details */}
          {isDev && error && (
            <details className="text-left bg-gray-50 rounded-xl border border-gray-200 p-3 text-xs">
              <summary className="font-bold text-rose-600 cursor-pointer select-none mb-1">
                🛠 Debug: {error.name}
              </summary>
              <pre className="overflow-auto whitespace-pre-wrap text-gray-700 leading-relaxed max-h-40">
                {error.message}
                {this.state.errorInfo?.componentStack
                  ? '\n\nComponent stack:' + this.state.errorInfo.componentStack
                  : ''}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={this.handleGoHome}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0a0d0a] hover:bg-[#1a2e1d] text-white text-sm font-extrabold transition-all cursor-pointer shadow-sm"
            >
              Go to Home
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-gray-50 text-[#0a0d0a] border border-gray-300 text-sm font-bold transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>

        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
