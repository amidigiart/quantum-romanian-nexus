
import React, { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat Error Boundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Track error in analytics
    analyticsService.trackError(error, 'ChatErrorBoundary');
    analyticsService.trackEvent('chat_error_boundary', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack,
      retry_count: this.state.retryCount
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="bg-red-950/20 border-red-500/30 p-6 m-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Chat Error</h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            Something went wrong with the chat interface. This error has been logged 
            and will help us improve the application.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 p-3 bg-black/20 rounded text-xs">
              <summary className="cursor-pointer text-gray-400 mb-2">
                Error Details (Development Mode)
              </summary>
              <pre className="text-red-300 whitespace-pre-wrap overflow-auto">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
                {this.state.errorInfo?.componentStack && (
                  '\n\nComponent Stack:' + this.state.errorInfo.componentStack
                )}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry {this.state.retryCount > 0 && `(${this.state.retryCount})`}
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white"
            >
              Refresh Page
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
