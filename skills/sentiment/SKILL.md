---
name: Sentiment Analysis
description: >
  Analyze the sentiment of text. Use when the user asks to
  analyze sentiment, detect emotion or mood in text, check if text is positive
  or negative, or score the tone of a message. Returns sentiment label, score,
  confidence, and word-level breakdown. No LLM needed — deterministic analysis.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Sentiment Analysis

Analyze the emotional tone of any text. Returns a sentiment label, numeric score, confidence percentage, and lists of positive/negative words found.

> **Free to use.** This skill costs nothing. Just [sign up at claw0x.com](https://claw0x.com), create an API key, and start calling. No credit card, no wallet top-up required.

## How It Works — Under the Hood

This skill uses a lexicon-based sentiment analysis approach — no LLM, no external AI API. The entire computation runs deterministically in a single serverless function.

### The Algorithm

1. **Tokenization** — the input text is split into individual words (tokens), normalized to lowercase, and stripped of punctuation.

2. **Lexicon lookup** — each token is matched against a sentiment lexicon (a dictionary of words with pre-assigned positive/negative scores). Words like "love", "amazing", "excellent" have positive scores; words like "terrible", "hate", "awful" have negative scores.

3. **Score aggregation** — individual word scores are summed to produce a raw sentiment score. Positive total = positive sentiment, negative total = negative sentiment, near-zero = neutral.

4. **Normalization** — the raw score is divided by the token count to produce a `comparative` score (sentiment per word), which allows fair comparison between short and long texts.

5. **Confidence calculation** — confidence is derived from the ratio of sentiment-bearing words to total words. More opinionated text = higher confidence. Neutral text with few sentiment words = lower confidence.

6. **Label assignment** — the raw score is mapped to a human-readable label:
   - `score >= 3` → "very positive"
   - `score >= 1` → "positive"
   - `score > -1` → "neutral"
   - `score > -3` → "negative"
   - `score <= -3` → "very negative"

### Why Lexicon-Based (Not LLM)?

- **Deterministic** — same input always produces the same output. No temperature, no randomness.
- **Fast** — sub-10ms processing. No network call to an AI provider.
- **Cheap** — zero compute cost beyond the serverless function itself, which is why this skill is free.
- **Transparent** — you can see exactly which words drove the score (returned in `positive_words` / `negative_words`).

The tradeoff: lexicon-based analysis doesn't understand sarcasm, context, or nuance the way an LLM would. "This is sick!" scores negative (lexicon sees "sick") even though colloquially it's positive. For most use cases — customer feedback, review analysis, social media monitoring — lexicon-based is accurate enough and far more predictable.

## Prerequisites

This is a free skill. Just get an API key:

1. Sign up at [claw0x.com](https://claw0x.com)
2. Go to Dashboard → API Keys → Create Key
3. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

No credit card or wallet balance needed.

## When to Use

- User says "analyze the sentiment", "is this positive or negative", "what's the tone of this text"
- Agent pipeline needs sentiment scoring as a processing step
- Evaluating customer feedback, reviews, or social media posts
- Filtering or routing messages based on emotional tone

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | Text to analyze (1–10,000 chars) |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `sentiment` | string | Label: "very positive", "positive", "neutral", "negative", "very negative" |
| `score` | number | Raw sentiment score (positive = positive sentiment) |
| `comparative` | number | Score normalized by word count |
| `confidence` | number | Confidence percentage (0–100) |
| `tokens` | number | Total token count |
| `positive_words` | string[] | Words contributing to positive score |
| `negative_words` | string[] | Words contributing to negative score |

## Example

**Input:** `"I love this product, but the shipping was terrible."`

**Output:**
```json
{
  "sentiment": "neutral",
  "score": 0,
  "comparative": 0,
  "confidence": 20,
  "tokens": 10,
  "positive_words": ["love"],
  "negative_words": ["terrible"]
}
```

The mixed sentiment (one positive word, one negative word) results in a near-zero score, correctly labeled "neutral".

## Error Codes

- `400` — Missing or empty text input
- `401` — Invalid or missing API key
- `500` — Processing failed (not billed)

## Pricing

**Free.** Apply for an API key and use it at no cost. No credit card required.