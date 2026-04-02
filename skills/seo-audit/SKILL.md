---
name: "SEO Audit"
slug: "seo-audit"
description: >
  Audit web pages for P0 SEO compliance. Use when developers need to validate 
  server-side metadata, image alt tags, keyword density, FAQ sections, and 
  breadcrumb navigation before publishing. Handles Next.js App Router pages 
  and returns actionable fix recommendations.
category: "SEO & Analytics"
tags: ["seo", "audit", "metadata", "structured-data", "accessibility"]
price_per_call: 0
---

# SEO Audit

**Local skill by [Claw0x](https://claw0x.com)** — runs entirely in your OpenClaw agent.

> **Runs locally.** No external API calls, no API key required. Complete privacy.

## What It Does

Audits web pages and code files for P0 SEO compliance based on Google's official guidelines and professional commercial SEO standards. Checks:

- **P0-1**: Server-side metadata generation (not client-side)
- **P0-2**: Image alt tags (accessibility + SEO)
- **P0-3**: Homepage keyword density (3-5 occurrences)
- **P0-4**: FAQ section with structured data
- **P0-5**: Breadcrumb navigation with structured data

Returns a detailed report with pass/fail status and actionable fix recommendations.

## Quick Reference

| When This Happens | Do This | What You Get |
|-------------------|---------|--------------|
| Before publishing a new page | Audit page file | P0 compliance report with fixes |
| Before deploying to production | Audit all pages | Batch validation results |
| After updating metadata | Audit specific page | Verify fixes applied correctly |
| Creating new skill detail page | Audit skill page | Ensure SEO requirements met |

## 5-Minute Quickstart

### Step 1: Install (30 seconds)
```bash
openclaw skill add seo-audit
```

### Step 2: Audit a Single Page (1 minute)
```typescript
const result = await agent.run('seo-audit', {
  type: 'page',
  filePath: 'app/src/app/skills/[slug]/page.tsx',
  pageType: 'skill-detail'
});

console.log(result.summary);
// ✅ P0-1: Server-side metadata ✓
// ✅ P0-2: Image alt tags ✓
// ✅ P0-5: Breadcrumb navigation ✓
// Overall: 3/3 checks passed
```

### Step 3: Audit Multiple Pages (2 minutes)
```typescript
const result = await agent.run('seo-audit', {
  type: 'batch',
  pages: [
    { filePath: 'app/src/app/page.tsx', pageType: 'homepage' },
    { filePath: 'app/src/app/skills/[slug]/page.tsx', pageType: 'skill-detail' },
    { filePath: 'app/src/app/docs/page.tsx', pageType: 'docs' }
  ]
});

console.log(result.summary);
// Audited 3 pages
// ✅ 2 pages passed all checks
// ❌ 1 page has issues (see details)
```

### Step 4: Get Fix Recommendations (instant)
```typescript
if (!result.passed) {
  result.issues.forEach(issue => {
    console.log(`❌ ${issue.rule}: ${issue.message}`);
    console.log(`   Fix: ${issue.fix}`);
  });
}
```

## Real-World Use Cases

### Scenario 1: Pre-Deployment Validation
**Problem**: Need to ensure all pages meet SEO standards before deploying to production.

**Solution**: Run batch audit in CI/CD pipeline.

**Example**:
```typescript
// In your CI/CD script
const result = await agent.run('seo-audit', {
  type: 'batch',
  pages: [
    { filePath: 'app/src/app/page.tsx', pageType: 'homepage' },
    { filePath: 'app/src/app/skills/[slug]/page.tsx', pageType: 'skill-detail' }
  ],
  strict: true // Fail if any issues found
});

if (!result.passed) {
  console.error('SEO validation failed!');
  process.exit(1);
}
```

### Scenario 2: New Skill Page Validation
**Problem**: Created a new skill detail page and need to verify it meets all SEO requirements.

**Solution**: Audit the skill page before publishing.

**Example**:
```typescript
const result = await agent.run('seo-audit', {
  type: 'page',
  filePath: 'app/src/app/skills/email-validator/page.tsx',
  pageType: 'skill-detail',
  skillData: {
    name: 'Email Validator',
    category: 'Validation',
    description: 'Validate email addresses...'
  }
});

// Check specific requirements
if (result.checks.metadata.passed) {
  console.log('✅ Metadata is SEO-optimized');
}
if (result.checks.breadcrumb.passed) {
  console.log('✅ Breadcrumb navigation present');
}
```

### Scenario 3: Homepage Keyword Density Check
**Problem**: Updated homepage copy and need to verify keyword density is still optimal.

**Solution**: Audit homepage with keyword analysis.

**Example**:
```typescript
const result = await agent.run('seo-audit', {
  type: 'page',
  filePath: 'app/src/app/page.tsx',
  pageType: 'homepage',
  checkKeywords: true,
  targetKeywords: [
    { keyword: 'AI skills marketplace', target: [3, 5] },
    { keyword: 'developers', target: [3, 5] },
    { keyword: 'pay per call', target: [2, 3] }
  ]
});

result.keywordAnalysis.forEach(kw => {
  console.log(`${kw.keyword}: ${kw.count} occurrences (target: ${kw.target[0]}-${kw.target[1]})`);
  if (kw.count < kw.target[0]) {
    console.log(`  ⚠️  Add ${kw.target[0] - kw.count} more occurrences`);
  }
});
```

### Scenario 4: Automated Fix Application
**Problem**: Audit found issues and need to apply fixes automatically.

**Solution**: Use audit result to generate fix patches.

**Example**:
```typescript
const result = await agent.run('seo-audit', {
  type: 'page',
  filePath: 'app/src/app/skills/[slug]/page.tsx',
  pageType: 'skill-detail',
  generateFixes: true
});

if (!result.passed && result.fixes) {
  // Apply fixes automatically
  for (const fix of result.fixes) {
    console.log(`Applying fix: ${fix.description}`);
    await applyPatch(fix.filePath, fix.patch);
  }
  console.log('✅ All fixes applied');
}
```

## Integration Recipes

### OpenClaw Agent
```typescript
import { Claw0xClient } from '@claw0x/sdk';

const agent = new Claw0xClient();

// Audit before deployment
agent.onBeforeDeploy(async () => {
  const result = await agent.run('seo-audit', {
    type: 'batch',
    pages: getAllPages(),
    strict: true
  });
  
  if (!result.passed) {
    throw new Error('SEO validation failed');
  }
});
```

### LangChain Agent
```python
from langchain.agents import Tool
from claw0x import Claw0xClient

claw0x = Claw0xClient()

seo_audit_tool = Tool(
    name="seo_audit",
    func=lambda input: claw0x.call('seo-audit', input),
    description="Audit web pages for SEO compliance"
)

# Use in agent
result = agent.run("Audit the homepage for SEO issues")
```

### Custom Agent
```javascript
// In your build script
const { exec } = require('child_process');

exec('openclaw skill run seo-audit --input pages.json', (error, stdout) => {
  const result = JSON.parse(stdout);
  
  if (!result.passed) {
    console.error('SEO issues found:');
    result.issues.forEach(issue => console.error(`  - ${issue.message}`));
    process.exit(1);
  }
});
```

### GitHub Actions CI/CD
```yaml
# .github/workflows/seo-validation.yml
name: SEO Validation

on: [push, pull_request]

jobs:
  seo-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install OpenClaw
        run: npm install -g openclaw
      
      - name: Install SEO Audit Skill
        run: openclaw skill add seo-audit
      
      - name: Run SEO Audit
        run: |
          openclaw skill run seo-audit --input '{
            "type": "batch",
            "pages": [
              {"filePath": "app/src/app/page.tsx", "pageType": "homepage"},
              {"filePath": "app/src/app/skills/[slug]/page.tsx", "pageType": "skill-detail"}
            ],
            "strict": true
          }'
```

## Input Schema

```typescript
interface Input {
  // Audit type
  type: 'page' | 'batch';
  
  // For single page audit
  filePath?: string;
  pageType?: 'homepage' | 'skill-detail' | 'docs' | 'blog' | 'other';
  
  // For batch audit
  pages?: Array<{
    filePath: string;
    pageType: string;
  }>;
  
  // Optional: Skill data for validation
  skillData?: {
    name: string;
    category: string;
    description: string;
    slug?: string;
  };
  
  // Optional: Keyword analysis
  checkKeywords?: boolean;
  targetKeywords?: Array<{
    keyword: string;
    target: [number, number]; // [min, max] occurrences
  }>;
  
  // Optional: Generate fix patches
  generateFixes?: boolean;
  
  // Optional: Strict mode (fail on any issue)
  strict?: boolean;
}
```

## Output Schema

```typescript
interface Output {
  // Overall result
  passed: boolean;
  summary: string;
  
  // For single page audit
  checks?: {
    metadata: {
      passed: boolean;
      message: string;
      details?: any;
    };
    imageAlt: {
      passed: boolean;
      message: string;
      missingAlt?: string[];
    };
    keywords?: {
      passed: boolean;
      message: string;
      analysis?: Array<{
        keyword: string;
        count: number;
        target: [number, number];
        status: 'ok' | 'low' | 'high';
      }>;
    };
    faq?: {
      passed: boolean;
      message: string;
    };
    breadcrumb?: {
      passed: boolean;
      message: string;
    };
  };
  
  // For batch audit
  results?: Array<{
    filePath: string;
    passed: boolean;
    issues: string[];
  }>;
  
  // Issues found
  issues: Array<{
    rule: string; // P0-1, P0-2, etc.
    severity: 'error' | 'warning';
    message: string;
    fix: string; // How to fix
    location?: {
      file: string;
      line?: number;
    };
  }>;
  
  // Optional: Fix patches
  fixes?: Array<{
    filePath: string;
    description: string;
    patch: string; // Diff format
  }>;
  
  // Metadata
  _meta: {
    skill: 'seo-audit';
    version: '1.0.0';
    auditedAt: string;
    pagesAudited: number;
    issuesFound: number;
  };
}
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `File not found` | Invalid filePath | Check file path is correct and relative to project root |
| `Invalid page type` | Unknown pageType | Use: homepage, skill-detail, docs, blog, or other |
| `Parse error` | Invalid TypeScript/JSX | Fix syntax errors in the file first |
| `Missing required field` | Input validation failed | Check input schema and provide all required fields |

## Validation Rules

### P0-1: Server-Side Metadata

**Pass Criteria**:
- Page exports `generateMetadata()` function
- No client-side metadata updates (`useEffect` + `document.title`)
- Metadata includes: title, description, openGraph, twitter, canonical

**Fail Examples**:
```typescript
// ❌ Client-side metadata
useEffect(() => {
  document.title = 'My Page';
}, []);
```

### P0-2: Image Alt Tags

**Pass Criteria**:
- All `<img>` tags have `alt` attribute
- All `<Image>` components have `alt` prop
- Alt text is descriptive (not empty or generic)

**Fail Examples**:
```tsx
// ❌ Missing alt
<img src="/logo.png" />

// ❌ Generic alt
<img src="/icon.png" alt="icon" />
```

### P0-3: Keyword Density

**Pass Criteria**:
- Each target keyword appears within specified range
- Keywords used naturally (no stuffing)
- Keywords in H1, H2, and body text

**Fail Examples**:
```tsx
// ❌ Keyword stuffing
<h1>AI Skills Marketplace - Best AI Skills Marketplace</h1>

// ❌ No keywords
<h1>The Platform</h1>
```

### P0-4: FAQ Section

**Pass Criteria** (Homepage only):
- FAQ component imported and used
- FAQPage structured data present
- Minimum 8 questions

**Fail Examples**:
```tsx
// ❌ No FAQ section on homepage
<section>...</section>
// Missing <FAQ /> component
```

### P0-5: Breadcrumb Navigation

**Pass Criteria** (Detail pages only):
- Breadcrumb component imported and used
- BreadcrumbList structured data present
- Shows full path (Home > Category > Page)

**Fail Examples**:
```tsx
// ❌ No breadcrumb on detail page
<div>
  <h1>{skill.name}</h1>
</div>
```

## Pricing

**FREE.** No charge per call.

- Requires no API key
- No usage charges (price_per_call = 0)
- Unlimited audits
- Runs entirely locally

## Performance

- **Latency**: <100ms per page (local processing)
- **Batch**: ~50ms per page (parallel processing)
- **Memory**: <50MB for typical audits
- **File size**: Handles files up to 1MB

## Limitations

- Only audits TypeScript/JSX files (Next.js App Router)
- Does not audit rendered HTML (use browser tools for that)
- Keyword analysis is case-insensitive
- Does not validate structured data syntax (use Google's tool)

## Best Practices

1. **Run in CI/CD**: Automate audits before deployment
2. **Audit early**: Check pages during development, not after
3. **Fix immediately**: Don't accumulate SEO debt
4. **Batch audit**: Check all pages at once for consistency
5. **Monitor keywords**: Re-audit after content updates

## About Claw0x

This skill is provided by [Claw0x](https://claw0x.com), the native skills layer for AI agents.

**Cloud version available**: For users who need centralized reporting and team collaboration, a cloud version is available at [claw0x.com/skills/seo-audit](https://claw0x.com/skills/seo-audit).

**GitHub**: [github.com/claw0x/seo-audit](https://github.com/claw0x/seo-audit)

**Explore more skills**: [claw0x.com/skills](https://claw0x.com/skills)
