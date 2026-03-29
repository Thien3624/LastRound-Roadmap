import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Custom domain → base: '/'
  // github.io/repo-name (hiện tại) → base: '/LastRound-Roadmap/'
  base: '/LastRound-Roadmap/',
})
