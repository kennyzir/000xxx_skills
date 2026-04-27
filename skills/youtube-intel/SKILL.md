---
name: "YouTube Intel"
slug: "youtube-intel"
description: >
  Analyze YouTube channels, track competitor activity, and discover content opportunities.
  Use when users need to monitor YouTube channels, analyze a niche or category for content gaps,
  identify viral patterns, or plan content strategy. Handles competitive intelligence,
  market discovery, and trend analysis for YouTube creators.
category: "Content & Media"
tags: ["youtube", "content-strategy", "competitive-intelligence", "market-research", "creator-tools"]
price_per_call: 0
input_schema:
  type: object
  properties:
    mode:
      type: string
      enum: ["monitoring", "discovery"]
      description: "Operation mode: monitoring (track channels) or discovery (find opportunities)"
    query:
      type: string
      description: "Channel handle/URL for monitoring, or category/keyword for discovery"
    options:
      type: object
      description: "Optional parameters: subcategories, date_range, max_results"
  required: ["mode", "query"]
output_schema:
  type: object
  properties:
    report:
      type: object
      description: "Structured intelligence report with competition assessment, opportunities, and data"
    channels:
      type: array
      description: "Channel profiles with aggregated metrics"
    opportunities:
      type: array
      description: "Ranked content opportunities with evidence and suggested angles"
---

# YouTube Intel

