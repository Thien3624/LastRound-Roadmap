import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Nếu dùng custom domain → base: '/'
  // Nếu dùng username.github.io/repo-name → base: '/repo-name/'
  base: '/',
})
