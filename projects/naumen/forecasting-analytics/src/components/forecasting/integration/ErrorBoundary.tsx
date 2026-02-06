// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'component' | 'module' | 'global';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryAttempts: number;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetryAttempts = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryAttempts: 0,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for analytics
    this.logError(error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      level: this.props.level || 'component',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || 'anonymous'
    };

    // In a real app, send to logging service
    console.error('ErrorBoundary caught an error:', errorData);
    
    // Optionally send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_id: this.state.errorId
      });
    }
  }

  private handleRetry = () => {
    if (this.state.retryAttempts < this.maxRetryAttempts) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryAttempts: prevState.retryAttempts + 1,
        errorId: this.generateErrorId()
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryAttempts: 0,
      errorId: this.generateErrorId()
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleContactSupport = () => {
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(
      `Error ID: ${this.state.errorId}\n` +
      `Time: ${new Date().toISOString()}\n` +
      `Error: ${this.state.error?.message}\n` +
      `URL: ${window.location.href}\n` +
      `Browser: ${navigator.userAgent}\n\n` +
      `Please describe what you were doing when this error occurred:`
    );
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on level
      const isGlobalError = this.props.level === 'global';
      const canRetry = this.state.retryAttempts < this.maxRetryAttempts;

      return (
        <div className={`
          ${isGlobalError ? 'min-h-screen' : 'min-h-64'} 
          bg-red-50 border border-red-200 rounded-lg p-6 
          flex flex-col items-center justify-center text-center
        `}>
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <h2 className="text-xl font-semibold text-red-800">
              {isGlobalError ? 'Приложение временно недоступно' : 'Что-то пошло не так'}
            </h2>
          </div>

          <p className="text-red-700 mb-6 max-w-md">
            {isGlobalError 
              ? 'Произошла критическая ошибка. Мы работаем над ее устранением.'
              : 'Произошла ошибка при загрузке этого компонента. Попробуйте обновить страницу.'
            }
          </p>

          {this.props.showDetails && this.state.error && (
            <details className="mb-6 w-full max-w-2xl">
              <summary className="cursor-pointer text-red-600 font-medium mb-2">
                Техническая информация
              </summary>
              <div className="bg-red-100 p-4 rounded text-left text-sm">
                <p className="font-medium mb-2">Ошибка: {this.state.error.message}</p>
                <p className="text-xs text-red-600 mb-2">ID: {this.state.errorId}</p>
                {this.state.error.stack && (
                  <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Повторить ({this.maxRetryAttempts - this.state.retryAttempts} попыток)
              </button>
            )}

            <button
              onClick={this.handleReset}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Сбросить
            </button>

            <button
              onClick={this.handleReload}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить страницу
            </button>

            <button
              onClick={this.handleContactSupport}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Связаться с поддержкой
            </button>
          </div>

          {!canRetry && (
            <p className="text-sm text-red-600 mt-4">
              Максимальное количество попыток исчерпано. Пожалуйста, обратитесь в службу поддержки.
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
