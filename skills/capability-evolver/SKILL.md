---
name: Capability Evolver
description: >
  Meta-skill for AI agent self-improvement. Analyzes runtime
  logs to detect error patterns, regressions, and inefficiencies, then generates
  structured improvement proposals. Use when the user or agent asks to analyze
  logs, diagnose failures, improve agent reliability, generate evolution proposals,
  or assess system health. Supports analyze, evolve, and status actions.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Capability Evolver

Analyze agent runtime logs, detect patterns, compute health scores, and generate structured improvement proposals. Pure logic �?no external AI dependency.

## How It Works �?Under the Hood

Capability Evolver is a deterministic analysis engine that processes structured log data and produces actionable diagnostics. No LLM is involved �?the analysis is rule-based, which means results are reproducible and fast.

### Analysis Engine

The core engine processes log entries through several analysis passes:

1. **Pattern detection** �?logs are grouped by `context` (file/module) and `level` (error/warn/info/debug). The engine looks for:
   - **Repeated errors** �?the same error message appearing multiple times indicates a systemic issue, not a transient failure
   - **Error cascades** �?errors in module A followed by errors in module B within a short time window suggest a dependency chain failure
   - **Regression signals** �?errors that appear after a period of clean logs suggest a recent change broke something
   - **Inefficiency patterns** �?excessive warn-level logs or repeated retries indicate performance issues

2. **Health scoring** �?a system health score (0�?00) is computed based on:
   - Error rate (errors / total logs)
   - Error diversity (unique error messages / total errors)
   - Warn-to-error ratio
   - Time distribution (clustered errors score worse than spread-out errors)

3. **Recommendation generation** �?based on detected patterns, the engine generates specific, actionable recommendations. These aren't generic advice �?they reference the actual files, error messages, and patterns found in your logs.

### Evolution Strategies

When using the `evolve` action, you can choose a strategy that shapes the recommendations:

| Strategy | Focus | Best For |
|----------|-------|----------|
| `auto` | Balanced based on health score | Default �?let the engine decide |
| `balanced` | Equal weight to reliability and features | Stable systems with moderate issues |
| `innovate` | Prioritize new capabilities | Healthy systems ready to grow |
| `harden` | Prioritize reliability and error reduction | Systems with frequent failures |
| `repair-only` | Fix critical issues only | Systems in crisis |

### Evolution Proposals

The `evolve` action produces structured improvement proposals with:
- A unique `evolution_id` for tracking
- Prioritized recommendations with category labels (reliability, performance, architecture)
- Risk assessment (how risky is each proposed change)
- Estimated improvement (projected health score after implementing recommendations)

### Why Deterministic (Not LLM)?

- **Reproducible** �?same logs always produce the same analysis. Critical for debugging and auditing.
- **Fast** �?sub-100ms processing. No API call to an AI provider.
- **No hallucination risk** �?the engine only reports patterns it actually found in the data.
- **Cost-effective** �?pure computation, no token costs.

The tradeoff: the engine can't understand semantic meaning in log messages the way an LLM could. It relies on structural patterns (frequency, timing, severity) rather than understanding what the error message means in context.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to Use

- User says "analyze these logs", "what's failing", "improve my agent", "check system health"
- Agent pipeline needs automated diagnostics after a run
- User wants structured recommendations for fixing recurring errors
- Building a self-healing agent that adapts based on its own failure patterns

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

## Output (Analyze)

| Field | Type | Description |
|-------|------|-------------|
| `patterns` | array | Detected error/regression/inefficiency patterns with severity |
| `health_score` | number | System health 0�?00 |
| `recommendations` | string[] | Actionable improvement suggestions |
| `summary` | object | Counts: total_logs, error_count, warn_count, unique_patterns |

## Output (Evolve)

| Field | Type | Description |
|-------|------|-------------|
| `evolution_id` | string | Unique proposal ID |
| `strategy` | string | Effective strategy used |
| `recommendations` | array | Prioritized improvements with category and approach |
| `risk_assessment` | object | Risk level and contributing factors |
| `estimated_improvement` | string | Projected health score improvement |

## Error Codes

- `400` — Invalid action or missing logs array
- `401` — Invalid or missing API key
- `500` — Processing failed (not billed)

## Pricing

$0.03 per successful call. Failed calls and 5xx errors are never charged.