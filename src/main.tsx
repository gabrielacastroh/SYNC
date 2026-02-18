import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/app/App';
import { hydrateStores, useUIStore } from '@/store';
import { migrateSimulationTitles } from '@/store/migrateSimulationTitles';
import '@/app/globals.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

// Tema: por defecto light; si hay guardado, aplicarlo antes de pintar
(function applySavedTheme() {
  try {
    const saved = localStorage.getItem('sync-theme');
    const theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    useUIStore.setState({ theme });
  } catch {
    document.documentElement.classList.add('light');
  }
})();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#111' }}>
          <h1 style={{ fontSize: 18 }}>Algo salió mal</h1>
          <pre style={{ marginTop: 8, fontSize: 12, overflow: 'auto' }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  hydrateStores();
  migrateSimulationTitles();
} catch {
  // first load: no persisted data
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
