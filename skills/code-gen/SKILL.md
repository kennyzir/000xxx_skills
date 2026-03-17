---
name: claw0x-code-gen
description: >
  Generate production-ready TypeScript serverless function code from a skill
  description via the Claw0x API. Use when the user asks to generate skill code,
  create a new API handler, scaffold a serverless function, or auto-generate
  backend code from a README or description. Powered by Gemini LLM.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Code Generator

Generate complete, deployable TypeScript serverless function code from a skill name, description, and optional README content.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "generate code for this skill", "create a handler for", "scaffold a serverless function"
- Agent pipeline needs to auto-generate skill implementations
- User provides a README or description and wants working backend code

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "code-gen",
    "input": {
      "slug": "my-new-skill",
      "name": "My New Skill",
      "description": "Does X when given Y input"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.slug` | string | yes | URL-safe skill identifier |
| `input.name` | string | yes | Human-readable skill name |
| `input.description` | string | no | What the skill does |
| `input.readme_content` | string | no | README text to guide code generation (max ~6000 chars used) |
| `input.source_url` | string | no | Source repository URL for context |
| `input.topics` | string[] | no | Tags/topics for the skill |
| `input.needs_upstream_api` | boolean | no | Whether the skill wraps an external API |
| `input.evaluation_details` | object | no | AI evaluation notes and build recommendations |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Complete TypeScript handler code, ready to deploy |
| `slug` | string | The skill slug |
| `lines` | number | Line count of generated code |
| `has_fallback` | boolean | Whether the code includes a deterministic fallback |

## Error codes

- `400` — Missing required `input.slug` or `input.name`
- `422` — Generated code failed structural validation
- `502` — Upstream LLM API error (not billed)

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
