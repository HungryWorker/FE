import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 백엔드 application.yml의 app.oauth2.redirect-uri 기본값이
// http://localhost:3000/oauth/callback 이라서 포트를 3000으로 고정합니다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
    },
  },
})
