import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserModeProvider } from './context/UserModeContext'
import { TourHighlightProvider } from './context/TourHighlightContext'
import { PlasmaTheme } from './theme'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserModeProvider>
        <TourHighlightProvider>
          <PlasmaTheme />
          <App />
        </TourHighlightProvider>
      </UserModeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)