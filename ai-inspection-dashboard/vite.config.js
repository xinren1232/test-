import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/', // 修改为根路径，方便开发环境访问
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@services': resolve(__dirname, 'src/services'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
    host: '0.0.0.0',
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
    },
    hmr: {
      overlay: false
    },
    proxy: {
      // DeepSeek API代理配置
      '/deepseek-api': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deepseek-api/, '')
      },
      // 本地API代理配置 - 修复端口为3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // 百度搜索API代理配置
      '/api/baidu': {
        target: 'https://api.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/baidu/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('百度代理错误', err);
          });
        }
      },
      // 知识库API代理
      '/knowledge-api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/knowledge-api/, '/api'),
        secure: false
      }
    },
    historyApiFallback: {
      rewrites: [
        { from: /^\/.*$/, to: '/index.html' }
      ]
    }
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'echarts': ['echarts/core']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['element-plus', '@element-plus/icons-vue', 'echarts/core']
  }
})
