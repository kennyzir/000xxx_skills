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

Extract structured content from any webpage: title, headings, links, images, and text. Server-side processing — no browser, no Puppeteer, no Selenium.

## How It Works — Under the Hood

This skill fetches a webpage server-side and parses the HTML into structured data. No headless browser is involved — it uses HTTP fetch + HTML parsing, which makes it fast and lightweight but means it won't execute JavaScript-rendered content.

### Processing Pipeline

1. **URL validation** — the input URL is validated for format (must be a valid HTTP/HTTPS URL, 10–2000 characters). Malformed URLs are rejected with a 400 error.

2. **Server-side fetch** — the skill makes an HTTP GET request to the target URL with a standard browser User-Agent header. The request has a 30-second timeout. Redirects are followed (up to 5 hops).

3. **HTML parsing** — the raw HTML response is parsed into a DOM tree. The parser extracts:
   - `<title>` tag content
   - `<meta name="description">` content
   - All `<h1>` and `<h2>` headings (text content only)
   - Up to 50 `<a>` links with their `text` and `href` attributes
   - Up to 20 `<img>` tags with their `alt` and `src` attributes
   - Up to 10 `<p>` paragraphs longer than 20 characters

4. **URL resolution** — relative URLs in links and images are resolved to absolute URLs based on the page's base URL.

5. **Cleanup** — whitespace is normalized, empty strings are filtered out, and duplicate entries are removed.

### What This Skill Does Well

- **Speed** — no browser startup overhead. Typical response time is 1–3 seconds including the network fetch.
- **Structured output** — instead of raw HTML, you get clean JSON with headings, links, images, and text separated into fields.
- **Agent-friendly** — the output is designed to be consumed by LLMs and agent pipelines. No HTML parsing needed on the client side.

### Limitations

- **No JavaScript rendering** — pages that load content via JavaScript (SPAs, React apps, dynamically loaded feeds) will return incomplete data. The skill sees only the initial HTML response.
- **No authentication** — it can't scrape pages behind login walls. Only publicly accessible URLs work.
- **Rate limiting** — some websites block rapid requests from server IPs. If the target site returns a 403 or 429, the skill will return a 5xx error (not billed).

For JavaScript-heavy pages, consider using a dedicated rendering service and passing the rendered HTML URL to this skill.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to Use

- User says "scrape this page", "get the content from this URL", "extract data from this website"
- Agent needs structured web content (headings, links, images) from a URL
- Building a research pipeline that collects data from multiple pages
- User wants a quick summary of what's on a page

## API Call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "scrape",
    "input": {
      "url": "https://example.com"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | yes | URL of the webpage to scrape (10–2000 chars) |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Page `<title>` tag content |
| `description` | string | Meta description |
| `headings.h1` | string[] | All H1 headings |
| `headings.h2` | string[] | All H2 headings |
| `links` | array | Up to 50 links with `text` and `href` |
| `images` | array | Up to 20 images with `alt` and `src` |
| `paragraphs` | string[] | Up to 10 paragraphs (>20 chars each) |

## Example

**Input:** `{ "url": "https://example.com" }`

**Output:**
```json
{
  "title": "Example Domain",
  "description": "",
  "headings": { "h1": ["Example Domain"], "h2": [] },
  "links": [{ "text": "More information...", "href": "https://www.iana.org/domains/example" }],
  "images": [],
  "paragraphs": ["This domain is for use in illustrative examples in documents."]
}
```

## Error Codes

- `400` — Missing or malformed `url`
- `5xx` — Scraping failed or target unreachable (not billed)

## Pricing

$0.005 per successful call. Failed calls and 5xx errors are never charged.
