'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary for Firebase chunk loading errors
export default class FirebaseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    console.error('🚨 Error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    console.error('🚨 Error boundary caught error:', error);
    console.error('🚨 Error info:', errorInfo);
    
    // Check for chunk loading errors specifically  
    if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
      console.error('🚨 Chunk loading error detected');
      
      // Auto-reload after a short delay for chunk errors
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError && this.props.fallback) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}