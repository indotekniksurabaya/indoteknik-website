import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tentang: resolve(__dirname, 'tentang.html'),
        portofolio: resolve(__dirname, 'portofolio.html'),
        galeri: resolve(__dirname, 'galeri.html'),
        katalog: resolve(__dirname, 'katalog.html'),
        kontak: resolve(__dirname, 'kontak.html')
      }
    }
  }
});
