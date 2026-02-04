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
    Write-Host "📁 构建输出目录: dist/"
    Write-Host "🌐 本地预览: npx serve dist"
} else {
    Write-Host ""
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    exit 1
}
