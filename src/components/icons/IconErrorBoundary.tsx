import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class IconErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Icon loading error caught by boundary:', error);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback or default fallback
      return this.props.fallback || (
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="text-gray-400"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeWidth={2} d="M8 14s1.5 2 4 2 4-2 4-2" />
          <path strokeWidth={2} d="M9 9h.01" />
          <path strokeWidth={2} d="M15 9h.01" />
        </svg>
      );
    }

    return this.props.children;
  }
}

export default IconErrorBoundary;