import { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware } from '../../lib/auth';
import { validateInput } from '../../lib/validation';
import { successResponse, errorResponse } from '../../lib/response';

/**
 * skill-scout — Agent Skill Discovery & Recommendation
 *
 * Helps AI agents discover, evaluate, and recommend skills from multiple
 * curated sources: the Claw0x catalog, Anthropic's official skills repo,
 * and the VoltAgent awesome-openclaw-skills collection.
 *
 * Differentiation from raw "find-skills":
 * - Returns structured, agent-consumable results (not CLI output)
 * - Includes Claw0x-native skills with pricing & trust metadata
 * - Aggregates skills from ClawHub, GitHub/anthropics, and GitHub/VoltAgent
 * - Ranks results by relevance score
 *
 * Type: Pure logic (no external API dependency)
 * Source: https://clawhub.ai/JimLiuxinghai/find-skills
 * License: MIT
 */

// ─── Claw0x Native Skill Registry ───────────────────────────

interface CatalogSkill {
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  price_per_call: number;
  is_free: boolean;
  trust_score: number;
  install_cmd: string;
  api_call: string;
}

const CLAW0X_CATALOG: CatalogSkill[] = [
  { name: 'Tavily Search', slug: 'tavily-search', description: 'LLM-optimized web search with AI answer summaries. Ideal for RAG pipelines and real-time info retrieval.', category: 'Search', tags: ['web-search', 'rag', 'research', 'real-time', 'news', 'llm-tool'], price_per_call: 0, is_free: true, trust_score: 92, install_cmd: 'npx claw0x add tavily-search', api_call: 'POST /v1/call { "skill": "tavily-search", "input": { "query": "..." } }' },
  { name: 'Web Scraper', slug: 'scrape', description: 'Extract structured data (title, headings, links, images) from any URL.', category: 'Data Extraction', tags: ['scrape', 'web', 'html', 'extract', 'crawl'], price_per_call: 0.01, is_free: false, trust_score: 88, install_cmd: 'npx claw0x add scrape', api_call: 'POST /v1/call { "skill": "scrape", "input": { "url": "..." } }' },
  { name: 'Email Validator', slug: 'validate-email', description: 'Validate email format, domain MX records, and risk scoring.', category: 'Validation', tags: ['email', 'validate', 'risk', 'verification'], price_per_call: 0.005, is_free: false, trust_score: 90, install_cmd: 'npx claw0x add validate-email', api_call: 'POST /v1/call { "skill": "validate-email", "input": { "email": "..." } }' },
  { name: 'Sentiment Analyzer', slug: 'sentiment', description: 'Analyze text sentiment with confidence scoring and word-level breakdown.', category: 'NLP', tags: ['sentiment', 'text', 'nlp', 'analysis', 'opinion'], price_per_call: 0.005, is_free: false, trust_score: 85, install_cmd: 'npx claw0x add sentiment', api_call: 'POST /v1/call { "skill": "sentiment", "input": { "text": "..." } }' },
  { name: 'PDF Parser', slug: 'parse-pdf', description: 'Extract text and metadata from PDF documents via URL.', category: 'Data Extraction', tags: ['pdf', 'parse', 'text', 'document', 'extract'], price_per_call: 0.01, is_free: false, trust_score: 82, install_cmd: 'npx claw0x add parse-pdf', api_call: 'POST /v1/call { "skill": "parse-pdf", "input": { "url": "..." } }' },
  { name: 'Translation', slug: 'translate', description: 'Translate text between 6+ languages with auto-detection.', category: 'NLP', tags: ['translate', 'language', 'i18n', 'multilingual', 'localization'], price_per_call: 0.01, is_free: false, trust_score: 78, install_cmd: 'npx claw0x add translate', api_call: 'POST /v1/call { "skill": "translate", "input": { "text": "...", "target": "es" } }' },
  { name: 'AgentMail', slug: 'agentmail', description: 'API-first email platform for AI agents. Create inboxes, send/receive emails programmatically.', category: 'Communication', tags: ['email', 'agent', 'api', 'communication', 'inbox'], price_per_call: 0.02, is_free: false, trust_score: 86, install_cmd: 'npx claw0x add agentmail', api_call: 'POST /v1/call { "skill": "agentmail", "input": { ... } }' },
  { name: 'Capability Evolver', slug: 'capability-evolver', description: 'Meta-skill for agent self-improvement via the GEP protocol. Analyzes runtime logs to propose code/memory updates.', category: 'Agent Infrastructure', tags: ['evolution', 'self-improvement', 'meta', 'gep-protocol', 'runtime'], price_per_call: 0.05, is_free: false, trust_score: 80, install_cmd: 'npx claw0x add capability-evolver', api_call: 'POST /v1/call { "skill": "capability-evolver", "input": { ... } }' },
  { name: 'Self-Improving Agent', slug: 'self-improving-agent', description: 'Capture learnings, errors, and corrections for continuous agent improvement.', category: 'Agent Infrastructure', tags: ['learning', 'correction', 'pattern', 'self-improvement', 'error-handling'], price_per_call: 0, is_free: true, trust_score: 78, install_cmd: 'npx claw0x add self-improving-agent', api_call: 'POST /v1/call { "skill": "self-improving-agent", "input": { "type": "error", "context": "...", "detail": "..." } }' },
  { name: 'Image Generator', slug: 'generate-image', description: 'Generate images from text prompts using AI models.', category: 'Creative', tags: ['image', 'generate', 'ai', 'creative', 'art'], price_per_call: 0.03, is_free: false, trust_score: 70, install_cmd: 'npx claw0x add generate-image', api_call: 'POST /v1/call { "skill": "generate-image", "input": { "prompt": "..." } }' },
  { name: 'Code Generator', slug: 'code-gen', description: 'Generate production-ready TypeScript skill code from descriptions and READMEs.', category: 'Developer Tools', tags: ['code', 'generate', 'typescript', 'serverless', 'automation'], price_per_call: 0.02, is_free: false, trust_score: 84, install_cmd: 'npx claw0x add code-gen', api_call: 'POST /v1/call { "skill": "code-gen", "input": { "slug": "...", "name": "...", "description": "..." } }' },
  { name: 'Article Humanizer', slug: 'humanizer', description: 'Transform AI-generated text into natural, human-sounding writing.', category: 'NLP', tags: ['humanize', 'rewrite', 'ai-detection', 'content', 'writing'], price_per_call: 0.01, is_free: false, trust_score: 82, install_cmd: 'npx claw0x add humanizer', api_call: 'POST /v1/call { "skill": "humanizer", "input": { "text": "..." } }' },
];

