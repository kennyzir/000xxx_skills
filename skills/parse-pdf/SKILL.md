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

Extract text and structured metadata from any PDF accessible by URL. Handles files up to 10MB with server-side processing.

## How It Works — Under the Hood

This skill downloads a PDF from the URL you provide, parses it server-side using a JavaScript PDF parsing library (pdf-parse), and returns the extracted text along with document metadata.

### Processing Pipeline

1. **URL validation** — the input URL is validated for format and length (10–2000 characters). Must be a publicly accessible HTTP/HTTPS URL pointing to a PDF file.

2. **PDF download** — the skill fetches the PDF binary from the URL with a 30-second timeout. The file size is checked — anything over 10MB is rejected to prevent memory issues in the serverless environment.

3. **Binary parsing** — the PDF binary is passed to the pdf-parse library, which:
   - Extracts raw text content from all pages, preserving reading order
   - Reads document metadata (Title, Author, Creator, Producer, CreationDate, ModDate)
   - Counts total pages

4. **Text processing** — the extracted text is post-processed:
   - Excessive whitespace is normalized
   - Page break artifacts are cleaned up
   - A `preview` field is generated (first 500 characters) for quick inspection
   - Word count and character count are computed

5. **Response assembly** — the structured result is returned with full text, metadata, and statistics.

### What This Skill Handles Well

- **Standard text PDFs** — documents created by word processors, LaTeX, or web-to-PDF converters. Text extraction is reliable and fast.
- **Multi-page documents** — handles hundreds of pages without issue (within the 10MB limit).
- **Metadata extraction** — pulls author, title, creation date, and other PDF info fields.

### Limitations

- **Scanned PDFs / images** — if the PDF contains scanned images instead of text layers, the extracted text will be empty or garbled. This skill does not include OCR. For scanned documents, you'd need an OCR skill first.
- **Complex layouts** — multi-column layouts, tables, and forms may produce text in unexpected reading order. The parser follows the PDF's internal text stream order, which doesn't always match visual layout.
- **Encrypted PDFs** — password-protected PDFs cannot be parsed. The skill will return an error.
- **10MB limit** — large PDFs (textbooks, image-heavy reports) may exceed the limit. Consider splitting them first.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to Use

- User says "parse this PDF", "extract text from this document", "read this PDF"
- Agent pipeline needs PDF content as an intermediate step (e.g., summarize a paper, extract data from a report)
- User provides a PDF URL and wants the text or metadata
- Building a document processing pipeline

## API Call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "parse-pdf",
    "input": {
      "pdf_url": "https://example.com/document.pdf"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pdf_url` | string | yes | URL of the PDF to parse (10–2000 chars, max 10MB file) |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Full extracted text content |
| `pages` | number | Total page count |
| `info` | object | PDF metadata (Title, Author, Creator, etc.) |
| `word_count` | number | Total words in the document |
| `char_count` | number | Total characters |
| `preview` | string | First 500 characters of extracted text |

## Example

**Input:** `{ "pdf_url": "https://example.com/report.pdf" }`

**Output:**
```json
{
  "text": "Annual Report 2025\n\nRevenue grew 23% year-over-year...",
  "pages": 12,
  "info": {
    "Title": "Annual Report 2025",
    "Author": "Finance Team",
    "Creator": "Microsoft Word"
  },
  "word_count": 4500,
  "char_count": 28000,
  "preview": "Annual Report 2025\n\nRevenue grew 23% year-over-year..."
}
```

## Error Codes

- `400` — Missing or malformed `pdf_url`
- `404` — PDF not found at the given URL
- `408` — PDF download timed out (>30s)
- `413` — PDF exceeds 10MB size limit
- `5xx` — Server error (not billed)

## Pricing

$0.005 per successful call. Failed calls and 5xx errors are never charged.
