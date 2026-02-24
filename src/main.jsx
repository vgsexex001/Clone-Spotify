import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SpotifyClone from './spotify-clone.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpotifyClone />
  </StrictMode>,
)
