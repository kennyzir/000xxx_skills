---
name: "Translation Pro"
slug: "translate"
description: >
  Translate text between 50+ languages with auto-detect and batch mode. Use when
  agents need multilingual content pipelines, global communication, or document
  translation. Handles Chinese, Japanese, Korean, Arabic, Hindi, and more.
category: "Language"
tags: ["translation", "language", "multilingual", "i18n", "localization"]
price_per_call: 0
input_schema:
  type: object
  properties:
    text:
      type: string
      description: "Text to translate (max 5000 chars)"
    texts:
      type: array
      description: "Array of texts for batch translation (max 20)"
    source:
      type: string
      description: "Source language code (auto-detected if omitted)"
    target:
      type: string
      description: "Target language code (required, e.g. en, zh, es)"
  required: ["target"]
output_schema:
  type: object
  properties:
    translated:
      type: string
    source_language:
      type: string
    target_language:
      type: string
    confidence:
      type: number
---

# Translation Pro

Translate text between 50+ languages with automatic language detection and batch mode.

> **Free to use** — no API key required for local version. Uses free translation API.

## Quick Reference

| When This Happens | Do This | What You Get |
|-------------------|---------|--------------|
| Need to translate content | Send text + target lang | Translated text with confidence |
| Processing multilingual docs | Send batch of texts | All translations in one call |
| Unknown source language | Omit source param | Auto-detected language + translation |

## 5-Minute Quickstart

### Step 1: Get API Key
Sign up at [claw0x.com](https://claw0x.com) and create an API key.

### Step 2: Translate Text
```bash
curl -X POST https://api.claw0x.com/v1/call \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"skill":"translate","input":{"text":"Hello world","target":"zh"}}'
```

### Step 3: Get Result
```json
{
  "translated": "你好世界",
  "source_language": "en",
  "target_language": "zh",
  "confidence": 0.95
}
```

## Real-World Use Cases

### Scenario 1: Multilingual Agent Communication
**Problem**: Agent needs to respond in user's language.
**Solution**: Detect language, translate response.

### Scenario 2: Content Localization Pipeline
**Problem**: Blog posts need translation to 10 languages.
**Solution**: Use batch mode with 10 target languages.

### Scenario 3: Document Processing
**Problem**: Incoming documents in mixed languages.
**Solution**: Auto-detect + translate to English for processing.

## Supported Languages

50+ languages including: English, Chinese, Spanish, French, German, Japanese, Korean, Portuguese, Russian, Arabic, Italian, Dutch, Polish, Turkish, Vietnamese, Thai, Swedish, Danish, Finnish, Norwegian, Czech, Greek, Hebrew, Hindi, Hungarian, Indonesian, Malay, Romanian, Slovak, Ukrainian, Bulgarian, Catalan, Croatian, Estonian, Latvian, Lithuanian, Slovenian, Filipino, Bengali, Tamil, Telugu, Urdu, Persian, Swahili, Afrikaans.

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| text | string | Yes* | Text to translate (max 5000 chars) |
| texts | array | Yes* | Batch: array of strings (max 20) |
| source | string | No | Source language code (auto-detected) |
| target | string | Yes | Target language code (e.g. en, zh, es) |

*Either `text` or `texts` is required.

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `text or texts is required` | Missing input | Provide text or texts array |
| `target language code is required` | Missing target | Add target param (e.g. "en") |
| `Text too long` | Over 5000 chars | Split into smaller chunks |
| `Max 20 texts per batch` | Too many batch items | Reduce batch size |

## Pricing

**FREE.** No charge per call.

- Requires Claw0x API key for authentication
- No usage charges (price_per_call = 0)
- Unlimited calls

## About Claw0x

This skill is provided by [Claw0x](https://claw0x.com), the native skills layer for AI agents.

**GitHub**: [github.com/kennyzir/translate](https://github.com/kennyzir/translate)
