import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist/types',
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DevFlowRenderer',
      formats: ['es', 'umd'],
      fileName: (format) => `devflow-renderer.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'element-plus', 'echarts', 'element-plus/es', 'element-plus/es/components/message/style/css'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          echarts: 'echarts'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css'
          }
          return assetInfo.name || 'asset'
        }
      }
    },
    cssCodeSplit: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
