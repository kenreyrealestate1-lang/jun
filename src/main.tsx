/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Prevenir que advertencias o excepciones de permisos (audio autoplay o clipboard) generen overlays invasivos
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Si es un error esperado de Web Audio API (autoplay) o Portapapeles (permisos de iframe), silenciarlo
    if (
      event.reason?.name === 'NotAllowedError' ||
      event.reason?.name === 'AbortError' ||
      event.reason?.message?.includes('AudioContext') ||
      event.reason?.message?.includes('clipboard')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
