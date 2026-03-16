# 🚀 立即部署 Skills 到线上

## ✅ 当前状态

所有 6 个 skills 的代码已经完整实现：

1. ✅ **Sentiment Analyzer** - 情感分析（使用 sentiment 库）
2. ✅ **Email Validator** - 邮箱验证（使用 validator 库）
3. ✅ **Web Scraper** - 网页抓取（使用 axios + cheerio）
4. ✅ **Translation API** - 翻译服务（demo 实现）
5. ✅ **Image Generator** - 图片生成（placeholder 实现）
6. ✅ **PDF Parser** - PDF 解析（使用 pdf-parse）

## 🎯 部署步骤（5分钟完成）

### 步骤 1: 安装依赖

```bash
cd 000xxx_skills
npm install
```

### 步骤 2: 本地测试（可选）

```bash
# 启动本地开发服务器
npm run dev

# 在另一个终端测试
chmod +x test-local.sh
./test-local.sh
```

### 步骤 3: 部署到 Vercel

```bash
# 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel deploy --prod
```

部署过程中会提示：
- **Set up and deploy?** → Yes
- **Which scope?** → 选择你的账户
- **Link to existing project?** → No
- **Project name?** → 000xxx-skills（或自定义）
- **Directory?** → ./（当前目录）

### 步骤 4: 配置环境变量

部署完成后，在 Vercel Dashboard 中：

1. 进入项目 Settings → Environment Variables
2. 添加环境变量：
   - **Name:** `SKILL_AUTH_TOKEN`
   - **Value:** `claw0x_bridge_2026`
   - **Environment:** Production, Preview, Development
3. 点击 Save

### 步骤 5: 重新部署（应用环境变量）

```bash
vercel deploy --prod
```

### 步骤 6: 获取部署 URL

部署成功后，你会看到类似这样的 URL：
```
https://000xxx-skills-xxxxx.vercel.app
```

### 步骤 7: 测试线上 API

```bash
# 测试情感分析
curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/sentiment \
  -H "Authorization: Bearer claw0x_bridge_2026" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!"}'

# 测试邮箱验证
curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/validate-email \
  -H "Authorization: Bearer claw0x_bridge_2026" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 步骤 8: 更新数据库配置

在 Supabase SQL Editor 中执行：

```sql
-- 更新所有 6 个 skills 的 endpoint_url
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

-- 验证更新
SELECT name, slug, endpoint_url, is_active 
FROM skills 
WHERE seller_id = (
  SELECT id FROM users 
  WHERE wallet_address = '0x1234567890123456789012345678901234567890'
);
```

### 步骤 9: 通过 API Gateway 测试

现在你可以通过 Claw0x 平台的 API Gateway 调用这些 skills：

```bash
# 1. 在平台上创建 API Key（Dashboard > API Keys）
# 2. 获取 skill_id（Dashboard > Skills）
# 3. 调用 API Gateway

curl -X POST https://your-claw0x-domain.com/api/gateway/call \
  -H "Authorization: Bearer YOUR_CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill_id": "SKILL_UUID_FROM_DATABASE",
    "input": {
      "text": "I love this amazing product!"
    }
  }'
```

## 🎉 完成！

你的 6 个 skills 现在已经在线运行了！

## 📊 监控

在 Vercel Dashboard 中可以查看：
- 请求量
- 响应时间
- 错误率
- 日志

## 🔧 后续优化

### 1. Image Generator - 集成真实 AI 服务

```typescript
// 在 api/generate-image.ts 中
// 集成 OpenAI DALL-E
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: prompt,
  n: 1,
  size: "1024x1024"
});
```

### 2. Translation API - 集成 Google Translate

```typescript
// 在 api/translate.ts 中
import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY
});

const [translation] = await translate.translate(text, target_lang);
```

### 3. 添加缓存

```typescript
// 使用 Vercel KV 或 Redis
import { kv } from '@vercel/kv';

const cacheKey = `sentiment:${hash(text)}`;
const cached = await kv.get(cacheKey);
if (cached) return cached;

// ... 执行分析
await kv.set(cacheKey, result, { ex: 3600 }); // 缓存 1 小时
```

## 💰 成本

**Vercel 免费额度：**
- 100GB 带宽/月
- 100 小时执行时间/月
- 无限请求数

**预计成本：**
- 0-10,000 调用/月：$0
- 10,000-100,000 调用/月：$0-20
- 100,000+ 调用/月：考虑升级到 Pro ($20/月)

## 🐛 故障排除

### 部署失败
```bash
# 检查 package.json 是否正确
# 确保所有依赖都已安装
npm install
vercel deploy --prod --debug
```

### 认证失败
```bash
# 确认环境变量已设置
vercel env ls

# 如果没有，添加环境变量
vercel env add SKILL_AUTH_TOKEN
```

### API 返回 500 错误
```bash
# 查看 Vercel 日志
vercel logs
```

## 📞 需要帮助？

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查环境变量配置
3. 测试本地是否正常运行
4. 查看 README.md 中的详细文档

---

**准备好了吗？** 运行 `cd 000xxx_skills && npm install && vercel deploy --prod` 开始部署！
