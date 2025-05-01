import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html')
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
})
