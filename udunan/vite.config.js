import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ignition": path.resolve(__dirname, "./ignition"),
      process: "process/browser",
      buffer: "buffer",
      util: "util",
      extensions: ['.js', '.jsx']
    },
  },
  server: {
    historyApiFallback: true,
    fs: {
      allow: [".."], // Allow Vite to access files outside src
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})