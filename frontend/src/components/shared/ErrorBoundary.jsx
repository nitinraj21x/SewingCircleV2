import React from 'react';

/**
 * ErrorBoundary Component
 * 
 * Catches and handles all unhandled React errors to prevent app crashes.
 * Provides user-friendly error messages and recovery options.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error) {
    // Determine error type for better user messaging
    let errorType = 'unknown';
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorType = 'network';
    } else if (error.message?.includes('chunk')) {
      errorType = 'chunk';
    } else if (error.message?.includes('auth')) {
      errorType = 'auth';
    }

    return {
      hasError: true,
      error,
      errorType
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // TODO: Send to error tracking service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  getUserFriendlyMessage() {
    const { errorType, error } = this.state;

    switch (errorType) {
      case 'network':
        return {
          title: 'Connection Issue',
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          action: 'Retry'
        };
      case 'chunk':
        return {
          title: 'Update Available',
          message: 'A new version of the application is available. Please reload the page.',
          action: 'Reload'
        };
      case 'auth':
        return {
          title: 'Authentication Error',
          message: 'Your session may have expired. Please log in again.',
          action: 'Go to Login'
        };
      default:
        return {
          title: 'Something Went Wrong',
          message: error?.message || 'An unexpected error occurred. Please try again.',
          action: 'Try Again'
        };
    }
  }

  render() {
    if (this.state.hasError) {
      const { title, message, action } = this.getUserFriendlyMessage();
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <div style={styles.iconContainer}>
              <svg
                style={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 style={styles.title}>{title}</h2>
            <p style={styles.message}>{message}</p>

            <div style={styles.actions}>
              <button
                onClick={this.state.errorType === 'chunk' ? this.handleReload : this.handleRetry}
                style={styles.primaryButton}
              >
                {action}
              </button>
              
              {this.state.errorType !== 'chunk' && (
                <button
                  onClick={this.handleReload}
                  style={styles.secondaryButton}
                >
                  Reload Page
                </button>
              )}
            </div>

            {isDevelopment && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development Only)</summary>
                <pre style={styles.errorDetails}>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {'\n\n'}
                  <strong>Stack:</strong>
                  {'\n'}
                  {this.state.error.stack}
                  {'\n\n'}
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong>
                      {'\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline styles for error boundary (to avoid CSS dependencies)
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px'
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  icon: {
    width: '64px',
    height: '64px',
    color: '#ef4444'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '12px'
  },
  message: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  details: {
    marginTop: '24px',
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    padding: '16px'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '12px'
  },
  errorDetails: {
    fontSize: '12px',
    color: '#6b7280',
    overflow: 'auto',
    maxHeight: '300px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
};

export default ErrorBoundary;
