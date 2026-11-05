import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        catalog: resolve(__dirname, 'catalog.html'),
        contact: resolve(__dirname, 'contact.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
});
