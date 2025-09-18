import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { useToast } from './use-toast';
import { ARABIC_ERROR_BOUNDARY_MESSAGES } from '@/lib/arabicErrorBoundaryMessages';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, '\nComponent Stack:\n', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // TODO: Evaluate more robust recovery for top-level errors:
    // 1. Redirection: For unrecoverable errors, consider navigating to a safe page (e.g., window.location.href = '/').
    // 2. Global State Reset: If the error might be due to corrupted global state, implement a mechanism to reset relevant parts of the application state.
    // 3. User Feedback: Offer more options to the user, such as submitting an error report or clearing local storage.
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="max-w-lg mx-auto mt-8">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">{ARABIC_ERROR_BOUNDARY_MESSAGES.UNEXPECTED_ERROR_TITLE}</CardTitle>
            <CardDescription>
              {ARABIC_ERROR_BOUNDARY_MESSAGES.UNEXPECTED_ERROR_DESCRIPTION}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium text-sm mb-2">{ARABIC_ERROR_BOUNDARY_MESSAGES.ERROR_DETAILS_TITLE}</h4>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 ml-2" />
                {ARABIC_ERROR_BOUNDARY_MESSAGES.RETRY_BUTTON}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                {ARABIC_ERROR_BOUNDARY_MESSAGES.RELOAD_PAGE_BUTTON}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  const WrappedComponent = function (props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

// Hook for error reporting
export function useErrorHandler() {
  const { toast } = useToast();
  return (error: Error, errorInfo?: React.ErrorInfo | string) => {
    console.error('Manual error report:', error, errorInfo);
    
    // Here you could integrate with error reporting services
    // like Sentry, LogRocket, etc.
    
    // For now, just log to console and potentially show a toast
    if (typeof window !== 'undefined' && 'navigator' in window) {
      toast({
        title: ARABIC_ERROR_BOUNDARY_MESSAGES.MANUAL_ERROR_TITLE,
        description: ARABIC_ERROR_BOUNDARY_MESSAGES.MANUAL_ERROR_DESCRIPTION(error.message),
        variant: "destructive",
      });
    }
  };
}