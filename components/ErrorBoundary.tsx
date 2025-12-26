
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">The application encountered an unexpected error. Your data is safe in local storage.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#008060] text-white font-bold rounded-xl shadow-lg hover:bg-[#006e52] transition-all"
          >
            Reload Application
          </button>
        </div>
      );
    }

    // Fix: Access children from this.props
    return this.props.children;
  }
}
