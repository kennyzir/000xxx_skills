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

## How It Works — Under the Hood

AgentMail is a wrapper around an upstream email API designed specifically for programmatic use by AI agents. Unlike traditional email services (Gmail, SendGrid) that are built for humans or marketing automation, AgentMail is built for agent-to-agent and agent-to-human communication.

### Architecture

This skill acts as a proxy — it receives your request, forwards it to the AgentMail upstream API, and returns the response in a normalized format. The Claw0x gateway handles authentication, billing, and rate limiting so you don't need a separate AgentMail account.

### Supported Actions

| Action | What It Does |
|--------|-------------|
| `send` | Send an email from an agent mailbox to any recipient |
| `list` | List emails in an agent's inbox (with pagination) |
| `read` | Read a specific email by ID |
| `create_mailbox` | Create a new email identity for an agent |

### How Agent Email Differs from Human Email

- **No UI needed** — everything is API-driven. Agents don't need a web interface to check email.
- **Programmatic identity** — each agent gets its own email address. No shared inboxes, no forwarding rules.
- **Structured payloads** — email bodies can contain structured data (JSON in the body) for agent-to-agent communication, not just human-readable text.
- **Webhook-ready** — incoming emails can trigger agent workflows (when combined with a webhook listener).

### Use Cases

- **Notification agents** — send alerts, reports, or summaries to human operators via email
- **Communication agents** — handle customer inquiries by reading incoming emails and composing responses
- **Multi-agent coordination** — agents communicate with each other via email when real-time messaging isn't needed
- **Audit trails** — email provides a persistent, timestamped record of agent communications

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to Use

- User says "send an email", "check my agent's inbox", "set up an email for my agent"
- Agent pipeline needs to send notifications, reports, or alerts via email
- Autonomous agent needs its own email identity for communication
- Multi-agent system needs asynchronous message passing

## API Call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "agentmail",
    "input": {
      "action": "send",
      "to": "recipient@example.com",
      "subject": "Daily report from your research agent",
      "body": "Here are today findings..."
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

## Error Codes

- `400` — Invalid input
- `500` — AgentMail API URL not configured
- `502` — Upstream API error (not billed)
- `504` — Upstream API timeout (>30s, not billed)

## Pricing

$0.02 per successful call. Failed calls and 5xx errors are never charged.
