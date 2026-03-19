---
name: skill-creator
description: >
  Create new AI agent skills from scratch, improve existing skills, and optimize
  skill descriptions for better triggering accuracy via the Claw0x API. Use when
  users want to build a skill, write a SKILL.md, write handler code, evaluate
  skill quality, optimize skill metadata, or generate test cases. Covers the full
  skill development lifecycle from intent capture through deployment and iteration.
  Even if the user just says "I have an idea for a skill" or "help me package this
  as a skill", this is the right tool.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
  version: "1.0.0"
  source: "https://github.com/anthropics/skills/tree/main/skills/skill-creator"
  license: "MIT"
---

# Skill Creator

Build production-ready AI agent skills for the Claw0x platform. From a one-sentence idea to a deployed, billed, security-scanned skill — this guide and API cover the full lifecycle.

> **Free to use.** This skill costs nothing. [Sign up at claw0x.com](https://claw0x.com), create an API key, and start calling. No credit card required.

## How Claw0x Skills Work — Architecture in 60 Seconds

Every skill on Claw0x follows the same pattern:

```
Agent -> POST https://api.claw0x.com/v1/call -> Gateway -> skill backend -> Response
```

1. An AI agent (or human) calls the Gateway with a Claw0x API key
2. The Gateway authenticates, routes to the skill backend, and handles billing
3. The skill backend runs the handler and returns a result
4. Only 2xx responses are billed. 4xx/5xx = free. Zero risk for the caller.

The caller never needs upstream API keys. One key, one endpoint, zero config.

## Skill Directory Structure

Every skill lives in a standard directory:

```
skills/{slug}/
+-- SKILL.md       # Agent discovery entry point (required)
+-- handler.ts     # Serverless function logic (required)
```

- `SKILL.md` is what agents read to decide whether to invoke the skill
- `handler.ts` is the actual execution logic, deployed as a Vercel serverless function

## Two Types of Skills

**API Wrapper Skills** wrap an external API behind the Gateway. The handler calls the upstream API using a server-side key that the caller never sees. Example: `humanizer` wraps Gemini for AI text rewriting.

**Pure Logic Skills** have no external API calls. All processing happens inside the handler. Cheaper (50% discount) and get free-tier allocation. Example: `sentiment` does regex + heuristic analysis locally. `skill-creator` (this skill) is also pure logic.
## Stage 1: Capture Intent

Before writing any code, answer these six questions. They determine everything downstream.

1. **What does this skill do in one sentence?**
   A concrete action. "Extracts structured data from PDF invoices and returns JSON" — not "AI-powered document intelligence."

2. **When should an agent invoke this skill?**
   List 3-5 specific trigger phrases. These become the foundation of your `description` field.

3. **What inputs does it need?**
   Every field: name, type, required/optional, constraints.

4. **What does the output look like?**
   The exact JSON shape including `_meta` with `skill`, `version`, and `latency_ms`.

5. **Does it need an upstream API?**
   Yes = API Wrapper. No = Pure Logic (cheaper, simpler).

6. **What can go wrong?**
   List failure modes. Each needs a specific error code and message.

A skill with a vague intent produces a vague description, which produces poor triggering, which means agents never invoke it. The six questions force precision upfront.

## Stage 2: Write the SKILL.md

The SKILL.md is the single most important file. It is what agents read to decide whether to use your skill.

### Frontmatter Rules

```yaml
---
name: your-skill-slug
description: >
  [Action verb] [what it does] via the Claw0x API. Use when [trigger phrase 1],
  [trigger phrase 2], or [trigger phrase 3]. [What it handles/returns].
  Even if the user [edge case phrasing], this skill applies.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
  version: "1.0.0"
---
```

**Description field rules (critical for triggering):**

- Start with an action verb: "Extract", "Rewrite", "Analyze", "Generate", "Validate"
- Include "via the Claw0x API" so agents know this is an API skill
- Add "Use when..." followed by 3-5 natural-language trigger phrases
- End with an edge-case catch: "Even if the user just says X, this skill applies"
- Target 30-50 words. Under 20 = agents miss it. Over 60 = agents get confused
- Be pushy — actively claim territory. "Use when users mention anything related to email validation, address checking, or deliverability" beats "Validates email addresses"

**Why pushy descriptions work:** Agents match skills by scanning descriptions against user intent. A conservative description only triggers on exact matches. A pushy description catches the long tail of how users actually phrase requests.

### Required Sections

Every SKILL.md must include these sections in order:

1. Title + one-line summary
2. How It Works — Under the Hood (explain the actual mechanism, not marketing)
3. Prerequisites (always CLAW0X_API_KEY; if free, say "No credit card required")
4. When to Use (4-6 concrete scenarios)
5. Input (table: Field, Type, Required, Description)
6. Output (exact JSON with realistic values)
7. Example (complete input/output pair with real data)
8. Error Codes (400, 401, 500 with triggers)
9. Pricing (per-call price or "Free")

### Writing Style

- Explain the why, not just the what
- Show real examples, never placeholder data
- Be specific about limitations
- Keep it under 500 lines
- Use tables for structured data
## Stage 3: Write the handler.ts

The handler is a Vercel serverless function. Every handler follows the same skeleton.

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware } from '../../lib/auth';
import { validateInput } from '../../lib/validation';
import { successResponse, errorResponse } from '../../lib/response';

