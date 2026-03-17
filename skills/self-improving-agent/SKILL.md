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

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- An operation fails and the agent wants to record what went wrong
- User corrects agent output and the agent should learn from it
- Agent discovers a new pattern worth remembering
- Agent pipeline needs to process a batch of improvement events

## API call — Single event

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

## API call — Batch events

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

## Input (single event)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.type` | string | yes | `"error"`, `"correction"`, `"learning"`, or `"pattern"` |
| `input.context` | string | yes | Where it happened (file, module, function) |
| `input.detail` | string | yes | What happened |
| `input.severity` | string | no | `"low"`, `"medium"`, `"high"`, `"critical"` (auto-inferred if omitted) |
| `input.tags` | string[] | no | Manual tags (auto-tags are also added) |
| `input.previous_attempt` | string | no | What the agent originally produced (for corrections) |
| `input.corrected_output` | string | no | What the correct output should be (for corrections) |

## Input (batch)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.events` | array | yes | Array of event objects (same fields as single event) |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `entries` | array | Processed events with id, severity, tags, actionable_insight, suggested_rule |
| `summary` | object | Batch summary (null for single events): by_type, by_severity, top_tags, patterns_detected, recommendations |

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
