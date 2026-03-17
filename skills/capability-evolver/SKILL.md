---
name: claw0x-capability-evolver
description: >
  Meta-skill for AI agent self-improvement via the Claw0x API. Analyzes runtime
  logs to detect error patterns, regressions, and inefficiencies, then generates
  structured improvement proposals. Use when the user or agent asks to analyze
  logs, diagnose failures, improve agent reliability, generate evolution proposals,
  or assess system health. Supports analyze, evolve, and status actions.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Capability Evolver

Analyze agent runtime logs, detect patterns, compute health scores, and generate structured improvement proposals. Pure logic — no external API dependency.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "analyze these logs", "what's failing", "improve my agent", "check system health"
- Agent pipeline needs automated diagnostics after a run
- User wants structured recommendations for fixing recurring errors

## API call — Analyze

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "capability-evolver",
    "input": {
      "action": "analyze",
      "logs": [
        {"timestamp": "2026-03-17T10:00:00Z", "level": "error", "message": "Connection refused", "context": "api-client.ts"},
        {"timestamp": "2026-03-17T10:05:00Z", "level": "warn", "message": "Retry limit reached", "context": "api-client.ts"}
      ]
    }
  }'
```

## API call — Evolve

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "capability-evolver",
    "input": {
      "action": "evolve",
      "strategy": "auto",
      "logs": [...]
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.action` | string | yes | `"analyze"`, `"evolve"`, or `"status"` |
| `input.logs` | array | yes (for analyze/evolve) | Array of log entries |
| `input.logs[].timestamp` | string | yes | ISO timestamp |
| `input.logs[].level` | string | yes | `"error"`, `"warn"`, `"info"`, or `"debug"` |
| `input.logs[].message` | string | yes | Log message |
| `input.logs[].context` | string | no | File or module name |
| `input.strategy` | string | no | `"auto"`, `"balanced"`, `"innovate"`, `"harden"`, `"repair-only"` |
| `input.target_file` | string | no | Focus analysis on a specific file |

## Output (analyze)

| Field | Type | Description |
|-------|------|-------------|
| `patterns` | array | Detected error/regression/inefficiency patterns with severity |
| `health_score` | number | System health 0–100 |
| `recommendations` | string[] | Actionable improvement suggestions |
| `summary` | object | Counts: total_logs, error_count, warn_count, unique_patterns |

## Output (evolve)

| Field | Type | Description |
|-------|------|-------------|
| `evolution_id` | string | Unique proposal ID |
| `strategy` | string | Effective strategy used |
| `recommendations` | array | Prioritized improvements with category and approach |
| `risk_assessment` | object | Risk level and contributing factors |
| `estimated_improvement` | string | Projected health score improvement |

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
