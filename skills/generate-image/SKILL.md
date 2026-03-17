---
name: claw0x-generate-image
description: >
  Generate images from text prompts via the Claw0x API. Use when the user asks to
  create an image, generate a picture, make a visual, or produce artwork from a
  text description. Returns an image URL. Server-side generation — no local GPU needed.
allowed-tools: Bash(curl *)
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Image Generator

Generate images from text descriptions. Provide a prompt and get back an image URL.

## Prerequisites

Requires a Claw0x API key. Sign up at [claw0x.com](https://claw0x.com) and create a key in your dashboard. Set it as an environment variable:

```bash
export CLAW0X_API_KEY="your-api-key-here"
```

## When to use

- User says "generate an image of", "create a picture", "make me an image", "draw"
- Agent pipeline needs a visual asset generated from a description
- User wants a placeholder or concept image

## API call

```bash
curl -s -X POST https://claw0x.com/v1/call \
  -H "Authorization: Bearer $CLAW0X_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "generate-image",
    "input": {
      "prompt": "$ARGUMENTS"
    }
  }'
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | yes | Text description of the image to generate (3–1000 chars) |

## Output fields

| Field | Type | Description |
|-------|------|-------------|
| `image_url` | string | URL of the generated image |
| `prompt` | string | The prompt that was used |
| `size` | string | Image dimensions (e.g. `"512x512"`) |
| `format` | string | Image format (e.g. `"png"`) |
| `generated_at` | string | ISO timestamp of generation |

## Pricing

Pay-per-successful-call only. Failed calls and 5xx errors are free.
