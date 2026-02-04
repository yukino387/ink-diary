/**
 * Vite 插件：修复 Windows 构建时的中文乱码问题
 * 在构建完成后，强制将 index.html 保存为 UTF-8 编码
 */

import fs from 'fs'
import path from 'path'

export function fixEncodingPlugin() {
  return {
    name: 'fix-encoding',
    apply: 'build',
    
    closeBundle() {
      const distPath = path.resolve('dist')
      const indexPath = path.join(distPath, 'index.html')
      
      if (!fs.existsSync(indexPath)) {
        console.warn('[fix-encoding] dist/index.html 不存在')
        return
      }
      
      try {
        // 读取文件内容
        let content = fs.readFileSync(indexPath, 'utf-8')
        
        // 检查是否包含乱码特征（GBK 编码的 UTF-8 字符）
        const hasGarbledText = /ï¿½|Ä«|ÈÕ|¼Ç|Ó¦|ÓÃ/.test(content)
        
        if (hasGarbledText) {
          console.log('[fix-encoding] 检测到中文乱码，正在修复...')
          
          // 从源文件读取正确的中文内容
          const srcPath = path.resolve('index.html')
          if (fs.existsSync(srcPath)) {
            const srcContent = fs.readFileSync(srcPath, 'utf-8')
            
            // 提取关键的中文内容
            const titleMatch = srcContent.match(/<title>([^<]+)<\/title>/)
            const descMatch = srcContent.match(/<meta name="description" content="([^"]+)"/)
            const loadingTextMatch = srcContent.match(/<p class="loading-text">([^<]+)<\/p>/)
            
            // 替换乱码内容
            if (titleMatch) {
              content = content.replace(/<title>[^<]*<\/title>/, `<title>${titleMatch[1]}</title>`)
            }
            if (descMatch) {
              content = content.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${descMatch[1]}"`)
            }
            if (loadingTextMatch) {
              content = content.replace(/<p class="loading-text">[^<]*<\/p>/, `<p class="loading-text">${loadingTextMatch[1]}</p>`)
            }
            
            // 修复其他常见乱码
            content = content
              .replace(/ï¿½/g, '')
              .replace(/Ä«/g, '墨')
              .replace(/ÈÕ/g, '日')
              .replace(/¼Ç/g, '记')
              .replace(/Ó¦/g, '应')
              .replace(/ÓÃ/g, '用')
            
            // 以 UTF-8 编码写回文件
            fs.writeFileSync(indexPath, content, 'utf-8')
            console.log('[fix-encoding] 编码修复完成')
          }
        } else {
          console.log('[fix-encoding] 未检测到乱码，跳过修复')
        }
      } catch (error) {
        console.error('[fix-encoding] 修复失败:', error)
      }
    }
  }
}
