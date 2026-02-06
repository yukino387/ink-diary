#!/usr/bin/env node
/**
 * 墨记 - 终极构建脚本
 * 支持多环境部署 (GitHub Pages / Netlify)
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取部署目标
const deployTarget = process.env.DEPLOY_TARGET || 'netlify'
const isGitHub = deployTarget === 'github'

console.log(`📝 开始构建墨记应用...`)
console.log(`🎯 部署目标: ${isGitHub ? 'GitHub Pages' : 'Netlify'}\n`)

// Step 1: 运行 Vite 构建
console.log('Step 1: 运行 Vite 构建...')
try {
  execSync('vite build', { 
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_OPTIONS: '--experimental-specifier-resolution=node' }
  })
  console.log('✅ Vite 构建完成\n')
} catch (error) {
  console.error('❌ Vite 构建失败:', error)
  process.exit(1)
}

// Step 2: 修复 index.html 路径和编码
console.log('Step 2: 修复路径和编码...')

const srcIndexPath = path.join(__dirname, 'index.html')
const distIndexPath = path.join(__dirname, 'dist', 'index.html')

try {
  // 读取源文件
  const srcContent = fs.readFileSync(srcIndexPath, 'utf-8')
  
  // 读取 Vite 构建后的文件
  let distContent = fs.readFileSync(distIndexPath, 'utf-8')
  
  // 提取 Vite 注入的脚本和样式链接
  const scriptMatch = distContent.match(/<script type="module"[^>]*><\/script>/)
  const cssMatch = distContent.match(/<link rel="stylesheet"[^>]*>/)
  const pwaScriptMatch = distContent.match(/<script id="vite-plugin-pwa[^>]*><\/script>/)
  
  // 从源文件创建新的 dist/index.html
  let newContent = srcContent
  
  // 替换脚本和样式链接
  if (scriptMatch) {
    newContent = newContent.replace(
      /<script type="module" src="\/src\/main\.js[^"]*"><\/script>/,
      scriptMatch[0]
    )
  }
  
  // 在 </head> 前添加 CSS 链接
  if (cssMatch && !newContent.includes(cssMatch[0])) {
    newContent = newContent.replace('</head>', `${cssMatch[0]}\n</head>`)
  }
  
  // 在 </head> 前添加 PWA 脚本
  if (pwaScriptMatch && !newContent.includes(pwaScriptMatch[0])) {
    newContent = newContent.replace('</head>', `${pwaScriptMatch[0]}\n</head>`)
  }
  
  // 根据部署目标修复路径
  if (isGitHub) {
    // GitHub Pages: 添加 /ink-diary/ 前缀
    newContent = newContent
      .replace(/href="\/favicon\.svg"/g, 'href="/ink-diary/favicon.svg"')
      .replace(/href="\/manifest\.json"/g, 'href="/ink-diary/assets/manifest.json"')
      .replace(/src="\/service-worker\.js"/g, 'src="/ink-diary/sw.js"')
  } else {
    // Netlify: 使用根路径，移除 /ink-diary/ 前缀（如果有）
    newContent = newContent
      .replace(/href="\/ink-diary\//g, 'href="/')
      .replace(/src="\/ink-diary\//g, 'src="/')
  }
  
  // 强制以 UTF-8 写入
  fs.writeFileSync(distIndexPath, newContent, 'utf-8')
  
  console.log('✅ 路径和编码修复完成\n')
} catch (error) {
  console.error('❌ 修复失败:', error)
  process.exit(1)
}

console.log('🎉 构建成功！')
console.log(`📦 部署目标: ${isGitHub ? 'GitHub Pages (/ink-diary/)' : 'Netlify (/)'}`)
console.log('📁 输出目录: dist/')
console.log('🌐 本地预览: npx serve dist')
