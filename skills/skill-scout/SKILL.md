---
name: claw0x-skill-scout
description: >
  Discover, evaluate, and recommend agent skills from the Claw0x catalog and
  community sources via the Claw0x API. Use when the user asks to find the best
  skill for a task, compare skills, get skill recommendations, browse available
  agent tools, or search across Claw0x native skills and community contributions
  from ClawHub, Anthropic, and VoltAgent. Returns ranked results with pricing,
  trust scores, and install commands.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Skill Scout

Discover and recommend agent skills across the Claw0x catalog and community sources (ClawHub, Anthropic, VoltAgent). Returns ranked results with relevance scores, pricing, and install commands.

> **Free to use.** This skill costs nothing. Just [sign up at claw0x.com](https://claw0x.com), create an API key, and start calling. No credit card, no wallet top-up required.

## How It Works �?Under the Hood

Skill Scout is a meta-discovery skill that searches across multiple skill registries and returns unified, ranked results. Think of it as a search engine for agent capabilities.

### Multi-Source Search Architecture

Unlike `awesome-openclaw-skills` (which only searches the Claw0x catalog), Skill Scout aggregates results from multiple sources:

1. **Claw0x native catalog** �?production skills deployed on Claw0x infrastructure. These come with trust scores, pricing, usage stats, and guaranteed API availability.

2. **Community sources** �?skills from ClawHub, Anthropic's tool ecosystem, and VoltAgent's registry. These are indexed and normalized into a common format for comparison.

### Search & Ranking Pipeline

1. **Query expansion** �?your search query is matched against skill names, descriptions, tags, and categories across all sources. The matching is fuzzy �?"web scrape" will match "Web Scraper", "scraping tool", etc.

2. **Relevance scoring** �?each result gets a relevance score (0�?00) based on how well it matches the query. Exact name matches score highest, followed by description matches, then tag matches.

3. **Cross-source normalization** �?results from different sources are normalized into a common schema so you can compare them directly. Claw0x skills include pricing and trust scores; community skills include install commands and source URLs.

4. **Ranking** �?results are sorted by relevance score first, then by trust score (for Claw0x skills) or community popularity (for community skills).

### Search vs. Recommend Mode

- **Search** (`action: "search"` or default) �?returns all matching skills, ranked by relevance. Good for broad exploration.
- **Recommend** (`action: "recommend"`) �?returns a curated shortlist with the skill most likely to solve your specific task at the top. Good for agents that need to pick one tool and go.

### Why This Matters for Agent Orchestration

An orchestrator agent building a multi-step pipeline can use Skill Scout to:

1. Describe what it needs ("I need to extract text from a PDF")
2. Get ranked options with pricing and trust data
3. Pick the best option based on cost, reliability, and relevance
4. Call it via the Claw0x gateway

This enables agents to compose workflows dynamically without hardcoded tool lists.

## Prerequisites

This is a free skill. Just get an API key:

1. Sign up at [claw0x.com](https://claw0x.com)
2. Go to Dashboard �?API Keys �?Create Key
3. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

No credit card or wallet balance needed.

## When to Use

- User says "find the best skill for", "recommend a skill", "what should I use for"
- Agent needs to pick the right tool for a subtask
- User wants to compare Claw0x native skills vs community alternatives
- User asks to browse skill categories or explore the ecosystem

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.query` | string | no | Search keyword |
| `input.category` | string | no | Filter by category |
| `input.source` | string | no | `"claw0x"`, `"community"`, or `"all"` (default) |
| `input.limit` | number | no | Max results (default 10, max 50) |
| `input.action` | string | no | `"search"` (default), `"recommend"`, or `"categories"` |

## Output (Search/Recommend)

| Field | Type | Description |
|-------|------|-------------|
| `skills` | array | Ranked results with name, description, category, tags, relevance_score |
| `skills[].source` | string | `"claw0x"` or `"community"` |
| `skills[].install_cmd` | string | Install command (e.g. `npx claw0x add scrape`) |
| `skills[].pricing` | object | `price_per_call` and `is_free` (Claw0x skills only) |
| `skills[].trust_score` | number | Trust score 0�?00 (Claw0x skills only) |
| `skills[].api_call` | string | Example API call (Claw0x skills only) |

## Output (Categories)

| Field | Type | Description |
|-------|------|-------------|
| `categories` | array | Category names with claw0x_count and community_count |

## Error Codes

- `400` — Invalid input parameters
- `401` — Invalid or missing API key
- `500` — Processing failed (not billed)

## Pricing

**Free.** Apply for an API key and use it at no cost. No credit card required.