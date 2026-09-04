import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/lecturify/' : '/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