async function handler(req: VercelRequest, res: VercelResponse) {
  const validation = validateInput(req.body, {
    input: { type: 'object', required: true },
  });
  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { input } = validation.data!;
  const startTime = Date.now();

  try {
    const result = doSomething(input);
    return successResponse(res, {
      ...result,
      _meta: { skill: 'your-slug', latency_ms: Date.now() - startTime, version: '1.0.0' },
    });
  } catch (error: any) {
    return errorResponse(res, 'Processing failed', 500, error.message);
  }
}

export default authMiddleware(handler);
```

**Key rules:** Always use `authMiddleware` (validates API key). Always return `_meta` (Gateway uses it for billing). Import from `../../lib/`. Handle errors explicitly — 400 for bad input, 500 for internal failures.

For API Wrapper skills, add upstream API calls inside the handler. The caller never sees the upstream key — that is the whole point of the Gateway model.

## Stage 4: Register and Deploy

1. **Seed script** — Create `app/seed-{slug}.mjs` to insert the skill into the database. Must fill all required fields including `delivery_mode: 'both'`.
2. **Run seed + security scan** (mandatory):
   ```
   node seed-your-slug.mjs
   node scan-skill-security.mjs your-slug
   ```
3. **Deploy** — Push the skills repo to trigger Vercel auto-deploy.
4. **Verify** — Test via Gateway:
   ```bash
   curl -X POST https://api.claw0x.com/v1/call \
     -H "Authorization: Bearer $CLAW0X_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"skill": "your-slug", "input": {"action": "..."}}'
   ```

Security scan is a hard prerequisite. No skill goes live without it.

## Stage 5: Test and Iterate

1. Write 5 prompts that SHOULD trigger the skill
2. Write 5 prompts that SHOULD NOT trigger the skill
3. Use the `generate-tests` action to get a starting set
4. If triggering accuracy < 80%, use `optimize-description` to rewrite the description

### Quality Checklist

- [ ] SKILL.md has all required sections
- [ ] Description is 30-50 words with "Use when..." phrasing
- [ ] API call uses `https://api.claw0x.com/v1/call`
- [ ] Input table documents every field
- [ ] Output shows real JSON, not placeholders
- [ ] handler.ts uses `authMiddleware` and returns `_meta`
- [ ] Security scan passed
- [ ] Gateway test returns 200

---

## Prerequisites

A valid Claw0x API key (`CLAW0X_API_KEY`). Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard.

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

No credit card or wallet balance needed — this skill is free.

## When to Use

