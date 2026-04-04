import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Harcoded workaround for TS generic resolution issues in older IDE caches
const BaseComponent = (React.Component as any);

class ErrorBoundary extends BaseComponent {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          backgroundColor: '#09090b', color: '#ef4444', minHeight: '100vh', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', fontFamily: 'sans-serif', textAlign: 'center', padding: '2rem' 
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ backgroundColor: '#10b981', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
