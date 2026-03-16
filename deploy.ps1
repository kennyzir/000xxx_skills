# PowerShell 部署脚本（Windows）
# Usage: .\deploy.ps1

Write-Host "🚀 Claw0x Skills 部署脚本" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误：请在 000xxx_skills 目录中运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤 1: 安装依赖
Write-Host "📦 步骤 1/5: 安装依赖..." -ForegroundColor Yellow
npm install
Write-Host "✅ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 步骤 2: 检查 Vercel CLI
Write-Host "🔧 步骤 2/5: 检查 Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI 未安装，正在安装..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI 安装完成" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI 已安装" -ForegroundColor Green
}
Write-Host ""

# 步骤 3: 登录 Vercel
Write-Host "🔐 步骤 3/5: 检查 Vercel 登录状态..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  请登录 Vercel..." -ForegroundColor Yellow
    vercel login
} else {
    Write-Host "✅ 已登录 Vercel" -ForegroundColor Green
}
Write-Host ""

# 步骤 4: 部署到 Vercel
Write-Host "🚀 步骤 4/5: 部署到 Vercel..." -ForegroundColor Yellow
Write-Host "⚠️  如果是首次部署，请按照提示操作：" -ForegroundColor Yellow
Write-Host "   - Set up and deploy? → Yes"
Write-Host "   - Project name? → 000xxx-skills"
Write-Host "   - Directory? → ./"
Write-Host ""
vercel deploy --prod

Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""

# 步骤 5: 配置环境变量
Write-Host "🔧 步骤 5/5: 配置环境变量..." -ForegroundColor Yellow
Write-Host "⚠️  请在 Vercel Dashboard 中设置环境变量：" -ForegroundColor Yellow
Write-Host "   1. 访问: https://vercel.com/dashboard"
Write-Host "   2. 选择项目: 000xxx-skills"
Write-Host "   3. Settings → Environment Variables"
Write-Host "   4. 添加: SKILL_AUTH_TOKEN = claw0x_bridge_2026"
Write-Host "   5. 保存后重新部署: vercel deploy --prod"
Write-Host ""

# 提供下一步指引
Write-Host "🎉 部署流程完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步操作：" -ForegroundColor Cyan
Write-Host "1. 在 Vercel Dashboard 设置环境变量（见上方说明）"
Write-Host "2. 重新部署: vercel deploy --prod"
Write-Host "3. 测试 API（替换 YOUR-URL）:"
Write-Host '   curl -X POST https://YOUR-URL.vercel.app/api/sentiment \'
Write-Host '     -H "Authorization: Bearer claw0x_bridge_2026" \'
Write-Host '     -H "Content-Type: application/json" \'
Write-Host '     -d "{\"text\": \"I love this!\"}"'
Write-Host "4. 更新数据库: 在 Supabase 执行 update-database.sql"
Write-Host ""
Write-Host "📖 详细文档: 查看 DEPLOY_NOW.md" -ForegroundColor Cyan
