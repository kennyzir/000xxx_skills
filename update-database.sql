-- 更新 Skills 端点 URL 到 Vercel 部署地址
-- 在 Supabase SQL Editor 中执行此脚本

-- ⚠️ 重要：将 YOUR-VERCEL-URL 替换为你的实际 Vercel 部署 URL
-- 例如：https://000xxx-skills-abc123.vercel.app

DO $$
DECLARE
  base_url TEXT := 'https://YOUR-VERCEL-URL.vercel.app/api/';
  demo_user_id UUID;
BEGIN
  -- 获取 demo 用户 ID
  SELECT id INTO demo_user_id 
  FROM users 
  WHERE wallet_address = '0x1234567890123456789012345678901234567890';

  -- 更新所有 6 个 skills 的 endpoint_url
  UPDATE skills 
  SET 
    endpoint_url = base_url || 
      CASE 
        WHEN slug = 'web-scraper-pro' THEN 'scrape'
        WHEN slug = 'email-validator' THEN 'validate-email'
        WHEN slug = 'image-generator' THEN 'generate-image'
        WHEN slug = 'sentiment-analyzer' THEN 'sentiment'
        WHEN slug = 'pdf-parser' THEN 'parse-pdf'
        WHEN slug = 'translation-api' THEN 'translate'
      END,
    updated_at = NOW()
  WHERE seller_id = demo_user_id;

  -- 输出更新结果
  RAISE NOTICE 'Updated % skills', (
    SELECT COUNT(*) 
    FROM skills 
    WHERE seller_id = demo_user_id
  );
END $$;

-- 验证更新结果
SELECT 
  name,
  slug,
  endpoint_url,
  is_active,
  updated_at
FROM skills 
WHERE seller_id = (
  SELECT id FROM users 
  WHERE wallet_address = '0x1234567890123456789012345678901234567890'
)
ORDER BY name;

-- 预期输出：6 个 skills，endpoint_url 都已更新为新的 Vercel URL
