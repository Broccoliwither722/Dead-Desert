// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public', // Change public directory to 'static'
  // publicDir: path.resolve(__dirname, 'assets'), // Use an absolute path
  // publicDir: false, // Disable the public directory
})