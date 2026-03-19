---
name: claw0x-code-gen
description: >
  Generate production-ready TypeScript serverless function code from a skill
  description via the Claw0x API. Use when the user asks to generate skill code,
  create a new API handler, scaffold a serverless function, or auto-generate
  backend code from a README or description. Powered by Gemini LLM.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Code Generator

Generate complete, deployable TypeScript serverless function code from a skill name, description, and optional README content.

## How It Works — Under the Hood

This skill takes a skill description (and optionally a README or source URL) and generates a complete, deployable TypeScript handler file. It uses Google's Gemini LLM to produce the code, then validates the output before returning it.

### Generation Pipeline

1. **Input assembly** — the skill combines your `slug`, `name`, `description`, and optional `readme_content` into a structured prompt. If `readme_content` is provided, it's truncated to ~6000 characters to stay within token limits while preserving the most useful context.

2. **Prompt engineering** — the assembled context is wrapped in a system prompt that instructs the LLM to:
   - Generate a single TypeScript file following the Claw0x skill handler pattern
   - Import from `../../lib/auth`, `../../lib/validation`, and `../../lib/response` (the shared utilities)
   - Use `authMiddleware` wrapper for authentication
   - Use `validateInput` for request body validation
   - Use `successResponse` / `errorResponse` for consistent JSON output
   - Include error handling with try/catch
   - Add JSDoc comments explaining the skill's purpose

3. **LLM generation** — the prompt is sent to Gemini (currently `gemini-3.1-flash-lite-preview`) with a temperature of 0.3 (low creativity, high consistency). The model generates the complete handler code.

4. **Structural validation** — the generated code is checked for:
   - Presence of required imports (`authMiddleware`, `validateInput`, etc.)
   - A default export wrapping the handler with `authMiddleware`
   - At least one `successResponse` call
   - At least one `errorResponse` call
   - No syntax-breaking patterns (unclosed brackets, missing semicolons)
   
   If validation fails, the skill returns a 422 error instead of broken code.

5. **Response** — the validated code is returned along with metadata (line count, whether it includes a fallback path).

### What the Generated Code Looks Like

Every generated handler follows this structure:

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware } from '../../lib/auth';
import { validateInput } from '../../lib/validation';
import { successResponse, errorResponse } from '../../lib/response';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Input validation
  const validation = validateInput(req.body, { /* schema */ });
  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  // Core logic
  try {
    const result = /* ... */;
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, 'Processing failed', 500);
  }
}

export default authMiddleware(handler);
```

This pattern ensures every generated skill is immediately deployable on Vercel, has authentication, input validation, and consistent error handling out of the box.

### When the LLM Adds a Fallback

If the skill description suggests it wraps an external API (detected via `needs_upstream_api: true` or keywords like "API", "upstream", "external"), the generator includes a deterministic fallback path — a simpler implementation that runs when the external API is unavailable. This follows the same dual-layer pattern used by the humanizer skill (LLM primary + regex fallback).

### Limitations

- **No runtime testing** — the generated code is structurally validated but not executed. It may have logical bugs that only surface at runtime.
- **Single-file only** — generates one handler file. If your skill needs multiple files (e.g., a separate data file or config), you'll need to add those manually.
- **TypeScript only** — the generator targets the Claw0x/Vercel TypeScript stack. No Python, Go, or other language support.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to Use

- User says "generate code for this skill", "create a handler for", "scaffold a serverless function"
- Agent pipeline needs to auto-generate skill implementations from descriptions
- User provides a README or description and wants working backend code
- Bootstrapping a new skill quickly before customizing the logic

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input.slug` | string | yes | URL-safe skill identifier |
| `input.name` | string | yes | Human-readable skill name |
| `input.description` | string | no | What the skill does |
| `input.readme_content` | string | no | README text to guide code generation (max ~6000 chars used) |
| `input.source_url` | string | no | Source repository URL for context |
| `input.topics` | string[] | no | Tags/topics for the skill |
| `input.needs_upstream_api` | boolean | no | Whether the skill wraps an external API |
| `input.evaluation_details` | object | no | AI evaluation notes and build recommendations |

## Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Complete TypeScript handler code, ready to deploy |
| `slug` | string | The skill slug |
| `lines` | number | Line count of generated code |
| `has_fallback` | boolean | Whether the code includes a deterministic fallback |

## Error Codes

- `400` — Missing required `input.slug` or `input.name`
- `422` — Generated code failed structural validation
- `502` — Upstream LLM API error (not billed)

## Pricing

$0.01 per successful call. Failed calls and 5xx errors are never charged.