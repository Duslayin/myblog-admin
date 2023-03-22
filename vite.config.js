import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  
  //检查process.cwd()路径下.env.development.local、.env.development、.env.local、.env这四个环境文件
  loadEnv(mode, process.cwd());
  return {
    define: {
      'process.env': process.env
    },
    // base: '',
    plugins: [vue()],
    server: {
      hmr: true,
      port: 3001,
      proxy: {
        '/api': {
          target: "http://47.101.180.9:8081",
          secure: false,
          changeOrigin: true,
          pathRewrite: {
            "^api": "/api"
          }
        }
      }
    },
    resolve: {
      // 配置@表示src目录
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
