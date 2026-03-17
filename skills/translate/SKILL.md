---
name: claw0x-translate
description: >
  Translate text between languages via the Claw0x API. Use when the user asks to
  translate text, convert text to another language, or needs a quick translation.
  Supports common language pairs. Currently in demo mode with dictionary-based
  translation for common phrases; production mode uses Google Translate API.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Translate

Translate text from one language to another.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "translate this to Spanish", "how do you say X in French", "convert to German"
- Agent pipeline needs text translated as an intermediate step

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "translate",
    "input": {
      "text": "hello",
      "target_lang": "es"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | Text to translate (1–5000 chars) |
| `target_lang` | string | yes | Target language code: `es`, `fr`, `de`, `zh`, `ja`, `ko` (2–5 chars) |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `translated_text` | string | The translated text |
| `source_text` | string | Original input text |
| `source_lang` | string | Detected source language |
| `target_lang` | string | Target language used |
| `confidence` | number | Translation confidence (0–1) |
| `method` | string | `"dictionary"` or `"passthrough"` |

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
