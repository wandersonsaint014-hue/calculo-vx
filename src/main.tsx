import React from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles.css'

const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('vx-update-ready'))
  },
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('vx-offline-ready'))
  },
})

window.addEventListener('vx-apply-update', () => updateSW(true))

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
)
