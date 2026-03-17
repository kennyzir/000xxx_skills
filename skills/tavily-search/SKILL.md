---
name: claw0x-tavily-search
description: >
  Search the web for real-time information via the Claw0x API (powered by Tavily).
  Use when the user asks to search the web, find current information, look up recent
  news, research a topic online, or when the agent needs up-to-date data that is
  outside its training cutoff. Returns ranked results with snippets and an AI-generated
  answer summary.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Web Search (Tavily)

Search the web and get ranked results with snippets, URLs, and an AI-generated answer summary.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "search for", "look up", "find information about", "what's the latest on"
- Agent needs real-time or current data (prices, news, events, documentation)
- Any query where the answer requires information beyond the model's training data

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "tavily-search",
    "input": {
      "query": "$ARGUMENTS"
    }
  }'
```

## Input

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | yes | — | Search query (1–400 chars) |
| `search_depth` | string | no | `"basic"` | `"basic"` or `"advanced"` (deeper, slower) |
| `topic` | string | no | `"general"` | `"general"` or `"news"` |
| `max_results` | number | no | `5` | Number of results (1–20) |
| `time_range` | string | no | — | `"day"`, `"week"`, `"month"`, or `"year"` |
| `include_domains` | string[] | no | — | Only include results from these domains |
| `exclude_domains` | string[] | no | — | Exclude results from these domains |
| `include_raw_content` | boolean | no | `false` | Include full page content in results |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `answer` | string | AI-generated answer summary (may be null) |
| `results` | array | Ranked search results |
| `results[].title` | string | Page title |
| `results[].url` | string | Page URL |
| `results[].content` | string | Snippet/excerpt |
| `results[].score` | number | Relevance score |
| `results[].published_date` | string | Publication date (if available) |
| `result_count` | number | Number of results returned |

## Error codes

- `400` — Invalid query or parameters
- `429` — Rate limit exceeded (try again later)
- `502` — Upstream search API error (not billed)

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
