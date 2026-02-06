# 墨记 - PowerShell 构建脚本
# 使用 UTF-8 编码构建，避免中文乱码

# 设置 UTF-8 编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 设置环境变量
$env:NODE_OPTIONS = "--experimental-specifier-resolution=node"
$env:VITE_CJS_IGNORE_WARNING = "true"

Write-Host "📝 正在构建墨记应用..." -ForegroundColor Cyan
Write-Host ""

# 执行构建
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 构建成功！" -ForegroundColor Green
    Write-Host ""
    
    # 生成 Cloudflare Pages 配置文件
    Write-Host "📄 正在生成 Cloudflare Pages 配置文件..." -ForegroundColor Cyan
    
    $wranglerContent = @"
# Cloudflare Pages 配置文件
# 由 build.ps1 自动生成
# 文档: https://developers.cloudflare.com/pages/platform/headers/

name = "ink-diary"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
output_directory = "dist"

[build.environment]
NODE_VERSION = "20"

# 单页应用路由规则 - 所有路由指向 index.html
[[redirects]]
from = "/*"
to = "/index.html"
status = 200

# manifest.json 响应头
[[headers]]
for = "/manifest.json"
[headers.values]
Content-Type = "application/manifest+json"
Access-Control-Allow-Origin = "*"

# Service Worker 不缓存
[[headers]]
for = "/service-worker.js"
[headers.values]
Cache-Control = "no-cache"

# JS 文件长期缓存
[[headers]]
for = "/*.js"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

# CSS 文件长期缓存
[[headers]]
for = "/*.css"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

# 字体文件长期缓存
[[headers]]
for = "/*.woff2"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

# 图片文件长期缓存
[[headers]]
for = "/*.png"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "/*.svg"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "/*.ico"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"
"@
    
    $wranglerContent | Out-File -FilePath "wrangler.toml" -Encoding UTF8
    Write-Host "✅ wrangler.toml 生成完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 构建输出目录: dist/"
    Write-Host "🌐 本地预览: npx serve dist"
    Write-Host ""
    Write-Host "☁️ Cloudflare Pages 部署:" -ForegroundColor Cyan
    Write-Host "   1. 访问 https://dash.cloudflare.com/pages"
    Write-Host "   2. 创建项目并连接 GitHub 仓库"
    Write-Host "   3. 或使用命令: wrangler pages deploy dist"
} else {
    Write-Host ""
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    exit 1
}
