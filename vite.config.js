import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { fixEncodingPlugin } from './vite-plugin-fix-encoding.js'

// 根据环境变量判断部署目标
// GITHUB_PAGES: GitHub Pages (子路径 /ink-diary/)
// NETLIFY: Netlify (根路径 /)
// 默认: 根路径 /
const getBase = () => {
  if (process.env.DEPLOY_TARGET === 'github') {
    return '/ink-diary/'
  }
  // Netlify 或其他平台使用根路径
  return '/'
}

// https://vitejs.dev/config/
export default defineConfig({
  base: getBase(),
  plugins: [
    vue(),
    fixEncodingPlugin(), // 修复 Windows 中文乱码
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // 使用自定义manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365天
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ]
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
