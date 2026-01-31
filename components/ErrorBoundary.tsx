
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    
    // You could also log to an error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleClearDataAndReload = (): void => {
    if (window.confirm('確定要清除所有資料並重新開始嗎？這個操作無法復原。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              哎呀！出了點問題 😅
            </h1>

            {/* Description */}
            <p className="text-slate-600 mb-6">
              應用程式遇到了一個錯誤。別擔心，你的資料應該還在！
            </p>

            {/* Error details (collapsible) */}
            <details className="text-left bg-slate-50 rounded-xl p-4 mb-6">
              <summary className="text-sm font-medium text-slate-700 cursor-pointer">
                查看錯誤詳情
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-32 p-2 bg-red-50 rounded">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={20} />
                重新載入
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Home size={20} />
                嘗試繼續
              </button>

              <button
                onClick={this.handleClearDataAndReload}
                className="w-full py-2 px-4 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
              >
                清除資料並重新開始
              </button>
            </div>

            {/* Help text */}
            <p className="mt-6 text-xs text-slate-400">
              如果問題持續發生，請嘗試清除瀏覽器快取或聯繫開發者。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
