import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      // Provide polyfills for Node.js builtins
      buffer: 'buffer',
    },
  },
  define: {
    // Polyfill for Buffer
    global: 'globalThis',
  },
  build: {
    // Improve asset handling
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          solana: ['@solana/web3.js', '@solana/wallet-adapter-react']
        }
      }
    }
  }
})