// ─── Community Skills Registry (ClawHub + Anthropic + Awesome OpenClaw) ──

interface CommunitySkill {
  name: string;
  source: string;
  description: string;
  category: string;
  tags: string[];
  install_cmd: string;
  browse_url: string;
}

const COMMUNITY_SKILLS: CommunitySkill[] = [
  // Anthropic Skills (https://github.com/anthropics/skills)
  { name: 'Claude Code Review', source: 'anthropics/skills', description: 'Automated code review powered by Claude. Detects bugs, security issues, and suggests improvements.', category: 'Developer Tools', tags: ['code-review', 'claude', 'security', 'quality', 'anthropic'], install_cmd: 'npx claw0x add anthropics/skills@code-review', browse_url: 'https://github.com/anthropics/skills' },
  { name: 'Claude Research', source: 'anthropics/skills', description: 'Deep research skill for Claude agents. Synthesizes information from multiple sources into structured reports.', category: 'Research', tags: ['research', 'synthesis', 'report', 'claude', 'anthropic'], install_cmd: 'npx claw0x add anthropics/skills@research', browse_url: 'https://github.com/anthropics/skills' },
  { name: 'Claude Testing', source: 'anthropics/skills', description: 'Generate and run test suites with Claude. Supports unit, integration, and e2e test generation.', category: 'Testing', tags: ['testing', 'unit-test', 'e2e', 'automation', 'claude'], install_cmd: 'npx claw0x add anthropics/skills@testing', browse_url: 'https://github.com/anthropics/skills' },
  // Awesome OpenClaw Skills (https://github.com/VoltAgent/awesome-openclaw-skills)
  { name: 'Agent Memory', source: 'VoltAgent/awesome-openclaw-skills', description: 'Persistent memory layer for AI agents. Store, retrieve, and manage context across sessions.', category: 'Agent Infrastructure', tags: ['memory', 'context', 'persistence', 'agent', 'session'], install_cmd: 'npx claw0x add VoltAgent/awesome-openclaw-skills@agent-memory', browse_url: 'https://github.com/VoltAgent/awesome-openclaw-skills' },
  { name: 'Tool Router', source: 'VoltAgent/awesome-openclaw-skills', description: 'Intelligent tool routing for multi-agent systems. Routes tasks to the best available skill.', category: 'Agent Infrastructure', tags: ['routing', 'multi-agent', 'orchestration', 'tool', 'dispatch'], install_cmd: 'npx claw0x add VoltAgent/awesome-openclaw-skills@tool-router', browse_url: 'https://github.com/VoltAgent/awesome-openclaw-skills' },
  { name: 'Data Pipeline', source: 'VoltAgent/awesome-openclaw-skills', description: 'Build and run ETL data pipelines with agent-friendly APIs. Transform, validate, and load data.', category: 'Data Extraction', tags: ['etl', 'pipeline', 'data', 'transform', 'automation'], install_cmd: 'npx claw0x add VoltAgent/awesome-openclaw-skills@data-pipeline', browse_url: 'https://github.com/VoltAgent/awesome-openclaw-skills' },
  { name: 'Webhook Manager', source: 'VoltAgent/awesome-openclaw-skills', description: 'Create, manage, and monitor webhooks for agent event-driven workflows.', category: 'Communication', tags: ['webhook', 'event', 'notification', 'integration', 'automation'], install_cmd: 'npx claw0x add VoltAgent/awesome-openclaw-skills@webhook-manager', browse_url: 'https://github.com/VoltAgent/awesome-openclaw-skills' },
  // ClawHub community submissions (https://clawhub.ai/)
  { name: 'Find Skills', source: 'clawhub.ai/JimLiuxinghai', description: 'Discover and install skills from the open agent skills ecosystem. Search by keyword, category, or task.', category: 'Developer Tools', tags: ['discovery', 'search', 'install', 'skills', 'ecosystem'], install_cmd: 'npx claw0x add JimLiuxinghai/find-skills', browse_url: 'https://clawhub.ai/JimLiuxinghai/find-skills' },
];

