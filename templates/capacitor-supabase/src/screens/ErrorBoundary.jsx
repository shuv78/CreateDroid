import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Optionally log to Supabase or external service
    try {
      const logError = async () => {
        const { supabase } = await import('../db/supabase');
        await supabase.from('error_logs').insert({
          message: error?.message || 'Unknown error',
          stack: error?.stack,
          component_stack: errorInfo?.componentStack,
          user_agent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        });
      };
      logError();
    } catch { /* silent fail on error logging */ }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ fontSize: '14px', opacity: 0.7, margin: '0 0 24px', maxWidth: '320px' }}>
            An unexpected error occurred. Our team has been notified.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              fontSize: '12px',
              background: '#1a1a2e',
              padding: '16px',
              borderRadius: '8px',
              maxWidth: '100%',
              overflow: 'auto',
              marginBottom: '24px',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#7c3aed',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Go Home
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
