---
name: Awesome OpenClaw Skills
description: >
  Search and discover skills from the live Claw0x catalog.
  Use when the user asks to find skills, browse the skill catalog, search for
  agent capabilities, list skill categories, or discover what tools are available.
  Returns real-time data with pricing, trust scores, and usage stats.
  Filter by category, keyword, or use case.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Awesome OpenClaw Skills (Discovery)

Search and browse the live Claw0x skill catalog. Returns real-time data including pricing, trust scores, and call stats.

> **Free to use.** This skill costs nothing. Just [sign up at claw0x.com](https://claw0x.com), create an API key, and start calling. No credit card, no wallet top-up required.

## How It Works — Under the Hood

This skill queries the live Claw0x database in real time and returns public-safe skill metadata. It's the programmatic equivalent of browsing the [claw0x.com/skills](https://claw0x.com/skills) page, but designed for agents and CLI tools.

### Query Pipeline

1. **Input parsing** — the skill accepts a keyword `query`, a `category` filter, or both. If `action` is set to `"categories"`, it switches to category listing mode instead of search.

2. **Search execution** — keyword queries are matched against skill `name`, `description`, and `tags` fields using case-insensitive substring matching. Category filters are exact matches against the `category` column.

3. **Field filtering** — only public-safe fields are returned. Internal fields like `endpoint_url`, `deployment_status`, `evaluation_score`, and `strategic_notes` are stripped before the response is sent. This is the same whitelist used by the public `/api/skills` endpoint.

4. **Result ranking** — results are ordered by relevance (keyword match quality) and then by `trust_score` descending. Skills with higher trust scores and more total calls appear first.

### What's in the Catalog

The Claw0x catalog includes two types of skills:

- **Native skills** — built and maintained by the Claw0x team, deployed on Claw0x infrastructure, with guaranteed uptime and quality. These have trust scores, pricing, and usage stats.
- **Community skills** — submitted by third-party developers, reviewed and approved by the Claw0x team. These go through a security scan and evaluation pipeline before listing.

Every skill in the catalog has been through the Claw0x evaluation pipeline (automated code review, security scan, and functional testing).

### Why an Agent Needs This

Autonomous agents that compose multi-step workflows need to discover capabilities at runtime. Instead of hardcoding which skills to use, an agent can:

1. Call `awesome-openclaw-skills` with a task description
2. Get back matching skills with pricing and trust scores
3. Pick the best option and call it via the gateway

This enables dynamic tool selection — the agent adapts its toolchain based on what's available and what fits the task.

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

- User says "find a skill for", "what skills are available", "browse skills", "list categories"
- Agent needs to discover which skill to use for a specific task
- User wants to explore the OpenClaw ecosystem
- Building a meta-agent that dynamically selects tools

## API Call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "awesome-openclaw-skills",
    "input": {
      "query": "web scraping"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.query` | string | no | Keyword search (name, description, tags) |
| `input.category` | string | no | Filter by category name |
| `input.limit` | number | no | Max results (default 20, max 100) |
| `input.action` | string | no | `"categories"` to list all categories instead of searching |

## Output (Search Mode)

| Field | Type | Description |
|-------|------|-------------|
| `skills` | array | Matching skills with name, slug, description, category, tags |
| `total` | number | Number of results |
| `catalog_size` | number | Total skills in catalog |

## Output (Categories Mode)

| Field | Type | Description |
|-------|------|-------------|
| `categories` | array | Category names with skill counts |
| `total_skills` | number | Total skills in catalog |

## Pricing

**Free.** Apply for an API key and use it at no cost. No credit card required.
