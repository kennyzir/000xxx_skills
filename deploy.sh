#!/bin/bash

# 一键部署脚本
# Usage: ./deploy.sh

set -e

echo "🚀 Claw0x Skills 部署脚本"
echo "=========================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
  echo "❌ 错误：请在 000xxx_skills 目录中运行此脚本"
  exit 1
fi

# 步骤 1: 安装依赖
echo "📦 步骤 1/5: 安装依赖..."
npm install
echo "✅ 依赖安装完成"
echo ""

# 步骤 2: 检查 Vercel CLI
echo "🔧 步骤 2/5: 检查 Vercel CLI..."
if ! command -v vercel &> /dev/null; then
  echo "⚠️  Vercel CLI 未安装，正在安装..."
  npm install -g vercel
  echo "✅ Vercel CLI 安装完成"
else
  echo "✅ Vercel CLI 已安装"
fi
echo ""

# 步骤 3: 登录 Vercel（如果需要）
echo "🔐 步骤 3/5: 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
  echo "⚠️  请登录 Vercel..."
  vercel login
else
  echo "✅ 已登录 Vercel"
fi
echo ""

# 步骤 4: 部署到 Vercel
echo "🚀 步骤 4/5: 部署到 Vercel..."
echo "⚠️  如果是首次部署，请按照提示操作："
echo "   - Set up and deploy? → Yes"
echo "   - Project name? → 000xxx-skills"
echo "   - Directory? → ./"
echo ""
vercel deploy --prod

# 获取部署 URL
DEPLOY_URL=$(vercel ls --prod 2>/dev/null | grep "000xxx-skills" | head -1 | awk '{print $2}')

if [ -z "$DEPLOY_URL" ]; then
  echo "⚠️  无法自动获取部署 URL，请手动查看"
  echo "   运行: vercel ls --prod"
else
  echo ""
  echo "✅ 部署成功！"
  echo "📍 部署 URL: https://$DEPLOY_URL"
fi
echo ""

# 步骤 5: 配置环境变量
echo "🔧 步骤 5/5: 配置环境变量..."
echo "⚠️  请在 Vercel Dashboard 中设置环境变量："
echo "   1. 访问: https://vercel.com/dashboard"
echo "   2. 选择项目: 000xxx-skills"
echo "   3. Settings → Environment Variables"
echo "   4. 添加: SKILL_AUTH_TOKEN = claw0x_bridge_2026"
echo "   5. 保存后重新部署: vercel deploy --prod"
echo ""

# 提供下一步指引
echo "🎉 部署完成！"
echo ""
echo "📋 下一步操作："
echo "1. 在 Vercel Dashboard 设置环境变量（见上方说明）"
echo "2. 重新部署: vercel deploy --prod"
echo "3. 测试 API: curl -X POST https://$DEPLOY_URL/api/sentiment \\"
echo "     -H 'Authorization: Bearer claw0x_bridge_2026' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"text\": \"I love this!\"}'"
echo "4. 更新数据库: 在 Supabase 执行 update-database.sql"
echo ""
echo "📖 详细文档: 查看 DEPLOY_NOW.md"
