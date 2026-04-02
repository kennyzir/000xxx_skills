import { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface AuditInput {
  type: 'page' | 'batch';
  filePath?: string;
  pageType?: 'homepage' | 'skill-detail' | 'docs' | 'blog' | 'other';
  pages?: Array<{
    filePath: string;
    pageType: string;
  }>;
  skillData?: {
    name: string;
    category: string;
    description: string;
    slug?: string;
  };
  checkKeywords?: boolean;
  targetKeywords?: Array<{
    keyword: string;
    target: [number, number];
  }>;
  generateFixes?: boolean;
  strict?: boolean;
}

interface Issue {
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  fix: string;
  location?: {
    file: string;
    line?: number;
  };
}

interface CheckResult {
  passed: boolean;
  message: string;
  details?: any;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const input: AuditInput = req.body.input || req.body;

    // Validate input
    if (!input.type) {
      return res.status(400).json({ error: 'Missing required field: type' });
    }

    if (input.type === 'page' && !input.filePath) {
      return res.status(400).json({ error: 'Missing required field: filePath for page audit' });
    }

    if (input.type === 'batch' && (!input.pages || input.pages.length === 0)) {
      return res.status(400).json({ error: 'Missing required field: pages for batch audit' });
    }

    const startTime = Date.now();

    // Execute audit
    let result;
    if (input.type === 'page') {
      result = await auditSinglePage(input);
    } else {
      result = await auditBatchPages(input);
    }

    return res.status(200).json({
      ...result,
      _meta: {
        skill: 'seo-audit',
        version: '1.0.0',
        auditedAt: new Date().toISOString(),
        pagesAudited: input.type === 'page' ? 1 : input.pages!.length,
        issuesFound: result.issues.length,
        latency_ms: Date.now() - startTime
      }
    });
  } catch (error: any) {
    console.error('SEO Audit error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function auditSinglePage(input: AuditInput) {
  const issues: Issue[] = [];
  const checks: any = {};

  // Read file content
  const content = readFile(input.filePath!);
  if (!content) {
    throw new Error(`File not found: ${input.filePath}`);
  }

  // P0-1: Check server-side metadata
  checks.metadata = checkMetadata(content, input.filePath!);
  if (!checks.metadata.passed) {
    issues.push({
      rule: 'P0-1',
      severity: 'error',
      message: checks.metadata.message,
      fix: 'Add generateMetadata() function. See: .kiro/steering/seo-standards.md#p0-1',
      location: { file: input.filePath! }
    });
  }

  // P0-2: Check image alt tags
  checks.imageAlt = checkImageAlt(content, input.filePath!);
  if (!checks.imageAlt.passed) {
    issues.push({
      rule: 'P0-2',
      severity: 'error',
      message: checks.imageAlt.message,
      fix: 'Add descriptive alt text to all images. See: .kiro/steering/seo-standards.md#p0-2',
      location: { file: input.filePath! }
    });
  }

  // P0-3: Check keyword density (homepage only)
  if (input.pageType === 'homepage' && input.checkKeywords) {
    checks.keywords = checkKeywordDensity(content, input.targetKeywords || getDefaultKeywords());
    if (!checks.keywords.passed) {
      issues.push({
        rule: 'P0-3',
        severity: 'warning',
        message: checks.keywords.message,
        fix: 'Adjust keyword occurrences to target range. See: .kiro/steering/seo-standards.md#p0-3',
        location: { file: input.filePath! }
      });
    }
  }

  // P0-4: Check FAQ section (homepage only)
  if (input.pageType === 'homepage') {
    checks.faq = checkFAQ(content, input.filePath!);
    if (!checks.faq.passed) {
      issues.push({
        rule: 'P0-4',
        severity: 'error',
        message: checks.faq.message,
        fix: 'Add FAQ component with FAQPage structured data. See: .kiro/steering/seo-standards.md#p0-4',
        location: { file: input.filePath! }
      });
    }
  }

  // P0-5: Check breadcrumb (detail pages only)
  if (['skill-detail', 'docs', 'blog'].includes(input.pageType || '')) {
    checks.breadcrumb = checkBreadcrumb(content, input.filePath!);
    if (!checks.breadcrumb.passed) {
      issues.push({
        rule: 'P0-5',
        severity: 'error',
        message: checks.breadcrumb.message,
        fix: 'Add Breadcrumb component with BreadcrumbList structured data. See: .kiro/steering/seo-standards.md#p0-5',
        location: { file: input.filePath! }
      });
    }
  }

  const passed = issues.filter(i => i.severity === 'error').length === 0;
  const summary = generateSummary(checks, issues, input.pageType);

  return {
    passed,
    summary,
    checks,
    issues
  };
}

async function auditBatchPages(input: AuditInput) {
  const results = [];
  const allIssues: Issue[] = [];

  for (const page of input.pages!) {
    try {
      const pageResult = await auditSinglePage({
        type: 'page',
        filePath: page.filePath,
        pageType: page.pageType as any,
        checkKeywords: input.checkKeywords,
        targetKeywords: input.targetKeywords
      });

      results.push({
        filePath: page.filePath,
        passed: pageResult.passed,
        issues: pageResult.issues.map(i => i.message)
      });

      allIssues.push(...pageResult.issues);
    } catch (error: any) {
      results.push({
        filePath: page.filePath,
        passed: false,
        issues: [error.message]
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const passed = input.strict ? passedCount === totalCount : allIssues.filter(i => i.severity === 'error').length === 0;

  const summary = `Audited ${totalCount} pages\n✅ ${passedCount} pages passed all checks\n❌ ${totalCount - passedCount} pages have issues`;

  return {
    passed,
    summary,
    results,
    issues: allIssues
  };
}

function readFile(filePath: string): string | null {
  try {
    // Try relative to project root
    if (existsSync(filePath)) {
      return readFileSync(filePath, 'utf-8');
    }

    // Try with common prefixes
    const prefixes = ['', 'app/', 'src/'];
    for (const prefix of prefixes) {
      const fullPath = join(process.cwd(), prefix, filePath);
      if (existsSync(fullPath)) {
        return readFileSync(fullPath, 'utf-8');
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

function checkMetadata(content: string, filePath: string): CheckResult {
  // Check for generateMetadata function
  const hasGenerateMetadata = content.includes('generateMetadata');
  
  // Check for client-side metadata (bad practice)
  const hasClientSideMetadata = 
    content.includes('useEffect') && 
    (content.includes('document.title') || content.includes('document.querySelector'));

  if (hasClientSideMetadata && !hasGenerateMetadata) {
    return {
      passed: false,
      message: 'Uses client-side metadata (useEffect). Must use generateMetadata()',
      details: { hasGenerateMetadata, hasClientSideMetadata }
    };
  }

  if (!hasGenerateMetadata && filePath.includes('app/src/app/')) {
    return {
      passed: false,
      message: 'Missing generateMetadata() function for server-side metadata',
      details: { hasGenerateMetadata }
    };
  }

  return {
    passed: true,
    message: 'Server-side metadata generation ✓',
    details: { hasGenerateMetadata }
  };
}

function checkImageAlt(content: string, filePath: string): CheckResult {
  const missingAlt: string[] = [];

  // Check <img> tags
  const imgMatches = content.match(/<img[^>]*>/g) || [];
  for (const img of imgMatches) {
    if (!img.includes('alt=')) {
      missingAlt.push(img.slice(0, 60) + '...');
    } else {
      // Check for empty or generic alt
      const altMatch = img.match(/alt=["']([^"']*)["']/);
      if (altMatch && (!altMatch[1] || ['icon', 'image', 'img'].includes(altMatch[1].toLowerCase()))) {
        missingAlt.push(img.slice(0, 60) + '... (empty or generic alt)');
      }
    }
  }

  // Check <Image> components
  const imageMatches = content.match(/<Image[^>]*>/g) || [];
  for (const img of imageMatches) {
    if (!img.includes('alt=')) {
      missingAlt.push(img.slice(0, 60) + '...');
    }
  }

  if (missingAlt.length > 0) {
    return {
      passed: false,
      message: `Found ${missingAlt.length} images without proper alt text`,
      details: { missingAlt }
    };
  }

  return {
    passed: true,
    message: 'All images have descriptive alt text ✓',
    details: { imagesChecked: imgMatches.length + imageMatches.length }
  };
}

function checkKeywordDensity(content: string, targetKeywords: Array<{ keyword: string; target: [number, number] }>): CheckResult {
  const analysis = targetKeywords.map(({ keyword, target }) => {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = content.match(regex) || [];
    const count = matches.length;
    const [min, max] = target;

    let status: 'ok' | 'low' | 'high';
    if (count < min) status = 'low';
    else if (count > max) status = 'high';
    else status = 'ok';

    return { keyword, count, target, status };
  });

  const issues = analysis.filter(a => a.status !== 'ok');
  const passed = issues.length === 0;

  const message = passed
    ? 'All keywords at target density ✓'
    : `${issues.length} keywords outside target range: ${issues.map(i => `${i.keyword} (${i.count}/${i.target[0]}-${i.target[1]})`).join(', ')}`;

  return {
    passed,
    message,
    details: { analysis }
  };
}

function checkFAQ(content: string, filePath: string): CheckResult {
  const hasFAQComponent = content.includes('<FAQ') || content.includes('FAQ()');
  const hasFAQSchema = content.includes('FAQPage');

  if (!hasFAQComponent) {
    return {
      passed: false,
      message: 'Missing FAQ component on homepage',
      details: { hasFAQComponent, hasFAQSchema }
    };
  }

  if (!hasFAQSchema) {
    return {
      passed: false,
      message: 'FAQ component present but missing FAQPage structured data',
      details: { hasFAQComponent, hasFAQSchema }
    };
  }

  return {
    passed: true,
    message: 'FAQ section with structured data ✓',
    details: { hasFAQComponent, hasFAQSchema }
  };
}

function checkBreadcrumb(content: string, filePath: string): CheckResult {
  const hasBreadcrumbComponent = content.includes('<Breadcrumb') || content.includes('Breadcrumb(');
  const hasBreadcrumbSchema = content.includes('BreadcrumbList');

  if (!hasBreadcrumbComponent) {
    return {
      passed: false,
      message: 'Missing Breadcrumb component on detail page',
      details: { hasBreadcrumbComponent, hasBreadcrumbSchema }
    };
  }

  if (!hasBreadcrumbSchema) {
    return {
      passed: false,
      message: 'Breadcrumb component present but missing BreadcrumbList structured data',
      details: { hasBreadcrumbComponent, hasBreadcrumbSchema }
    };
  }

  return {
    passed: true,
    message: 'Breadcrumb navigation with structured data ✓',
    details: { hasBreadcrumbComponent, hasBreadcrumbSchema }
  };
}

function getDefaultKeywords() {
  return [
    { keyword: 'AI skills marketplace', target: [3, 5] as [number, number] },
    { keyword: 'developers', target: [3, 5] as [number, number] },
    { keyword: 'pay per call', target: [2, 3] as [number, number] }
  ];
}

function generateSummary(checks: any, issues: Issue[], pageType?: string): string {
  const lines: string[] = [];
  
  Object.entries(checks).forEach(([key, check]: [string, any]) => {
    const icon = check.passed ? '✅' : '❌';
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    lines.push(`${icon} ${label}: ${check.message}`);
  });

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  lines.push('');
  if (errorCount === 0 && warningCount === 0) {
    lines.push('✅ All P0 SEO requirements met!');
  } else {
    lines.push(`Found ${errorCount} errors and ${warningCount} warnings`);
  }

  return lines.join('\n');
}
