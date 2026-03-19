---
name: claw0x-tavily-search
description: >
  Search the web for real-time information via the Claw0x API (powered by Tavily).
  Use when the user asks to search the web, find current information, look up recent
  news, research a topic online, or when the agent needs up-to-date data that is
  outside its training cutoff. Returns ranked results with snippets and an AI-generated
  answer summary.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Web Search (Tavily)

Search the web and get ranked results with snippets, URLs, and an AI-generated answer summary. Powered by Tavily's search API, optimized for LLM consumption.

## How It Works — Under the Hood

This skill wraps the [Tavily Search API](https://tavily.com), which is purpose-built for AI agents and LLMs. Unlike traditional search engines that return HTML pages for humans to browse, Tavily returns clean, structured data optimized for programmatic consumption.

### Search Pipeline

1. **Query processing** — your search query is sent to Tavily's search infrastructure. The query is analyzed for intent and expanded internally to improve recall.

2. **Web crawling & indexing** — Tavily maintains its own web index (separate from Google/Bing). It crawls and indexes pages with a focus on content quality and freshness. Results are ranked by relevance, authority, and recency.

3. **Content extraction** — for each result, Tavily extracts a clean text snippet (not just the meta description). This means you get actual page content, not just SEO-optimized summaries.

4. **AI answer generation** — optionally, Tavily generates a synthesized answer by reading the top results and producing a concise summary. This is useful when the agent needs a direct answer rather than a list of links.

5. **Structured response** — results are returned as JSON with title, URL, content snippet, relevance score, and publication date. Ready for LLM consumption without any HTML parsing.

### Search Depth: Basic vs. Advanced

- **Basic** (default) — fast search, typically 1–2 seconds. Good for factual queries, current events, and simple lookups.
- **Advanced** — deeper search with more sources crawled. Takes 3–5 seconds but returns higher-quality results for complex or niche queries. Uses more Tavily API quota.

### Topic Modes

- **General** (default) — searches the full web index. Best for most queries.
- **News** — restricts results to news sources. Best for current events, breaking news, and time-sensitive queries.

### Domain Filtering

You can include or exclude specific domains to focus results:
- `include_domains: ["arxiv.org", "github.com"]` — only return results from these domains
- `exclude_domains: ["pinterest.com", "quora.com"]` — filter out low-quality sources

### Why Tavily Instead of Google/Bing APIs?

- **LLM-optimized output** — Tavily returns clean text snippets, not HTML. No parsing needed.
- **AI answer synthesis** — built-in answer generation saves an extra LLM call.
- **No rate limit complexity** — Claw0x handles the Tavily API key and rate limiting for you.
- **Consistent pricing** — pay per call through Claw0x instead of managing a separate Tavily subscription.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to Use

- User says "search for", "look up", "find information about", "what's the latest on"
- Agent needs real-time or current data (prices, news, events, documentation)
- Any query where the answer requires information beyond the model's training data
- Research pipelines that need to gather information from multiple web sources

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

## Output Fields

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

## Example

**Input:** `{ "query": "best practices for AI agent error handling" }`

**Output:**
```json
{
  "answer": "Key practices include implementing retry with exponential backoff, logging structured error context, using circuit breakers for external APIs, and providing graceful degradation paths...",
  "results": [
    {
      "title": "Building Reliable AI Agents: Error Handling Patterns",
      "url": "https://example.com/ai-agent-error-handling",
      "content": "When building autonomous agents, error handling is critical...",
      "score": 0.95,
      "published_date": "2026-02-15"
    }
  ],
  "result_count": 5
}
```

## Error Codes

- `400` — Invalid query or parameters
- `429` — Rate limit exceeded (try again later)
- `502` — Upstream search API error (not billed)

## Pricing

Freemium model — 50 free calls per day, then $0.01 per call. Failed calls and 5xx errors are never charged.