# ⚡ 快速开始 - 5 分钟部署

## 🎯 目标
让 6 个 skills 在线运行，可以通过 API Gateway 调用。

## ✅ 代码状态
所有代码已完成，可以直接部署！

## 🚀 三步部署

### 1️⃣ 安装并部署（2分钟）

```bash
cd 000xxx_skills
npm install
npm install -g vercel
vercel login
vercel deploy --prod
```

### 2️⃣ 配置环境变量（1分钟）

在 Vercel Dashboard:
1. 进入项目 Settings → Environment Variables
2. 添加: `SKILL_AUTH_TOKEN` = `claw0x_bridge_2026`
3. 重新部署: `vercel deploy --prod`

### 3️⃣ 更新数据库（2分钟）

在 Supabase SQL Editor 执行:

```sql
-- 替换 YOUR-VERCEL-URL
UPDATE skills 
SET endpoint_url = 'https://YOUR-VERCEL-URL.vercel.app/api/' || 
  CASE 
    WHEN slug = 'web-scraper-pro' THEN 'scrape'
    WHEN slug = 'email-validator' THEN 'validate-email'
    WHEN slug = 'image-generator' THEN 'generate-image'
    WHEN slug = 'sentiment-analyzer' THEN 'sentiment'
    WHEN slug = 'pdf-parser' THEN 'parse-pdf'
    WHEN slug = 'translation-api' THEN 'translate'
  END
WHERE seller_id = (
  SELECT id FROM users 
  WHERE wallet_address = '0x1234567890123456789012345678901234567890'
);
```

## 🧪 测试

```bash
# 测试情感分析
curl -X POST https://YOUR-URL.vercel.app/api/sentiment \
  -H "Authorization: Bearer claw0x_bridge_2026" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this!"}'
```

## 🎉 完成！

你的 skills 现在已经在线运行了！

## 📚 详细文档

- `DEPLOY_NOW.md` - 完整部署指南
- `README.md` - API 文档
- `../SKILLS_READY_TO_DEPLOY.md` - 总体说明

## 🆘 遇到问题？

1. 查看 Vercel 日志: `vercel logs`
2. 检查环境变量: `vercel env ls`
3. 本地测试: `npm run dev`