// ─── Search & Ranking Logic ─────────────────────────────────

interface SearchResult {
  name: string;
  description: string;
  category: string;
  tags: string[];
  relevance_score: number;
  source: 'claw0x' | 'community';
  install_cmd: string;
  pricing?: { price_per_call: number; is_free: boolean };
  trust_score?: number;
  api_call?: string;
  browse_url?: string;
}

function computeRelevance(query: string, name: string, description: string, tags: string[], category: string): number {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 1);
  let score = 0;

  // Exact name match
  if (name.toLowerCase().includes(q)) score += 50;

  // Tag match (strongest signal)
  for (const term of terms) {
    if (tags.some(t => t.includes(term))) score += 30;
  }

  // Category match
  if (category.toLowerCase().includes(q)) score += 20;
  for (const term of terms) {
    if (category.toLowerCase().includes(term)) score += 15;
  }

  // Description match
  for (const term of terms) {
    if (description.toLowerCase().includes(term)) score += 10;
  }

  return Math.min(100, score);
}

function searchAll(query?: string, category?: string, source?: string, limit: number = 10): SearchResult[] {
  const results: SearchResult[] = [];

  // Search Claw0x catalog
  if (!source || source === 'claw0x' || source === 'all') {
    for (const s of CLAW0X_CATALOG) {
      const relevance = query ? computeRelevance(query, s.name, s.description, s.tags, s.category) : 50;
      if (relevance > 0 || !query) {
        if (category && !s.category.toLowerCase().includes(category.toLowerCase())) continue;
        results.push({
          name: s.name,
          description: s.description,
          category: s.category,
          tags: s.tags,
          relevance_score: relevance,
          source: 'claw0x',
          install_cmd: s.install_cmd,
          pricing: { price_per_call: s.price_per_call, is_free: s.is_free },
          trust_score: s.trust_score,
          api_call: s.api_call,
        });
      }
    }
  }

  // Search community skills
  if (!source || source === 'community' || source === 'all') {
    for (const s of COMMUNITY_SKILLS) {
      const relevance = query ? computeRelevance(query, s.name, s.description, s.tags, s.category) : 50;
      if (relevance > 0 || !query) {
        if (category && !s.category.toLowerCase().includes(category.toLowerCase())) continue;
        results.push({
          name: s.name,
          description: s.description,
          category: s.category,
          tags: s.tags,
          relevance_score: relevance,
          source: 'community',
          install_cmd: s.install_cmd,
          browse_url: s.browse_url,
        });
      }
    }
  }

  // Sort by relevance, then by trust score for ties
  results.sort((a, b) => {
    if (b.relevance_score !== a.relevance_score) return b.relevance_score - a.relevance_score;
    return (b.trust_score || 0) - (a.trust_score || 0);
  });

  return results.slice(0, Math.min(limit, 50));
}

