# 000xxx_skills - Claw0x Platform Skills

6 production-ready API skills for the Claw0x marketplace.

## 🚀 Skills

1. **Web Scraper Pro** (`/api/scrape`) - Extract structured data from websites
2. **Email Validator** (`/api/validate-email`) - Validate email addresses
3. **Image Generator** (`/api/generate-image`) - Generate images from text
4. **Sentiment Analyzer** (`/api/sentiment`) - Analyze text sentiment
5. **PDF Parser** (`/api/parse-pdf`) - Extract text from PDFs
6. **Translation API** (`/api/translate`) - Translate text between languages

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Edit `.env` and set your auth token:
```
SKILL_AUTH_TOKEN=claw0x_bridge_2026
```

## 🏃 Running Locally

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 🧪 Testing

Test a skill locally:

```bash
curl -X POST http://localhost:3000/api/sentiment \
  -H "Authorization: Bearer claw0x_bridge_2026" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!"}'
```

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel deploy --prod
```

4. Set environment variables in Vercel Dashboard:
   - `SKILL_AUTH_TOKEN` = `claw0x_bridge_2026`

### Update Database

After deployment, update the Claw0x database with your new URLs:

```sql
UPDATE skills 
SET endpoint_url = 'https://your-vercel-url.vercel.app/api/' || 
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

## 📖 API Documentation

### 1. Web Scraper Pro

**Endpoint:** `/api/scrape`

**Input:**
```json
{
  "url": "https://example.com"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "title": "Page Title",
    "description": "Meta description",
    "headings": { "h1": [...], "h2": [...] },
    "links": [...],
    "images": [...],
    "paragraphs": [...]
  }
}
```

### 2. Email Validator

**Endpoint:** `/api/validate-email`

**Input:**
```json
{
  "email": "user@example.com"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "email": "user@example.com",
    "checks": {...},
    "risk_score": 10
  }
}
```

### 3. Image Generator

**Endpoint:** `/api/generate-image`

**Input:**
```json
{
  "prompt": "A beautiful sunset over mountains"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "image_url": "https://...",
    "prompt": "...",
    "size": "512x512"
  }
}
```

### 4. Sentiment Analyzer

**Endpoint:** `/api/sentiment`

**Input:**
```json
{
  "text": "I love this product!"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "sentiment": "positive",
    "score": 3,
    "confidence": 85,
    "positive_words": ["love"],
    "negative_words": []
  }
}
```

### 5. PDF Parser

**Endpoint:** `/api/parse-pdf`

**Input:**
```json
{
  "pdf_url": "https://example.com/document.pdf"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "text": "Full PDF text...",
    "pages": 10,
    "word_count": 5000,
    "preview": "First 500 chars..."
  }
}
```

### 6. Translation API

**Endpoint:** `/api/translate`

**Input:**
```json
{
  "text": "hello",
  "target_lang": "es"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "translated_text": "hola",
    "source_lang": "en",
    "target_lang": "es",
    "confidence": 0.95
  }
}
```

## 🔐 Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer claw0x_bridge_2026
```

## 🛠️ Development

### Project Structure

```
000xxx_skills/
├── api/                    # Skill endpoints
│   ├── scrape.ts
│   ├── validate-email.ts
│   ├── generate-image.ts
│   ├── sentiment.ts
│   ├── parse-pdf.ts
│   └── translate.ts
├── lib/                    # Shared utilities
│   ├── auth.ts            # Authentication
│   ├── validation.ts      # Input validation
│   └── response.ts        # Response formatting
├── vercel.json            # Vercel configuration
├── package.json
└── tsconfig.json
```

### Adding a New Skill

1. Create new file in `api/` directory
2. Import auth middleware and utilities
3. Implement handler function
4. Export with `authMiddleware(handler)`
5. Update database with new endpoint

## 📊 Monitoring

Monitor your skills in Vercel Dashboard:
- Response times
- Error rates
- Request volume
- Logs

## 🐛 Troubleshooting

### "Unauthorized" error
- Check `SKILL_AUTH_TOKEN` environment variable
- Verify Authorization header format

### Timeout errors
- Increase timeout in axios config
- Optimize skill logic
- Consider caching

### High memory usage
- Limit response sizes
- Stream large files
- Use pagination

## 📝 License

MIT

## 🤝 Support

For issues or questions:
- GitHub Issues: https://github.com/kennyzir/000xxx_skills
- Email: support@claw0x.com
