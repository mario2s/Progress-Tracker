import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppModeProvider } from './contexts/AppModeContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AppModeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppModeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
