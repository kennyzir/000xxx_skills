---
name: claw0x-self-improving-agent
description: >
  Capture learnings, errors, corrections, and patterns for continuous agent
  improvement via the Claw0x API. Use when a command fails unexpectedly, a user
  corrects agent output, a new pattern is discovered, or the agent needs to log
  and process improvement events. Returns structured insights, suggested rules,
  and batch summaries. Supports single events and batch processing.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Self-Improving Agent

Log errors, corrections, learnings, and patterns. Get back structured insights, auto-generated rules, and batch analysis summaries.

> **Free to use.** This skill costs nothing. Just [sign up at claw0x.com](https://claw0x.com), create an API key, and start calling. No credit card, no wallet top-up required.

## How It Works — Under the Hood

This skill provides a structured event processing pipeline for agent self-improvement. It doesn't store data persistently — instead, it processes each event (or batch of events) in real time and returns actionable insights.

### The Processing Pipeline

1. **Event classification** — each incoming event is classified by type (`error`, `correction`, `learning`, `pattern`). If no severity is provided, it's auto-inferred based on the event type and content keywords.

2. **Auto-tagging** — the skill scans the `context` and `detail` fields for known patterns and applies tags automatically. For example:
   - An error mentioning "timeout" or "ETIMEDOUT" gets tagged `[network]`, `[timeout]`
   - A correction in a `.ts` file gets tagged `[typescript]`
   - A learning about "retry" gets tagged `[resilience]`

3. **Insight generation** — for each event, the skill generates an `actionable_insight` — a one-sentence summary of what the agent should do differently. For corrections, this compares the `previous_attempt` with the `corrected_output` to identify the delta.

4. **Rule suggestion** — each event produces a `suggested_rule` — a concrete, implementable rule the agent could add to its system prompt or configuration. Example: `"When calling external APIs, set a 10s timeout and retry once on ETIMEDOUT."`

5. **Batch analysis** (for multi-event submissions) — when you send an `events` array, the skill also produces:
   - Breakdown by type and severity
   - Top recurring tags (indicating systemic issues)
   - Pattern detection across events (e.g., "3 of 5 errors are network-related")
   - Prioritized recommendations

### Why This Matters for Agents

Traditional software logs errors and a human reads them later. Autonomous agents need to process their own failures in real time and adapt. This skill provides the structured feedback loop:

```
Agent runs → Error occurs → Log to self-improving-agent → Get insight + rule → Agent updates behavior
```

The skill is stateless by design — it doesn't accumulate history across calls. If you need persistent memory, store the returned `entries` in your own database and feed historical context back in future calls.

### Event Types Explained

| Type | When to Use | Example |
|------|-------------|---------|
| `error` | Something failed unexpectedly | API returned 500, file not found, parse error |
| `correction` | User or supervisor fixed agent output | Agent used tabs, user said use spaces |
| `learning` | Agent discovered something new | "This API requires auth header in a specific format" |
| `pattern` | Recurring behavior worth codifying | "Users always ask for JSON output, not XML" |

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

- An operation fails and the agent wants to record what went wrong
- User corrects agent output and the agent should learn from it
- Agent discovers a new pattern worth remembering
- Agent pipeline needs to process a batch of improvement events

## API Call — Single Event

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "self-improving-agent",
    "input": {
      "type": "error",
      "context": "api-client.ts",
      "detail": "Connection refused on port 3000"
    }
  }'
```

## API Call — Batch Events

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "self-improving-agent",
    "input": {
      "events": [
        {"type": "error", "context": "auth.ts", "detail": "Token expired"},
        {"type": "correction", "context": "formatter.ts", "detail": "Use tabs not spaces", "previous_attempt": "  const x", "corrected_output": "\tconst x"}
      ]
    }
  }'
```

## Input (Single Event)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.type` | string | yes | `"error"`, `"correction"`, `"learning"`, or `"pattern"` |
| `input.context` | string | yes | Where it happened (file, module, function) |
| `input.detail` | string | yes | What happened |
| `input.severity` | string | no | `"low"`, `"medium"`, `"high"`, `"critical"` (auto-inferred if omitted) |
| `input.tags` | string[] | no | Manual tags (auto-tags are also added) |
| `input.previous_attempt` | string | no | What the agent originally produced (for corrections) |
| `input.corrected_output` | string | no | What the correct output should be (for corrections) |

## Input (Batch)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.events` | array | yes | Array of event objects (same fields as single event) |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `entries` | array | Processed events with id, severity, tags, actionable_insight, suggested_rule |
| `summary` | object | Batch summary (null for single events): by_type, by_severity, top_tags, patterns_detected, recommendations |

## Example

**Single error input:**
```json
{
  "type": "error",
  "context": "api-client.ts",
  "detail": "ETIMEDOUT after 30s calling payment API"
}
```

**Output:**
```json
{
  "entries": [{
    "id": "evt_abc123",
    "type": "error",
    "severity": "high",
    "tags": ["network", "timeout", "payment"],
    "actionable_insight": "Payment API call timed out — consider reducing timeout and adding retry with exponential backoff.",
    "suggested_rule": "Set a 10s timeout for payment API calls. Retry once on ETIMEDOUT with 2s backoff."
  }]
}
```

## Pricing

**Free.** Apply for an API key and use it at no cost. No credit card required.
