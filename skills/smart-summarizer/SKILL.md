---
name: Smart Summarizer
description: >
  Summarize any text, URL, or document text into concise, configurable output.
  Use when the user wants a quick brief, bullet summary, or executive digest of
  long content. Returns structured summary fields for research agents, email
  digests, and document triage. Deterministic and free to use.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Smart Summarizer

Summarize long content into a shorter, usable form without depending on an upstream LLM. This skill is built for agent workflows that need consistent structured output, not creative rewriting.

> **Free to use.** Just create a Claw0x API key and call the skill.

## Quick Reference

| When This Happens | Input Type | What You Get |
|-------------------|------------|--------------|
| Long article to review | `text` | Summary + bullets + keywords |
| URL to summarize | `url` | Fetched + summarized content |
| PDF already extracted | `document_text` | Document summary |
| Need action items | `style: executive` | Action-focused summary |
| Research triage | `style: brief` | Quick overview |
| Email digest | `style: bullet` | Bullet-point list |

**Why deterministic?** Consistent output, no hallucination risk, fast processing, zero token costs.

---

## 5-Minute Quickstart

### Step 1: Get API Key (30 seconds)
Sign up at [claw0x.com](https://claw0x.com) → Dashboard → Create API Key

### Step 2: Summarize Your First Text (1 minute)
```bash
curl -X POST https://api.claw0x.com/v1/call \
  -H "Authorization: Bearer ck_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "smart-summarizer",
    "input": {
      "text": "Long article text here...",
      "style": "bullet",
      "max_sentences": 3
    }
  }'
```

### Step 3: Get Structured Summary (instant)
```json
{
  "title": "Article Title",
  "summary": "Main summary text",
  "bullets": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "keywords": ["keyword1", "keyword2"],
  "source_type": "text"
}
```

### Step 4: Integrate Into Workflow (2 minutes)
```typescript
// Add to research pipeline
const summary = await claw0x.call('smart-summarizer', {
  url: articleUrl,
  style: 'executive'
});

await db.articles.create({
  url: articleUrl,
  summary: summary.summary,
  bullets: summary.bullets,
  keywords: summary.keywords
});
```

**Done.** Your content is now summarized and structured.

---

## Real-World Use Cases

### Scenario 1: Research Agent Triage
**Problem**: Your agent needs to review 100+ articles and identify relevant ones

**Solution**:
1. Fetch article URLs from search results
2. Summarize each article
3. Extract keywords and key points
4. Filter by relevance
5. Deep-read only relevant articles

**Example**:
```typescript
const articles = await searchEngine.query('AI agent frameworks');

const summaries = await Promise.all(
  articles.map(article =>
    claw0x.call('smart-summarizer', {
      url: article.url,
      style: 'brief',
      max_sentences: 3
    })
  )
);

// Filter by keywords
const relevant = summaries.filter(s =>
  s.keywords.some(k => ['agent', 'framework', 'automation'].includes(k))
);

// Result: Reduced 100 articles to 15 relevant ones in 2 minutes
```

### Scenario 2: Email Digest Generation
**Problem**: Need to send daily digest of company news to team

**Solution**:
1. Collect news articles from RSS feeds
2. Summarize each article in bullet format
3. Combine into email digest
4. Send to team
5. Save time vs manual curation

**Example**:
```python
def generate_daily_digest():
    articles = fetch_rss_feeds()
    
    summaries = []
    for article in articles:
        result = client.call("smart-summarizer", {
            "url": article["url"],
            "style": "bullet",
            "max_sentences": 3
        })
        summaries.append({
            "title": result["title"],
            "bullets": result["bullets"],
            "url": article["url"]
        })
    
    # Generate email
    email_body = format_digest(summaries)
    send_email(team_list, "Daily Digest", email_body)
    
    return len(summaries)
# Result: Automated daily digest, 2 hours saved per day
```

### Scenario 3: Document Triage
**Problem**: Legal team has 500 contracts to review, need to prioritize

**Solution**:
1. Extract text from PDFs (using separate tool)
2. Summarize each contract
3. Extract key points and keywords
4. Rank by priority keywords
5. Review high-priority contracts first

**Example**:
```javascript
async function triageContracts(pdfFiles) {
  const summaries = [];
  
  for (const pdf of pdfFiles) {
    // Extract text (using pdf-parser or similar)
    const text = await extractPdfText(pdf);
    
    // Summarize
    const summary = await claw0x.call('smart-summarizer', {
      document_text: text,
      title: pdf.name,
      style: 'executive',
      max_sentences: 5
    });
    
    // Check for priority keywords
    const isPriority = summary.keywords.some(k =>
      ['termination', 'liability', 'indemnity', 'breach'].includes(k)
    );
    
    summaries.push({ ...summary, priority: isPriority });
  }
  
  // Sort by priority
  return summaries.sort((a, b) => b.priority - a.priority);
}
// Result: Review 500 contracts in priority order, 80% time saved
```

### Scenario 4: Meeting Notes Summarization
**Problem**: Team has long meeting transcripts, need quick summaries

**Solution**:
1. Get meeting transcript (from Zoom, Teams, etc.)
2. Summarize with action items focus
3. Extract key decisions and action items
4. Distribute to attendees
5. Track action items automatically

**Example**:
```typescript
async function summarizeMeeting(transcriptUrl) {
  const summary = await claw0x.call('smart-summarizer', {
    url: transcriptUrl,
    style: 'executive',
    summary_type: 'action_items'
  });
  
  // Extract action items from bullets
  const actionItems = summary.bullets.filter(b =>
    b.toLowerCase().includes('action') || 
    b.toLowerCase().includes('todo') ||
    b.toLowerCase().includes('follow up')
  );
  
  // Create tasks
  for (const item of actionItems) {
    await taskManager.create({
      title: item,
      source: 'meeting',
      meeting_url: transcriptUrl
    });
  }
  
  // Send summary to attendees
  await sendEmail(attendees, 'Meeting Summary', {
    summary: summary.summary,
    action_items: actionItems,
    keywords: summary.keywords
  });
}
// Result: Automated meeting follow-up, 100% action item tracking
```

---

## Integration Recipes

### OpenClaw Agent
```typescript
import { Claw0xClient } from '@claw0x/sdk';

const claw0x = new Claw0xClient(process.env.CLAW0X_API_KEY);

// Summarize articles in research workflow
agent.onCommand('research', async (topic) => {
  const articles = await searchEngine.query(topic);
  
  const summaries = await Promise.all(
    articles.map(article =>
      claw0x.call('smart-summarizer', {
        url: article.url,
        style: 'brief'
      })
    )
  );
  
  return summaries;
});
```

### LangChain Agent
```python
from claw0x import Claw0xClient
import os

client = Claw0xClient(api_key=os.getenv("CLAW0X_API_KEY"))

def summarize_document(text, style='bullet'):
    result = client.call("smart-summarizer", {
        "text": text,
        "style": style,
        "max_sentences": 5
    })
    
    return {
        "summary": result["summary"],
        "bullets": result["bullets"],
        "keywords": result["keywords"]
    }

# Use in document processing chain
summary = summarize_document(long_text)
```

### Content Pipeline (Generic HTTP)
```javascript
async function processArticle(url) {
  const response = await fetch('https://api.claw0x.com/v1/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLAW0X_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      skill: 'smart-summarizer',
      input: {
        url,
        style: 'executive',
        max_sentences: 5
      }
    })
  });
  
  const result = await response.json();
  
  // Store in CMS
  await cms.create({
    original_url: url,
    title: result.title,
    summary: result.summary,
    bullets: result.bullets,
    keywords: result.keywords
  });
}
```

### Batch Processing
```typescript
// Summarize multiple documents
const documents = await db.documents.findMany({ 
  status: 'pending_summary' 
});

const summaries = await Promise.all(
  documents.map(doc =>
    claw0x.call('smart-summarizer', {
      text: doc.content,
      title: doc.title,
      style: 'bullet',
      max_sentences: 5
    })
  )
);

// Update database
for (let i = 0; i < documents.length; i++) {
  await db.documents.update({
    where: { id: documents[i].id },
    data: {
      summary: summaries[i].summary,
      bullets: summaries[i].bullets,
      keywords: summaries[i].keywords,
      status: 'summarized'
    }
  });
}
```

---

## Deterministic vs LLM Summarization: Which is Right for You?

| Feature | LLM-Based (GPT-4, Claude) | Smart Summarizer (Deterministic) |
|---------|---------------------------|----------------------------------|
| **Setup Time** | 5-10 min (API key, prompts) | 2 minutes (get API key) |
| **Processing Speed** | 5-30 seconds | Sub-second |
| **Reproducibility** | ❌ Varies per run | ✅ Same input = same output |
| **Creativity** | ✅ Can rephrase creatively | ❌ Extractive only |
| **Cost** | $0.01-0.10 per summary | Free |
| **Hallucination Risk** | ⚠️ Can invent facts | ✅ Only extracts real sentences |
| **Structured Output** | ⚠️ Needs prompt engineering | ✅ Always JSON |

### When to Use LLM-Based
- Need creative rephrasing
- Want natural language flow
- Summarizing creative content
- Need semantic understanding

### When to Use Smart Summarizer (Deterministic)
- Need reproducible results
- Want fast processing (sub-second)
- Processing thousands of documents
- Cost-sensitive applications
- Need structured JSON output
- Extractive summary is sufficient

---

## How It Fits Into Your Content Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  Content Processing Pipeline                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─ Content Ingestion
                            │  • RSS feeds
                            │  • Web scraping
                            │  • Document uploads
                            │
                            ├─ Summarization
                            │  POST /v1/call
                            │  {text/url/document_text, style, max_sentences}
                            │
                            ├─ Structured Output
                            │  • Summary text
                            │  • Bullet points
                            │  • Keywords
                            │  • Metadata
                            │
                            └─ Distribution
                               • Email digests
                               • Dashboard updates
                               • Database storage
```

### Integration Points

1. **Research Triage** — Quick review of many articles
2. **Email Digests** — Daily/weekly content summaries
3. **Document Processing** — Bulk summarization
4. **Content Curation** — Filter by keywords
5. **Meeting Notes** — Extract action items

---

## Why Use This Via Claw0x?

### Unified Infrastructure
- **One API key** for all skills — no per-provider auth
- **Atomic billing** — pay per successful call, $0 on failure (currently free)
- **Security scanned** — OSV.dev integration for all skills

### Summarization-Optimized
- **Deterministic** — reproducible, auditable results
- **Fast processing** — sub-second summarization
- **Structured output** — JSON format with bullets, keywords, metadata
- **Multiple input modes** — text, URL, or document_text

### Production-Ready
- **99.9% uptime** — reliable infrastructure
- **Scales to millions** — handle enterprise-scale summarization
- **Cloud-native** — works in Lambda, Cloud Run, containers
- **Zero dependencies** — no LLM API keys required


## What It Does

- Summarizes raw text
- Summarizes a public URL by fetching readable page content
- Summarizes document content when the document text is already extracted upstream
- Returns a short summary plus bullet points and metadata

---

## Real-World Use Cases

### Scenario 1: Research Agent Triage
**Problem**: Your agent needs to review 100+ articles and identify relevant ones

**Solution**:
1. Fetch article URLs from search results
2. Summarize each article
3. Extract keywords and key points
4. Filter by relevance
5. Deep-read only relevant articles

**Example**:
```typescript
const articles = await searchEngine.query('AI agent frameworks');

const summaries = await Promise.all(
  articles.map(article =>
    claw0x.call('smart-summarizer', {
      url: article.url,
      style: 'brief',
      max_sentences: 3
    })
  )
);

// Filter by keywords
const relevant = summaries.filter(s =>
  s.keywords.some(k => ['agent', 'framework', 'automation'].includes(k))
);

// Result: Reduced 100 articles to 15 relevant ones in 2 minutes
```

### Scenario 2: Email Digest Generation
**Problem**: Need to send daily digest of company news to team

**Solution**:
1. Collect news articles from RSS feeds
2. Summarize each article in bullet format
3. Combine into email digest
4. Send to team
5. Save time vs manual curation

**Example**:
```python
def generate_daily_digest():
    articles = fetch_rss_feeds()
    
    summaries = []
    for article in articles:
        result = client.call("smart-summarizer", {
            "url": article["url"],
            "style": "bullet",
            "max_sentences": 3
        })
        summaries.append({
            "title": result["title"],
            "bullets": result["bullets"],
            "url": article["url"]
        })
    
    # Generate email
    email_body = format_digest(summaries)
    send_email(team_list, "Daily Digest", email_body)
    
    return len(summaries)
# Result: Automated daily digest, 2 hours saved per day
```

### Scenario 3: Document Processing Pipeline
**Problem**: Legal team has 500 contracts to review, need quick summaries

**Solution**:
1. Extract text from PDFs (using separate tool)
2. Summarize each contract
3. Extract key points and keywords
4. Rank by priority keywords
5. Review high-priority contracts first

**Example**:
```javascript
async function processContracts(pdfFiles) {
  const summaries = [];
  
  for (const pdf of pdfFiles) {
    // Extract text (using pdf-parser)
    const text = await extractPdfText(pdf);
    
    // Summarize
    const summary = await claw0x.call('smart-summarizer', {
      document_text: text,
      title: pdf.name,
      style: 'executive',
      max_sentences: 5
    });
    
    // Check for priority keywords
    const isPriority = summary.keywords.some(k =>
      ['termination', 'liability', 'indemnity', 'breach'].includes(k)
    );
    
    summaries.push({ ...summary, priority: isPriority, file: pdf.name });
  }
  
  // Sort by priority
  return summaries.sort((a, b) => b.priority - a.priority);
}
// Result: Review 500 contracts in priority order, 80% time saved
```

### Scenario 4: Content Curation
**Problem**: Content team needs to curate relevant articles for newsletter

**Solution**:
1. Scrape articles from multiple sources
2. Summarize each article
3. Extract keywords for categorization
4. Filter by topic relevance
5. Auto-generate newsletter draft

**Example**:
```typescript
async function curateNewsletter(sources, topic) {
  const articles = await scrapeMultipleSources(sources);
  
  const summaries = await Promise.all(
    articles.map(article =>
      claw0x.call('smart-summarizer', {
        url: article.url,
        style: 'bullet',
        max_sentences: 4
      })
    )
  );
  
  // Filter by topic keywords
  const relevant = summaries.filter(s =>
    s.keywords.some(k => topic.keywords.includes(k))
  );
  
  // Generate newsletter
  const newsletter = {
    title: `${topic.name} Weekly Digest`,
    sections: relevant.map(s => ({
      title: s.title,
      summary: s.summary,
      bullets: s.bullets,
      source_url: s.source_url
    }))
  };
  
  return newsletter;
}
// Result: Automated weekly newsletter, 5 hours saved per week
```

---

## Integration Recipes

### OpenClaw Agent
```typescript
import { Claw0xClient } from '@claw0x/sdk';

const claw0x = new Claw0xClient(process.env.CLAW0X_API_KEY);

// Summarize in research workflow
agent.onCommand('summarize', async (url) => {
  const result = await claw0x.call('smart-summarizer', {
    url,
    style: 'executive'
  });
  
  return {
    summary: result.summary,
    bullets: result.bullets,
    keywords: result.keywords
  };
});
```

### LangChain Agent
```python
from claw0x import Claw0xClient
import os

client = Claw0xClient(api_key=os.getenv("CLAW0X_API_KEY"))

def summarize_for_research(url):
    result = client.call("smart-summarizer", {
        "url": url,
        "style": "brief",
        "max_sentences": 3
    })
    
    return result["summary"]

# Use in research chain
summary = summarize_for_research(article_url)
```

### Content Pipeline (Generic HTTP)
```javascript
async function summarizeArticle(text, style = 'bullet') {
  const response = await fetch('https://api.claw0x.com/v1/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLAW0X_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      skill: 'smart-summarizer',
      input: { text, style, max_sentences: 5 }
    })
  });
  
  const result = await response.json();
  return result;
}
```

### Batch Processing
```typescript
// Summarize multiple documents
const documents = await db.documents.findMany({ 
  status: 'pending_summary' 
});