- Creating a new skill from scratch (SKILL.md + handler.ts)
- Improving or editing an existing skill's documentation
- Evaluating skill quality before deployment
- Optimizing a skill's description for better agent triggering
- Generating test prompts to validate skill behavior
- Auditing a skill against Claw0x platform standards
## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | One of: `create`, `improve`, `evaluate`, `optimize-description`, `generate-tests` |
| `intent` | string | Yes (create) | What the skill should do — one clear sentence |
| `skill_md` | string | Yes (improve/evaluate/optimize/tests) | Existing SKILL.md content |
| `output_format` | string | No | `markdown` (default) or `json` |
| `context` | object | No | Additional context: `target_tools` (string[]), `complexity` (low/medium/high), `domain` (string) |
| `feedback` | string | No (improve) | Specific feedback on what to change |
| `num_tests` | number | No (generate-tests) | Number of test cases per category (default: 3) |

## Actions

### `create` — Generate a new skill from intent

Takes a one-sentence intent and produces a complete SKILL.md draft with proper frontmatter, all required sections, and a handler.ts skeleton. Also runs an auto-evaluation and returns improvement suggestions.

### `improve` — Refine an existing skill

Takes existing SKILL.md content and optional feedback. Auto-fixes structural issues (missing frontmatter, missing sections, missing CLAW0X_API_KEY declaration). Returns before/after quality scores.

### `evaluate` — Score skill quality

Analyzes a SKILL.md across four dimensions: completeness, clarity, triggering quality, and structure. Returns scores 0-1 per dimension plus actionable issues and suggestions.

### `optimize-description` — Improve triggering accuracy

Analyzes the frontmatter `description` field and rewrites it for better agent triggering. Checks word count, "Use when" phrasing, action verbs, and edge-case coverage.

### `generate-tests` — Create test prompts

Generates realistic test prompts: should-trigger (direct mentions, synonyms, complex queries) and should-not-trigger (unrelated domains, similar-but-wrong tasks).

## Output

### `create` response

```json
{
  "action": "create",
  "name": "PDF Data Extractor",
  "slug": "pdf-data-extractor",
  "skill_md": "---\nname: pdf-data-extractor\ndescription: Extract structured data...\n---\n\n# PDF Data Extractor\n...",
  "handler_skeleton": "import { VercelRequest, VercelResponse } from '@vercel/node';\n...",
  "evaluation": {
    "completeness": 0.85,
    "clarity": 0.9,
    "triggering_quality": 0.8
  },
  "suggestions": [
    "Add error handling for corrupt PDFs",
    "Include example output with realistic invoice data"
  ],
  "_meta": { "skill": "skill-creator", "version": "1.0.0", "latency_ms": 42 }
}
```

### `evaluate` response

```json
{
  "action": "evaluate",
  "scores": {
    "completeness": 0.8,
    "clarity": 0.7,
    "triggering_quality": 0.6,
    "structure": 0.9,
    "overall": 0.75
  },
  "issues": ["Missing section: Error Codes", "Description too short for reliable triggering"],
  "suggestions": ["Add Use when phrasing to description", "Include action verbs"],
  "_meta": { "skill": "skill-creator", "version": "1.0.0", "latency_ms": 15 }
}
```

## Example — Create Action

**Request:**
```json
{
  "skill": "skill-creator",
  "input": {
    "action": "create",
    "intent": "I want a skill that validates email addresses and checks deliverability",
    "context": { "target_tools": ["Bash"], "complexity": "low" }
  }
}
```

**Response includes:** a complete SKILL.md with pushy description, all required sections, a handler.ts skeleton, quality scores, and improvement suggestions. Then use `evaluate` to score it, `optimize-description` to improve triggering, and `generate-tests` to create validation prompts.

## Error Codes

| Code | Meaning | When |
|------|---------|------|
| `400` | Invalid input | Missing required fields, unknown action |
| `401` | Unauthorized | Invalid or missing API key |
| `500` | Processing failed | Internal error (not billed) |

## Pricing

**Free.** This is a pure logic skill with no upstream API costs. Only your Claw0x API key is needed.