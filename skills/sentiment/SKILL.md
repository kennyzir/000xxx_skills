---
name: claw0x-sentiment
description: >
  Analyze the sentiment of text via the Claw0x API. Use when the user asks to
  analyze sentiment, detect emotion or mood in text, check if text is positive
  or negative, or score the tone of a message. Returns sentiment label, score,
  confidence, and word-level breakdown. No LLM needed — deterministic analysis.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Sentiment Analysis

Analyze the emotional tone of any text. Returns a sentiment label, numeric score, confidence percentage, and lists of positive/negative words found.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "analyze the sentiment", "is this positive or negative", "what's the tone of this text"
- Agent pipeline needs sentiment scoring as a processing step
- User wants to evaluate customer feedback, reviews, or social media posts

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "sentiment",
    "input": {
      "text": "$ARGUMENTS"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | Text to analyze (1–10000 chars) |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `sentiment` | string | Label: "very positive", "positive", "neutral", "negative", "very negative" |
| `score` | number | Raw sentiment score (positive = positive sentiment) |
| `comparative` | number | Score normalized by word count |
| `confidence` | number | Confidence percentage (0–100) |
| `tokens` | number | Total token count |
| `positive_words` | string[] | Words contributing to positive score |
| `negative_words` | string[] | Words contributing to negative score |

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
