---
name: claw0x-awesome-openclaw-skills
description: >
  Search and discover skills from the live Claw0x catalog via the Claw0x API.
  Use when the user asks to find skills, browse the skill catalog, search for
  agent capabilities, list skill categories, or discover what tools are available.
  Returns real-time data with pricing, trust scores, and usage stats.
  Filter by category, keyword, or use case.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Awesome OpenClaw Skills (Discovery)

Search and browse the live Claw0x skill catalog. Returns real-time data including pricing, trust scores, and call stats.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "find a skill for", "what skills are available", "browse skills", "list categories"
- Agent needs to discover which skill to use for a specific task
- User wants to explore the OpenClaw ecosystem

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.query` | string | no | Keyword search (name, description, tags) |
| `input.category` | string | no | Filter by category name |
| `input.limit` | number | no | Max results (default 20, max 100) |
| `input.action` | string | no | `"categories"` to list all categories instead of searching |

## Output (search mode)

| Field | Type | Description |
|-------|------|-------------|
| `skills` | array | Matching skills with name, slug, description, category, tags |
| `total` | number | Number of results |
| `catalog_size` | number | Total skills in catalog |

## Output (categories mode)

| Field | Type | Description |
|-------|------|-------------|
| `categories` | array | Category names with skill counts |
| `total_skills` | number | Total skills in catalog |

## Error Codes

- `400` — Invalid input parameters
- `401` — Invalid or missing API key
- `500` — Processing failed (not billed)

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are never charged.