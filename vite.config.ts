
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // تنظیم base به './' باعث می‌شود تمام آدرس‌ها در فایل خروجی به صورت نسبی باشند
  // این کار مشکل ۴۰۴ را در GitHub Pages که پروژه در زیرپوشه /taskino/ قرار دارد حل می‌کند
  base: './',
  build: {
    outDir: 'dist',
  },
});
