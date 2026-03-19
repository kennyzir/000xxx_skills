---
name: claw0x-validate-email
description: >
  Validate an email address for format correctness and risk scoring via the Claw0x
  API. Use when the user asks to validate an email, check if an email is real,
  verify email format, or assess email risk. Returns format validation, domain
  extraction, and a risk score.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Email Validator

Check whether an email address is properly formatted and assess its risk level. Pure server-side logic — no external API dependency.

> **Free to use.** This skill costs nothing. Just [sign up at claw0x.com](https://claw0x.com), create an API key, and start calling. No credit card, no wallet top-up required.

## How It Works — Under the Hood

This skill runs entirely as deterministic server-side logic. No LLM, no third-party verification API. It performs a multi-step validation pipeline on the email string you provide:

### Step 1: Format Validation (RFC 5322)

The email is checked against the RFC 5322 standard for email address syntax:

- Local part (before `@`): must be 1–64 characters, allows alphanumeric, dots, hyphens, underscores, and plus signs. Cannot start or end with a dot, and cannot have consecutive dots.
- Domain part (after `@`): must be a valid hostname — alphanumeric labels separated by dots, each label 1–63 characters, TLD at least 2 characters.
- Total length: 3–254 characters per the SMTP spec.

### Step 2: Domain Extraction & Analysis

The domain is extracted and analyzed for known risk signals:

- **Disposable email providers** — domains like `mailinator.com`, `guerrillamail.com`, `tempmail.com` and ~50 others are flagged as high-risk. These are commonly used for spam signups and throwaway accounts.
- **Free email providers** — domains like `gmail.com`, `yahoo.com`, `outlook.com` are noted but not penalized. They're legitimate but less trustworthy for B2B contexts.
- **Corporate domains** — custom domains (e.g. `user@company.com`) are considered lower risk.

### Step 3: Risk Scoring

A numeric risk score (0–100) is computed based on weighted factors:

| Factor | Risk Impact |
|--------|-------------|
| Invalid format | +90 (instant high risk) |
| Disposable domain | +70 |
| Suspicious local part (all numbers, very short) | +20–30 |
| Free email provider | +10 |
| Valid format + corporate domain | +10 (baseline low risk) |

Lower score = safer email. The score is a heuristic, not a deliverability guarantee — it tells you how likely the email is to be legitimate based on structural analysis alone.

### What This Skill Does NOT Do

- **No SMTP verification** — it doesn't connect to the mail server to check if the mailbox exists. This would require network calls, introduce latency, and risk IP blacklisting.
- **No DNS MX lookup** — it doesn't verify that the domain has mail exchange records. This keeps the skill fast and deterministic.
- **No deliverability prediction** — it can't tell you if an email will bounce. For that, you'd need a dedicated deliverability service.

This is by design. The skill is optimized for speed, determinism, and zero external dependencies — making it ideal as a pre-filter in agent pipelines before more expensive verification steps.

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

- User says "validate this email", "is this email real", "check this email address"
- Agent pipeline needs to verify email inputs before sending
- Pre-filtering signups or form submissions for obvious junk
- Assessing email quality or risk in a data cleaning pipeline

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | yes | Email address to validate (3–254 chars) |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the email format is valid |
| `email` | string | Normalized (lowercased) email |
| `checks.format_valid` | boolean | RFC format check result |
| `checks.domain` | string | Extracted domain |
| `checks.local_part` | string | Extracted local part (before @) |
| `risk_score` | number | Risk score (10 = low risk, 90 = high risk) |
| `suggestion` | string | Suggestion if invalid (null if valid) |

## Example

**Input:** `"test@mailinator.com"`

**Output:**
```json
{
  "valid": true,
  "email": "test@mailinator.com",
  "checks": {
    "format_valid": true,
    "domain": "mailinator.com",
    "local_part": "test"
  },
  "risk_score": 80,
  "suggestion": null
}
```

Format is valid, but risk score is high (80) because `mailinator.com` is a known disposable email provider.

## Error Codes

- `400` — Missing or invalid email input
- `401` — Invalid or missing API key
- `500` — Processing failed (not billed)

## Pricing

**Free.** Apply for an API key and use it at no cost. No credit card required.