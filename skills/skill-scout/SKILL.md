---
name: claw0x-skill-scout
description: >
  Discover, evaluate, and recommend agent skills from the Claw0x catalog and
  community sources via the Claw0x API. Use when the user asks to find the best
  skill for a task, compare skills, get skill recommendations, browse available
  agent tools, or search across Claw0x native skills and community contributions
  from ClawHub, Anthropic, and VoltAgent. Returns ranked results with pricing,
  trust scores, and install commands.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Skill Scout

Discover and recommend agent skills across the Claw0x catalog and community sources (ClawHub, Anthropic, VoltAgent). Returns ranked results with relevance scores, pricing, and install commands.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "find the best skill for", "recommend a skill", "what should I use for"
- Agent needs to pick the right tool for a subtask
- User wants to compare Claw0x native skills vs community alternatives
- User asks to browse skill categories or explore the ecosystem

## API call — Search

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "skill-scout",
    "input": {
      "query": "$ARGUMENTS"
    }
  }'
```

## API call — Recommend

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "skill-scout",
    "input": {
      "action": "recommend",
      "query": "web scraping"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.query` | string | no | Search keyword |
| `input.category` | string | no | Filter by category |
| `input.source` | string | no | `"claw0x"`, `"community"`, or `"all"` (default) |
| `input.limit` | number | no | Max results (default 10, max 50) |
| `input.action` | string | no | `"search"` (default), `"recommend"`, or `"categories"` |

## Output (search/recommend)

| Field | Type | Description |
|-------|------|-------------|
| `skills` | array | Ranked results with name, description, category, tags, relevance_score |
| `skills[].source` | string | `"claw0x"` or `"community"` |
| `skills[].install_cmd` | string | Install command (e.g. `npx claw0x add scrape`) |
| `skills[].pricing` | object | `price_per_call` and `is_free` (Claw0x skills only) |
| `skills[].trust_score` | number | Trust score 0–100 (Claw0x skills only) |
| `skills[].api_call` | string | Example API call (Claw0x skills only) |

## Output (categories)

| Field | Type | Description |
|-------|------|-------------|
| `categories` | array | Category names with claw0x_count and community_count |

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
