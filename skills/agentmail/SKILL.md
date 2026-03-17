---
name: claw0x-agentmail
description: >
  API-first email platform for AI agents via the Claw0x API. Use when the user or
  agent needs to send email, manage mailboxes, read incoming messages, or handle
  email workflows programmatically. Designed for autonomous agent-to-agent and
  agent-to-human email communication.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# AgentMail

API-first email platform built for AI agents. Create mailboxes, send and receive emails, and manage email workflows without manual configuration.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "send an email", "check my agent's inbox", "set up an email for my agent"
- Agent pipeline needs to send notifications, reports, or alerts via email
- Autonomous agent needs its own email identity for communication

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "agentmail",
    "input": {
      "action": "send",
      "to": "recipient@example.com",
      "subject": "Hello from my agent",
      "body": "This is an automated message."
    }
  }'
```

## Input

The `input` field is a flexible object passed directly to the AgentMail upstream API. Common fields:

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | The operation: `"send"`, `"list"`, `"read"`, `"create_mailbox"` |
| `to` | string | Recipient email (for send) |
| `subject` | string | Email subject (for send) |
| `body` | string | Email body (for send) |

Refer to AgentMail API docs for the full input schema per action.

## Output

Response structure depends on the action performed. All responses include:

| Field | Type | Description |
|-------|------|-------------|
| `_meta.skill` | string | `"agentmail"` |
| `_meta.latency_ms` | number | Round-trip time in milliseconds |
| `_meta.upstream_status` | number | HTTP status from upstream API |

## Error codes

- `400` — Invalid input
- `500` — AgentMail API URL not configured
- `502` — Upstream API error
- `504` — Upstream API timeout (>30s)

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
