---
name: claw0x-humanizer
description: >
  Remove signs of AI-generated writing from text via the Claw0x API. Use when the
  user asks to humanize text, make AI writing sound natural, remove AI patterns,
  rewrite to avoid AI detection, or clean up robotic-sounding content. Based on
  Wikipedia's 24 "Signs of AI writing" patterns. LLM-powered with regex fallback.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# AI Text Humanizer

Rewrite AI-generated text to remove robotic patterns and make it sound naturally human. Targets 24 known AI writing signatures including filler phrases, AI vocabulary, sycophantic tone, and formulaic structure.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "humanize this", "make this sound more natural", "remove AI patterns"
- User wants text to pass AI detection tools
- Agent pipeline produces text that needs to sound human-written

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "humanizer",
    "input": {
      "text": "$ARGUMENTS"
    }
  }'
```

## Input

The `input` field accepts an object with one of these keys:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.text` | string | yes (one of) | Text to humanize |
| `input.content` | string | yes (one of) | Alternative key for the text |
| `input.body` | string | yes (one of) | Alternative key for the text |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `humanized_text` | string | The rewritten text with AI patterns removed |
| `original_length` | number | Character count of original text |
| `humanized_length` | number | Character count of humanized text |
| `method` | string | `"llm"` (AI rewrite) or `"regex"` (deterministic fallback) |

## How it works

1. Primary: LLM rewrites the text following a detailed system prompt targeting all 24 AI writing patterns
2. Fallback: If LLM is unavailable, applies regex-based replacements for common AI vocabulary, filler phrases, and chatbot artifacts

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
