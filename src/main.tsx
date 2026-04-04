import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Using dynamic types for the ErrorBoundary to bypass library resolution issues in the IDE
class ErrorBoundary extends React.Component<any, any> {
  public state = { hasError: false, error: null };

  public static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error at root level:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          backgroundColor: '#09090b', 
          color: '#ef4444', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>Application Crash Detected</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem', maxWidth: '500px' }}>
            The application encountered an unexpected error. This usually happens when the data from the server is corrupted or incompatible.
          </p>
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            textAlign: 'left', 
            width: '100%', 
            maxWidth: '600px', 
            overflow: 'auto',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <code style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
              {(this.state.error as any)?.name}: {(this.state.error as any)?.message}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              backgroundColor: '#10b981', 
              color: '#09090b', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.75rem', 
              fontWeight: 'bold', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return (this.props as any).children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
