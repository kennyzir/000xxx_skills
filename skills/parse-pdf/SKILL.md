---
name: claw0x-parse-pdf
description: >
  Extract text, metadata, and page structure from PDF files via the Claw0x API.
  Use when the user asks to parse a PDF, extract text from a document, get page
  count, read a PDF by URL, or analyze PDF metadata. Handles files up to 10MB.
  Server-side processing — no local dependencies required.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Parse PDF

Extract text and structured metadata from any PDF accessible by URL.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "parse this PDF", "extract text from this document", "read this PDF"
- An agent pipeline needs PDF content as an intermediate step
- User provides a PDF URL and wants the text or metadata

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "parse-pdf",
    "input": {
      "pdf_url": "$ARGUMENTS"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pdf_url` | string | yes | URL of the PDF to parse (10–2000 chars, max 10MB file) |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Full extracted text content |
| `pages` | number | Total page count |
| `info` | object | PDF metadata (Title, Author, Creator, etc.) |
| `word_count` | number | Total words in the document |
| `char_count` | number | Total characters |
| `preview` | string | First 500 characters of extracted text |

## Error codes

- `400` — Missing or malformed `pdf_url`
- `404` — PDF not found at the given URL
- `408` — PDF download timed out (>30s)
- `5xx` — Server error (not billed)

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