function getCategories(): { name: string; claw0x_count: number; community_count: number }[] {
  const cats: Record<string, { claw0x: number; community: number }> = {};

  for (const s of CLAW0X_CATALOG) {
    if (!cats[s.category]) cats[s.category] = { claw0x: 0, community: 0 };
    cats[s.category].claw0x++;
  }
  for (const s of COMMUNITY_SKILLS) {
    if (!cats[s.category]) cats[s.category] = { claw0x: 0, community: 0 };
    cats[s.category].community++;
  }

  return Object.entries(cats)
    .map(([name, c]) => ({ name, claw0x_count: c.claw0x, community_count: c.community }))
    .sort((a, b) => (b.claw0x_count + b.community_count) - (a.claw0x_count + a.community_count));
}

// ─── Handler ─────────────────────────────────────────────────

async function handler(req: VercelRequest, res: VercelResponse) {
  const validation = validateInput(req.body, {
    input: { type: 'object', required: true },
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { input } = validation.data!;

  try {
    const startTime = Date.now();

    const query = input.query as string | undefined;
    const category = input.category as string | undefined;
    const source = input.source as string | undefined; // 'claw0x' | 'community' | 'all'
    const limit = typeof input.limit === 'number' ? input.limit : 10;
    const action = input.action as string | undefined; // 'search' | 'categories' | 'recommend'

    let result: any;

    if (action === 'categories') {
      result = {
        categories: getCategories(),
        total_claw0x: CLAW0X_CATALOG.length,
        total_community: COMMUNITY_SKILLS.length,
      };
    } else if (action === 'recommend' && query) {
      // Recommendation mode: return top 3 with install instructions
      const matches = searchAll(query, category, source, 3);
      result = {
        recommendation: matches.length > 0
          ? `Found ${matches.length} skill(s) for "${query}". Top pick: ${matches[0].name} (${matches[0].source}).`
          : `No skills found for "${query}". Try broader terms or browse categories.`,
        skills: matches,
        install_hint: matches.length > 0 ? matches[0].install_cmd : 'npx claw0x search ' + (query || ''),
        query,
      };
    } else {
      // Default: search mode
      const matches = searchAll(query, category, source, limit);
      result = {
        skills: matches,
        total: matches.length,
        catalog_size: { claw0x: CLAW0X_CATALOG.length, community: COMMUNITY_SKILLS.length },
        query: query || null,
        category: category || null,
        source: source || 'all',
      };
    }

    const latencyMs = Date.now() - startTime;

    return successResponse(res, {
      ...result,
      _meta: {
        skill: 'skill-scout',
        latency_ms: latencyMs,
        source_ref: 'https://clawhub.ai/JimLiuxinghai/find-skills',
        ecosystem: 'https://clawhub.ai',
      },
    });
  } catch (error: any) {
    console.error('[skill-scout] Error:', error.message);
    return errorResponse(res, 'Skill discovery failed', 500, error.message);
  }
}

export default authMiddleware(handler);
