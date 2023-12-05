import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import nodePolyfills from 'rollup-plugin-polyfill-node'

const MODE = process.env.NODE_ENV
const development = MODE === 'development'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    development &&
    nodePolyfills({
      include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js')],
      http: true,
      crypto: true
    })
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      util: 'util/',
      buffer: 'buffer/',
    }
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills({ crypto: true, http: true })]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
