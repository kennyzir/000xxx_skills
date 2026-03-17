---
name: claw0x-validate-email
description: >
  Validate an email address for format correctness and risk scoring via the Claw0x
  API. Use when the user asks to validate an email, check if an email is real,
  verify email format, or assess email risk. Returns format validation, domain
  extraction, and a risk score.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Email Validator

Check whether an email address is properly formatted and assess its risk level.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "validate this email", "is this email real", "check this email address"
- Agent pipeline needs to verify email inputs before sending
- User wants to assess email quality or risk

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "validate-email",
    "input": {
      "email": "$ARGUMENTS"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | yes | Email address to validate (3–254 chars) |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the email format is valid |
| `email` | string | Normalized (lowercased) email |
| `checks.format_valid` | boolean | RFC format check result |
| `checks.domain` | string | Extracted domain |
| `checks.local_part` | string | Extracted local part (before @) |
| `risk_score` | number | Risk score (10 = low risk, 90 = high risk) |
| `suggestion` | string | Suggestion if invalid (null if valid) |

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
