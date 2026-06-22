import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// This is a scroll-driven story whose opening hero is the intended entry point.
// Left to the browser, a reload restores the previous scroll offset and lands on
// the half-lifted curtain (the "second screen"); pin restoration to manual so
// every reload starts at the top, on the first screen.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
