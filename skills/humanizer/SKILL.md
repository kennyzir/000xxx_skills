---
name: claw0x-humanizer
description: >
  Remove signs of AI-generated writing from text via the Claw0x API. Use when the
  user asks to humanize text, make AI writing sound natural, remove AI patterns,
  rewrite to avoid AI detection, or clean up robotic-sounding content. Based on
  Wikipedia's 24 "Signs of AI writing" patterns. LLM-powered with regex fallback.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# AI Text Humanizer

Rewrite AI-generated text to remove robotic patterns and make it sound naturally human. Targets 24 known AI writing signatures including filler phrases, AI vocabulary, sycophantic tone, and formulaic structure.

## How It Works — Under the Hood

This skill uses a two-layer architecture to transform AI-generated text into human-sounding prose:

### Layer 1: LLM Rewriting (Primary)

The primary path sends your text to a large language model (currently Gemini) with a carefully engineered system prompt derived from Wikipedia's [WikiProject AI Cleanup](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup) guide. The system prompt instructs the model to:

1. **Scan** the input for all 24 known AI writing patterns (see full list below)
2. **Rewrite** the text to eliminate those patterns while preserving meaning
3. **Audit** the rewritten output for any lingering AI-isms
4. **Revise** a second time to catch patterns that survived the first pass

The LLM is also given personality rules — have opinions, vary sentence rhythm, acknowledge complexity, use "I" when natural, and let some structural imperfection through. Perfect structure is itself an AI signal.

### Layer 2: Regex Fallback (Deterministic)

If the LLM is unavailable (API key missing, rate limit, timeout), the skill falls back to a deterministic regex engine that applies pattern-matched replacements across six categories:

- **Chatbot artifacts** — removes "I hope this helps!", "Let me know if...", "Great question!"
- **Filler phrases** — "in order to" → "to", "due to the fact that" → "because"
- **Significance inflation** — "marking a pivotal moment in the evolution of" → removed
- **Copula avoidance** — "serves as" → "is", "functions as" → "is"
- **AI vocabulary** — 40+ word substitutions (e.g. "leverage" → "use", "facilitate" → "help")
- **Emoji removal** and em-dash normalization

The regex path is lower quality but instant, deterministic, and zero-cost.

### The 24 AI Writing Patterns Targeted

These are the specific signals this skill detects and removes, organized by category:

**Content patterns:**
1. Significance inflation ("pivotal moment", "testament to")
2. Notability name-dropping (listing media outlets without context)
3. Superficial -ing analyses ("highlighting...", "showcasing...")
4. Promotional language ("nestled", "vibrant", "groundbreaking")
5. Vague attributions ("Experts believe", "Industry reports suggest")
6. Formulaic resilience ("Despite challenges... continues to thrive")

**Language patterns:**
7. AI vocabulary (additionally, delve, landscape, tapestry, underscore, foster, garner, showcase, testament, pivotal, crucial, enhance, interplay, intricate)
8. Copula avoidance ("serves as" instead of "is", "boasts" instead of "has")
9. Negative parallelisms ("It's not just X, it's Y")
10. Rule of three overuse
11. Synonym cycling (protagonist/main character/central figure/hero)
12. False ranges ("from X to Y, from A to B")

**Style patterns:**
13. Em dash overuse → replaced with commas/periods
14. Boldface overuse → removed
15. Inline-header lists → converted to prose
16. Title Case Headings → sentence case
17. Emojis → removed
18. Curly quotes → straight quotes

**Communication patterns:**
19. Chatbot artifacts ("I hope this helps!", "Let me know if...")
20. Knowledge-cutoff disclaimers ("While details are limited...")
21. Sycophantic tone ("Great question!", "You're absolutely right!")

**Filler patterns:**
22. Filler phrases ("In order to" → "To", "Due to the fact that" → "Because")
23. Excessive hedging ("could potentially possibly" → "may")
24. Generic conclusions ("The future looks bright")

## Why This Approach Works

Most "AI humanizer" tools simply paraphrase text or add random typos. This skill takes a fundamentally different approach:

- **Pattern-specific targeting** — instead of blindly rewriting, it identifies and removes the exact linguistic fingerprints that AI detection tools look for
- **Wikipedia-sourced taxonomy** — the 24 patterns come from the Wikipedia community's real-world experience cleaning up AI-generated encyclopedia articles, not from guesswork
- **Two-pass audit** — the LLM rewrites once, then audits its own output for surviving patterns, catching things a single pass would miss
- **Personality injection** — the system prompt explicitly tells the model to have opinions, vary rhythm, and allow imperfection, because real human writing is messy

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to Use

- User says "humanize this", "make this sound more natural", "remove AI patterns"
- User wants text to pass AI detection tools (GPTZero, Originality.ai, etc.)
- Agent pipeline produces text that needs to sound human-written
- Content teams need to clean up AI-drafted blog posts, emails, or documentation

## Input

The `input` field accepts an object with one of these keys:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.text` | string | yes (one of) | Text to humanize |
| `input.content` | string | yes (one of) | Alternative key for the text |
| `input.body` | string | yes (one of) | Alternative key for the text |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `humanized_text` | string | The rewritten text with AI patterns removed |
| `original_length` | number | Character count of original text |
| `humanized_length` | number | Character count of humanized text |
| `method` | string | `"llm"` (AI rewrite) or `"regex"` (deterministic fallback) |

## Example

**Input:**
```
Additionally, it is worth noting that this groundbreaking solution serves as
a testament to the transformative power of innovation. The future looks bright
for this pivotal technology. I hope this helps!
```

**Output:**
```
This solution shows what good engineering looks like in practice. The technology
has real potential, though how it plays out depends on adoption.
```

The LLM removed: "Additionally" (AI vocab), "it is worth noting that" (filler), "groundbreaking" (promotional), "serves as a testament to" (copula avoidance + inflation), "transformative power of" (inflation), "The future looks bright" (generic conclusion), "I hope this helps!" (chatbot artifact).

## Error Codes

- `400` — Missing or empty text input
- `500` — Processing failed (not billed)

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are never charged.