**Local skill by [Claw0x](https://claw0x.com)** — runs entirely in your agent environment.

> **Runs locally.** No external API calls, no API key required. Complete privacy. Your competitive intelligence stays on your machine.

YouTube content intelligence and competitive monitoring. Two modes: **Monitoring** (track specific channels) and **Discovery** (scan markets for content opportunities using a structured six-step workflow).

## Quick Reference

| When This Happens | Do This | What You Get |
|-------------------|---------|--------------|
| Need to track competitor channels | Use Monitoring mode with channel handle | Update report with new videos, view trends, content shifts |
| Exploring a new content niche | Use Discovery mode with category keyword | Competition assessment, ranked opportunities, viral patterns |
| Planning content strategy | Use Discovery mode with broad category | Subcategory breakdown, gap analysis, suggested angles |
| Want to find viral patterns | Use Discovery mode, check viral_patterns output | Title formulas, timing insights, replicable patterns |

## 5-Minute Quickstart

### Step 1: Install (30 seconds)

```bash
openclaw skill add youtube-intel
```

### Step 2: Monitor a Channel

```typescript
const result = await agent.run('youtube-intel', {
  mode: 'monitoring',
  query: '@mkbhd'
});
// Returns: latest videos, view trends, content direction changes
```

### Step 3: Discover Opportunities

```typescript
const result = await agent.run('youtube-intel', {
  mode: 'discovery',
  query: 'AI tools'
});
// Returns: subcategory breakdown, competition levels, ranked opportunities
```

### Step 4: Review the Report

The output includes:
- Competition assessment per subcategory (🔴 high / 🟡 medium / 🟢 low)
- Ranked content opportunities with evidence
- Viral pattern analysis with replicable lessons
- Channel profiles with aggregated metrics

## Real-World Use Cases

### Scenario 1: Entering a New Niche

**Problem**: You want to start a YouTube channel about AI tools but don't know which subcategory has the best opportunity.

**Solution**: Run Discovery mode with "AI tools" — the skill decomposes it into subcategories (AI image tools, AI coding tools, AI video tools, etc.), assesses competition for each, and ranks opportunities.

**Example**:
```typescript
const report = await agent.run('youtube-intel', {
  mode: 'discovery',
  query: 'AI tools',
  options: { max_results: 30 }
});

// report.opportunities[0]:
// {
//   type: "timing",
//   sub_category: "AI avatar tools",
//   competition_level: "green",
//   suggested_angle: "Emerging market, supply is scarce",
//   suggested_titles: ["2026 Best AI Avatar Tools Compared"]
// }
```

### Scenario 2: Tracking Competitors

**Problem**: You need to monitor what your top 3 competitors are publishing and how their content performs.

**Solution**: Run Monitoring mode for each channel — get latest uploads, view velocity, content type shifts, and trend analysis.

**Example**:
```typescript
const report = await agent.run('youtube-intel', {
  mode: 'monitoring',
  query: '@competitor_channel'
});

// report.channel_profile:
// {
//   latest_video_days_ago: 3,
//   avg_views: 150000,
//   content_type_distribution: { tutorial: 40%, review: 35%, list: 25% }
// }
```

### Scenario 3: Finding Viral Patterns

**Problem**: You want to understand what makes videos go viral in your niche.

**Solution**: Discovery mode identifies videos with 1M+ views, analyzes title formulas, timing context, and extracts replicable patterns.

### Scenario 4: Content Calendar Planning

**Problem**: You need data-driven topic ideas for the next month.

**Solution**: Combine Discovery (find gaps) + Monitoring (track what competitors are NOT covering) to generate a prioritized topic list.

## Two Modes

### Monitoring Mode

Track specific YouTube channels over time.

**Trigger phrases**: "monitor this channel", "track @channel", "what did they publish recently"

**Workflow**:
1. Read channel history from memory (if exists)
2. Fetch latest channel data via browser
3. Compare with history: new videos, view changes, trend shifts
4. Update memory archive
5. Output change report

### Discovery Mode (Six-Step Workflow)

Scan a market category for content opportunities. This is NOT a simple keyword search — it follows a structured intelligence workflow:

```
Step 1: Demand Analysis    → Understand what the user really wants, identify ambiguity
Step 2: Strategy Design    → Define search terms, subcategories, data sources
Step 3: Data Collection    → Execute searches via browser
Step 4: Data Cleaning      → Deduplicate, filter noise, normalize formats
Step 5: Analysis           → Assess competition, identify opportunities, extract viral patterns
Step 6: Save & Present     → Write to memory, output structured report
```

## Data Models

### Video Record
```yaml
video:
  title: string
  video_id: string
  url: string
  channel_name: string
  channel_handle: string
  views: number
  published_days_ago: number
  duration: string
  is_short: boolean
  content_type: "review" | "tutorial" | "list" | "comparison" | "news" | "other"
  is_viral: boolean       # views > 1M
  is_emerging: boolean    # published < 30 days
```

### Channel Profile
```yaml
channel_profile:
  name: string
  handle: string
  videos_in_results: number
  avg_views: number
  max_views: number
  is_established: boolean  # 3+ videos, avg views > 200K
  is_emerging: boolean     # new account with viral hit
```

### Competition Assessment
```yaml
competition:
  sub_category: string
  total_videos: number
  unique_channels: number
  avg_views: number
  top_video_views: number
  competition_level: "red" | "yellow" | "green"
  # red: top video > 1M views AND 5+ established channels
  # yellow: top video 300K-1M OR 2-5 established channels
  # green: top video < 300K OR emerging market
```

### Opportunity
```yaml
opportunity:
  type: "differentiation" | "niche" | "format" | "timing" | "data"
  description: string
  evidence: string[]
  suggested_angle: string
  risk: string
  priority: number  # 1-5
```

## Integration Recipes

### OpenClaw Agent

```typescript
import { Claw0xClient } from '@claw0x/sdk';

const claw0x = new Claw0xClient(process.env.CLAW0X_API_KEY);

// Discovery: find opportunities in a niche
const discovery = await claw0x.call('youtube-intel', {
  mode: 'discovery',
  query: 'productivity tools'
});

console.log('Top opportunity:', discovery.opportunities[0]);

// Monitoring: track a competitor
const monitoring = await claw0x.call('youtube-intel', {
  mode: 'monitoring',
  query: '@competitor'
});

console.log('Latest video:', monitoring.report.latest_video);
```

### LangChain Agent

```python
from claw0x import Claw0xClient

client = Claw0xClient(api_key="ck_live_...")

result = client.call("youtube-intel", {
    "mode": "discovery",
    "query": "AI video editing tools"
})

for opp in result["opportunities"]:
    print(f"[{opp['competition_level']}] {opp['sub_category']}: {opp['suggested_angle']}")
```

### Custom Agent (Direct API)

```javascript
const response = await fetch('https://api.claw0x.com/v1/call', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ck_live_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skill: 'youtube-intel',
    input: {
      mode: 'discovery',
      query: 'content creation tools'
    }
  })
});

const data = await response.json();
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid mode` | Mode is not "monitoring" or "discovery" | Use `monitoring` or `discovery` |
| `Missing query` | No query/channel provided | Provide a category keyword or channel handle |
| `Category too broad` | Query is too vague for meaningful analysis | Provide a more specific subcategory |
| `No results found` | Search returned no videos | Try different keywords or check spelling |
| `Browser timeout` | YouTube page didn't load | Retry — transient network issue |

## Important Notes

- Always analyze demand before searching — don't just search a keyword and output a report
- Broad categories MUST be decomposed into subcategories first
- Confidence levels are always marked (🟢 high / 🟡 medium / 🔴 low)
- Shorts and long-form videos are analyzed separately (different markets)
- Data is saved to memory for accumulation — not starting from zero each time

## Pricing

**Free.** No charge per call.

- No API key required for local use
- No usage charges (price_per_call = 0)
- Unlimited calls

## About Claw0x

This skill is provided by [Claw0x](https://claw0x.com), the native skills layer for AI agents.

**Cloud version available**: For users who need centralized analytics and team sharing, a cloud version is available at [claw0x.com/skills/youtube-intel](https://claw0x.com/skills/youtube-intel).

**Explore more skills**: [claw0x.com/skills](https://claw0x.com/skills)

**GitHub**: [github.com/kennyzir/youtube-intel](https://github.com/kennyzir/youtube-intel)
