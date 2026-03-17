---
name: claw0x-scrape
description: >
  Scrape and extract structured data from any webpage via the Claw0x API.
  Use when the user asks to scrape a website, extract page content, get headings
  and links from a URL, or pull structured data from a web page. Returns title,
  headings, links, images, and paragraph text. Server-side — no browser needed.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Web Scraper

Extract structured content from any webpage: title, headings, links, images, and text.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "scrape this page", "get the content from this URL", "extract data from this website"
- Agent needs structured web content (headings, links, images) from a URL
- User wants a quick summary of what's on a page

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "scrape",
    "input": {
      "url": "$ARGUMENTS"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | yes | URL of the webpage to scrape (10–2000 chars) |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Page `<title>` tag content |
| `description` | string | Meta description |
| `headings.h1` | string[] | All H1 headings |
| `headings.h2` | string[] | All H2 headings |
| `links` | array | Up to 50 links with `text` and `href` |
| `images` | array | Up to 20 images with `alt` and `src` |
| `paragraphs` | string[] | Up to 10 paragraphs (>20 chars each) |

## Error codes

- `400` — Missing or malformed `url`
- `5xx` — Scraping failed or target unreachable (not billed)

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
