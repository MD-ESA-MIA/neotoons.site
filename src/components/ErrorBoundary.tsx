import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred. Please try again later.";
      let errorTitle = "Something went wrong";
      let isApiError = false;

      try {
        // Check if the error message is our custom JSON error format
        const parsedError = JSON.parse(this.state.errorInfo || "");
        if (parsedError.error) {
          errorMessage = parsedError.error;
          isApiError = true;
          
          if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
            errorTitle = "Quota Exceeded";
            errorMessage = "You have reached your API usage limit. Please try again later or upgrade your plan.";
          } else if (errorMessage.includes("key") || errorMessage.includes("unauthorized") || errorMessage.includes("permission")) {
            errorTitle = "Authentication Error";
            errorMessage = "There was a problem with your API credentials or permissions. Please check your settings.";
          }
        }
      } catch (e) {
        // Not a JSON error, use default or raw message
        if (this.state.error?.message) {
          if (this.state.error.message.includes("quota")) {
            errorTitle = "Quota Exceeded";
            errorMessage = "API quota limit reached.";
          }
        }
      }

      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-[32px] text-center space-y-6 border-rose-500/20">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold text-white">{errorTitle}</h1>
              <p className="text-text-muted leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={this.handleReset}
                className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <a 
                href="/"
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-black/40 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-rose-400 whitespace-pre-wrap">
                  {this.state.error.stack}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
