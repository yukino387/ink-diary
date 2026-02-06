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

    # 自动生成 Cloudflare Pages 配置文件到 dist 目录
    Write-Host "🔧 正在生成 Cloudflare Pages 配置文件..." -ForegroundColor Cyan

    # 生成 _headers 文件
    $headersContent = @"
/manifest.json
  Content-Type: application/manifest+json
  Access-Control-Allow-Origin: *

/service-worker.js
  Cache-Control: no-cache

/*.js
  Cache-Control: public, max-age=31536000

/*.css
  Cache-Control: public, max-age=31536000
"@
    $headersContent | Out-File -FilePath "dist\_headers" -Encoding UTF8 -NoNewline
    Write-Host "  ✓ 已生成 _headers" -ForegroundColor Green

    # 生成 _redirects 文件
    $redirectsContent = "/* /index.html 200"
    $redirectsContent | Out-File -FilePath "dist\_redirects" -Encoding UTF8 -NoNewline
    Write-Host "  ✓ 已生成 _redirects" -ForegroundColor Green

    # 生成 _routes.json (Cloudflare Pages 路由配置)
    $routesContent = @"
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
"@
    $routesContent | Out-File -FilePath "dist\_routes.json" -Encoding UTF8 -NoNewline
    Write-Host "  ✓ 已生成 _routes.json" -ForegroundColor Green

    Write-Host ""
    Write-Host "📁 构建输出目录: dist/"
    Write-Host "🌐 本地预览: npx serve dist"
    Write-Host ""
    Write-Host "🚀 部署提示:" -ForegroundColor Yellow
    Write-Host "  • Cloudflare Pages: 直接上传 dist 文件夹" -ForegroundColor Gray
    Write-Host "  • GitHub Pages: 已配置自动部署工作流" -ForegroundColor Gray
    Write-Host "  • Netlify: 使用 netlify.toml 配置" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    exit 1
}