const summaries = await Promise.all(
  documents.map(doc =>
    claw0x.call('smart-summarizer', {
      text: doc.content,
      title: doc.title,
      style: 'bullet',
      max_sentences: 5
    })
  )
);

// Update database
for (let i = 0; i < documents.length; i++) {
  await db.documents.update({
    where: { id: documents[i].id },
    data: {
      summary: summaries[i].summary,
      bullets: summaries[i].bullets,
      keywords: summaries[i].keywords,
      status: 'summarized'
    }
  });
}
```

---

## What It Does

## Why This V1 Is Narrower Than The Name

The marketplace pitch says "text, URL, or document", but a free deterministic skill should not pretend to parse every file format. In this version:

- `text` is fully supported
- `url` is fully supported for public HTML or plain text pages
- `document_text` is supported when another step already extracted the document's text

This avoids hidden upstream AI costs and keeps the skill reliable enough to list as a free utility.

## When To Use

- Research agents need a first-pass summary of an article or note
- Email digest workflows need a compact brief
- Document triage needs quick key points before deeper review
- Agents want stable JSON output instead of free-form paragraphs

## Input

Provide exactly one source field.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | no | Raw text to summarize |
| `document_text` | string | no | Extracted text from a PDF, DOCX, transcript, or other document |
| `url` | string | no | Public `http` or `https` URL to fetch and summarize |
| `title` | string | no | Optional source title |
| `style` | string | no | `brief`, `bullet`, or `executive` |
| `summary_type` | string | no | Alias for style. `action_items` and `research_digest` map to executive style |
| `max_sentences` | number | no | Number of sentences to keep, 2-10 |
| `max_length` | number | no | Soft length hint used to infer summary density |
| `language` | string | no | Caller-provided language hint, echoed back in output |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Source title or inferred heading |
| `summary` | string | Main summary text |
| `bullets` | string[] | Bullet-form key points |
| `key_points` | string[] | Alias of bullets for agent pipelines |
| `source_type` | string | `text`, `url`, or `document` |
| `source_url` | string \| null | Original URL if URL mode was used |
| `sentence_count_used` | number | Number of summary sentences selected |
| `original_sentence_count` | number | Number of readable source sentences detected |
| `original_characters` | number | Source size in characters |
| `summarized_characters` | number | Output summary size in characters |
| `keywords` | string[] | Frequent source terms |
| `excerpt` | string | First readable source sentence |

## Example

**Input**

```json
{
  "input": {
    "text": "Smart summarization is useful when teams need a fast first-pass review of long internal documents. It helps operators triage what matters, extract the main decisions, and skip repetitive detail. It is especially useful in research workflows where many articles must be screened before deep reading.",
    "style": "bullet",
    "max_sentences": 3
  }
}
```

**Output**

```json
{
  "title": "Smart summarization is useful when teams need a fast first-pass review of long internal documents.",
  "summary": "- Smart summarization is useful when teams need a fast first-pass review of long internal documents.\n- It helps operators triage what matters, extract the main decisions, and skip repetitive detail.\n- It is especially useful in research workflows where many articles must be screened before deep reading.",
  "bullets": [
    "Smart summarization is useful when teams need a fast first-pass review of long internal documents.",
    "It helps operators triage what matters, extract the main decisions, and skip repetitive detail.",
    "It is especially useful in research workflows where many articles must be screened before deep reading."
  ],
  "source_type": "text",
  "keywords": ["documents", "research", "workflows"]
}
```

## Error Codes

- `400` Missing input, multiple source fields, invalid URL, or unreadable content
- `401` Missing or invalid Claw0x API key
- `502` URL fetch failed
- `500` Internal processing error

## Pricing

**Free.** No upstream provider key required.
