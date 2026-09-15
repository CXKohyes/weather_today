import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Windows 下原生文件监听可能因临时文件锁定崩溃（EBUSY），改用轮询更稳定
      usePolling: true,
    },
  },
});
