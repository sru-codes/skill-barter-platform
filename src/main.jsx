import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import GeminiProvider from './context/GeminiContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GeminiProvider>
      <App />
    </GeminiProvider>
  </React.StrictMode>,
)
