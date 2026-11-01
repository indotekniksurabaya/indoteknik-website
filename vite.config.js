import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        tentang: resolve(import.meta.dirname, 'tentang.html'),
        portofolio: resolve(import.meta.dirname, 'portofolio.html'),
        galeri: resolve(import.meta.dirname, 'galeri.html'),
        katalog: resolve(import.meta.dirname, 'katalog.html'),
        kontak: resolve(import.meta.dirname, 'kontak.html')
      }
    }
  }
});
