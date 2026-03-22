---
name: Browser Operator
description: >
  Run structured browser workflows on modern websites. Use when a page requires
  JavaScript rendering, multi-step interaction, waits, screenshots, or rendered
  content extraction that plain HTTP scraping cannot handle.
metadata:
  requires:
    env:
      - CLAW0X_API_KEY
---

# Browser Operator

Browser Operator is a browser execution layer for agents. It opens a live page, renders the UI, identifies actionable elements, performs bounded steps, and returns structured output.

> **Free during validation.** This skill is currently free to use while we validate the workflow model.

## Quick Reference

| When This Happens | Do This | What You Get |
|-------------------|---------|--------------|
| Page needs JavaScript | Use browser-operator | Fully rendered content |
| Need to click buttons | Add `click` step | Interaction result |
| Form submission required | Use `fill` + `click` steps | Form submission result |
| Content loads async | Add `wait` step | Loaded content |
| Need visual proof | Add `screenshot` step | PNG screenshot |
| Multi-step workflow | Chain steps | Complete workflow result |

**Why browser-based?** Plain HTTP can't handle JavaScript, dynamic content, or user interactions. Browser Operator executes real browser workflows.

---

## 5-Minute Quickstart

### Step 1: Get API Key (30 seconds)
Sign up at [claw0x.com](https://claw0x.com) → Dashboard → Create API Key

### Step 2: Run Your First Workflow (2 minutes)
```bash
curl -X POST https://api.claw0x.com/v1/call \
  -H "Authorization: Bearer ck_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "browser-operator",
    "input": {
      "url": "https://example.com",
      "steps": [
        {"type": "snapshot"},
        {"type": "extract", "mode": "text", "selector": "main"}
      ]
    }
  }'
```

### Step 3: Get Structured Result (instant)
```json
{
  "final_url": "https://example.com",
  "final_title": "Example Domain",
  "steps": [
    {"type": "snapshot", "elements": [...]},
    {"type": "extract", "result": "This domain is for use in illustrative examples..."}
  ]
}
```

### Step 4: Build Complex Workflows (2 minutes)
```javascript
// Login workflow
const result = await claw0x.call('browser-operator', {
  url: 'https://app.example.com/login',
  steps: [
    { type: 'fill', selector: 'input[name=email]', value: 'user@example.com' },
    { type: 'fill', selector: 'input[name=password]', value: 'password' },
    { type: 'click', selector: 'button[type=submit]' },
    { type: 'wait', until: 'url', value: '/dashboard' },
    { type: 'extract', mode: 'text', selector: '.welcome-message' }
  ]
});
```

**Done.** You can now automate any browser workflow.

---

## Why This Exists

Some websites are easy to scrape with a simple HTTP request. Others are not. They need JavaScript, button clicks, typed input, waits, or visual confirmation.

That is the gap this skill fills.

## Core Model

The core value is not simply launching a browser. The core value is turning a messy live page into a controlled action loop:

1. Render the page
2. Discover visible elements
3. Execute a small set of actions
4. Wait for UI state to settle
5. Return structured results

## Use Cases

- Fill and submit forms
- Log into internal dashboards
- Check whether a workflow completed
- Extract text after client-side rendering
- Capture screenshots after a sequence of actions
- Navigate portals where links and buttons appear only after page hydration

---

## Real-World Use Cases

### Scenario 1: Automated Form Submission
**Problem**: Your agent needs to submit forms on websites that require JavaScript

**Solution**:
1. Use browser-operator to render the page
2. Fill form fields with `fill` steps
3. Click submit button
4. Wait for confirmation page
5. Extract success message

**Example**:
```typescript
const result = await claw0x.call('browser-operator', {
  url: 'https://forms.example.com/contact',
  steps: [
    { type: 'fill', selector: '#name', value: 'John Doe' },
    { type: 'fill', selector: '#email', value: 'john@example.com' },
    { type: 'fill', selector: '#message', value: 'Hello from agent' },
    { type: 'click', selector: 'button[type=submit]' },
    { type: 'wait', until: 'selector', value: '.success-message' },
    { type: 'extract', mode: 'text', selector: '.success-message' }
  ]
});
// Result: "Thank you! Your message has been sent."
```

### Scenario 2: Dashboard Monitoring
**Problem**: Need to check status on internal dashboard that requires login

**Solution**:
1. Login with credentials
2. Navigate to status page
3. Extract current status
4. Return structured data
5. Alert if status changes

**Example**:
```python
def check_dashboard_status():
    result = client.call("browser-operator", {
        "url": "https://internal.company.com/login",
        "steps": [
            {"type": "fill", "selector": "#username", "value": "bot@company.com"},
            {"type": "fill", "selector": "#password", "value": os.getenv("DASHBOARD_PASSWORD")},
            {"type": "click", "selector": "button.login"},
            {"type": "wait", "until": "url", "value": "/dashboard"},
            {"type": "extract", "mode": "text", "selector": ".status-indicator"}
        ]
    })
    
    status = result["steps"][-1]["result"]
    if status != "All systems operational":
        alert_team(status)
    
    return status
# Result: Automated 24/7 monitoring without manual login
```

### Scenario 3: Screenshot-Based Verification
**Problem**: Need visual proof that a workflow completed successfully

**Solution**:
1. Execute workflow steps
2. Capture screenshot at key points
3. Store screenshots for audit trail
4. Verify UI state visually

**Example**:
```javascript
async function verifyDeployment(appUrl) {
  const result = await claw0x.call('browser-operator', {
    url: appUrl,
    steps: [
      { type: 'wait', until: 'selector', value: '.app-loaded' },
      { type: 'screenshot' },
      { type: 'click', selector: 'button.test-feature' },
      { type: 'wait', until: 'selector', value: '.feature-active' },
      { type: 'screenshot' }
    ],
    capture_screenshot: true
  });
  
  // Store screenshots for audit
  await s3.upload('deployment-proof.png', result.screenshot);
  
  return result.steps.every(s => s.success);
}
// Result: Visual proof of successful deployment
```

### Scenario 4: Dynamic Content Extraction
**Problem**: Content only appears after JavaScript execution and user interaction

**Solution**:
1. Render page with JavaScript
2. Trigger content loading (scroll, click)
3. Wait for content to appear
4. Extract structured data
5. Return clean JSON

**Example**:
```typescript
// Extract product reviews that load on scroll
const result = await claw0x.call('browser-operator', {
  url: 'https://shop.example.com/product/123',
  steps: [
    { type: 'scroll', direction: 'down', amount: 500 },
    { type: 'wait', until: 'selector', value: '.review-item' },
    { type: 'extract', mode: 'text', selector: '.review-item', all: true }
  ]
});

const reviews = result.steps[2].result;
// Result: Array of review texts that weren't in initial HTML
```

---

## Integration Recipes

### OpenClaw Agent
```typescript
import { Claw0xClient } from '@claw0x/sdk';

const claw0x = new Claw0xClient(process.env.CLAW0X_API_KEY);

// Monitor dashboard status
agent.onSchedule('hourly', async () => {
  const result = await claw0x.call('browser-operator', {
    url: 'https://internal.company.com/status',
    steps: [
      { type: 'snapshot' },
      { type: 'extract', mode: 'text', selector: '.status' }
    ]
  });
  
  const status = result.steps[1].result;
  if (status.includes('error')) {
    await agent.alert('Dashboard shows error status');
  }
});
```

### LangChain Agent
```python
from claw0x import Claw0xClient
import os

client = Claw0xClient(api_key=os.getenv("CLAW0X_API_KEY"))

def extract_dynamic_content(url, selector):
    result = client.call("browser-operator", {
        "url": url,
        "steps": [
            {"type": "wait", "until": "selector", "value": selector},
            {"type": "extract", "mode": "text", "selector": selector}
        ]
    })
    
    return result["steps"][1]["result"]

# Use in chain
content = extract_dynamic_content("https://example.com", ".dynamic-content")
```

### Form Automation (Generic HTTP)
```javascript
async function submitForm(formData) {
  const response = await fetch('https://api.claw0x.com/v1/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLAW0X_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      skill: 'browser-operator',
      input: {
        url: 'https://forms.example.com/submit',
        steps: [
          { type: 'fill', selector: '#name', value: formData.name },
          { type: 'fill', selector: '#email', value: formData.email },
          { type: 'click', selector: 'button[type=submit]' },
          { type: 'wait', until: 'selector', value: '.success' },
          { type: 'extract', mode: 'text', selector: '.success' }
        ]
      }
    })
  });
  
  const result = await response.json();
  return result.steps[4].result; // Success message
}
```

### Batch Monitoring
```typescript
// Monitor multiple dashboards
const dashboards = [
  'https://status.service1.com',
  'https://status.service2.com',
  'https://status.service3.com'
];

const results = await Promise.all(
  dashboards.map(url =>
    claw0x.call('browser-operator', {
      url,
      steps: [
        { type: 'extract', mode: 'text', selector: '.status-indicator' }
      ]
    })
  )
);

// Check for issues
const issues = results.filter((r, i) => 
  r.steps[0].result.includes('down') || r.steps[0].result.includes('error')
);

if (issues.length > 0) {
  await alertTeam(`${issues.length} services have issues`);
}
```

---

## Use Cases

## Inputs

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Starting URL |
| `steps` | array | Ordered browser steps |
| `viewport` | object | Optional browser viewport |
| `user_agent` | string | Optional user agent override |
| `return_snapshot` | boolean | Return a final actionable element map |
| `capture_screenshot` | boolean | Return a final screenshot |
| `timeout_ms` | number | Global timeout hint |

## Step Types

- `snapshot`
- `click`
- `fill`
- `type`
- `select`
- `press`
- `wait`
- `extract`
- `scroll`
- `screenshot`

## Example

```json
{
  "input": {
    "url": "https://example.com/login",
    "steps": [
      { "type": "snapshot" },
      { "type": "fill", "selector": "input[name=email]", "value": "ops@example.com" },
      { "type": "fill", "selector": "input[name=password]", "value": "demo-password" },
      { "type": "click", "selector": "button[type=submit]" },
      { "type": "wait", "until": "url", "value": "/dashboard" },
      { "type": "extract", "mode": "text", "selector": "main" }
    ]
  }
}
```

## Output Shape

- Final URL
- Final title
- Per-step results
- Optional final snapshot
- Optional screenshot
- Metadata such as latency and step count

## Guidance

- Keep workflows bounded
- Re-snapshot after major UI changes
- Prefer explicit selectors or fresh refs
- Use waits when navigation or async loading is expected
- Avoid sensitive sites unless you trust the workflow and storage path

## Pricing

Free during validation.


---

## Browser Automation vs HTTP Scraping: Which is Right for You?

| Feature | HTTP Scraping (curl, requests) | Browser Operator |
|---------|--------------------------------|------------------|
| **Setup Time** | Instant | 2 minutes (get API key) |
| **JavaScript Support** | ❌ No | ✅ Full rendering |
| **User Interactions** | ❌ No | ✅ Click, fill, type |
| **Dynamic Content** | ❌ Only initial HTML | ✅ Waits for async loads |
| **Screenshots** | ❌ No | ✅ Visual capture |
| **Speed** | Fast (100-500ms) | Slower (2-10s) |
| **Cost** | Free | Free (validation) |
| **Complexity** | Simple | Structured workflows |

### When to Use HTTP Scraping
- Static HTML pages
- Public APIs available
- Speed is critical
- Content in initial HTML

### When to Use Browser Operator
- JavaScript-rendered content
- Requires user interactions (click, fill)
- Multi-step workflows (login → navigate → extract)
- Need screenshots for verification
- Content loads asynchronously
- SPA (Single Page Applications)

---

## How It Fits Into Your Agent Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  Agent Automation Pipeline                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─ Task Planning
                            │  • Identify target website
                            │  • Define workflow steps
                            │
                            ├─ Browser Execution
                            │  POST /v1/call
                            │  {url, steps: [fill, click, wait, extract]}
                            │
                            ├─ Result Processing
                            │  • Parse extracted content
                            │  • Store screenshots
                            │  • Validate success
                            │
                            └─ Action
                               • Update database
                               • Send notifications
                               • Trigger next workflow
```

### Integration Points

1. **Form Automation** — Submit forms programmatically
2. **Dashboard Monitoring** — Check status pages
3. **Content Extraction** — Get JavaScript-rendered content
4. **Visual Verification** — Capture screenshots for proof
5. **Multi-Step Workflows** — Chain complex interactions

---

## Why Use This Via Claw0x?

### Unified Infrastructure
- **One API key** for all skills — no per-provider auth
- **Atomic billing** — pay per successful call, $0 on failure
- **Security scanned** — OSV.dev integration for all skills

### Browser-Optimized
- **Structured workflows** — Define steps as JSON, not code
- **Element discovery** — Automatic snapshot of actionable elements
- **Smart waits** — Wait for URL, selector, or timeout
- **Screenshot capture** — Visual proof of workflow completion

### Production-Ready
- **99.9% uptime** — reliable infrastructure
- **Headless browser** — No GUI overhead
- **Cloud-native** — works in Lambda, Cloud Run, containers
- **Bounded execution** — Timeouts prevent runaway workflows
