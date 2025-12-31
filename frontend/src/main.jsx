import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

console.log('🎬 [main.jsx] Script loaded - React starting...');
console.log('📍 [main.jsx] Current URL:', window.location.href);
console.log('🌐 [main.jsx] Document ready state:', document.readyState);

const rootElement = document.getElementById('root');
console.log('🎯 [main.jsx] Root element found:', !!rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  );
  console.log('✅ [main.jsx] React app rendered successfully');
} else {
  console.error('❌ [main.jsx] Root element not found!');
}
