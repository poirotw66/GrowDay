import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleClearDataAndReload = (): void => {
    if (window.confirm('確定要清除所有資料並重新開始嗎？這個操作無法復原。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl max-w-md w-full p-8 text-center border border-slate-100 dark:border-slate-700">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              哎呀！出了點問題 😅
            </h1>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              應用程式遇到了一個錯誤。別擔心，你的資料應該還在！
            </p>

            {/* Error details (collapsible) */}
            <details className="text-left bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
              <summary className="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                查看錯誤詳情
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                <RefreshCw size={20} />
                重新載入
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Home size={20} />
                嘗試繼續
              </button>

              <button
                onClick={this.handleClearDataAndReload}
                className="w-full py-2 px-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
              >
                清除資料並重新開始
              </button>
            </div>

            {/* Help text */}
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
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
