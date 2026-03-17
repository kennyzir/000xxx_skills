import { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware } from '../../lib/auth';
import { validateInput } from '../../lib/validation';
import { successResponse, errorResponse } from '../../lib/response';

/**
 * awesome-openclaw-skills — Pure Logic Skill (Discovery & Search)
 * Search and discover from 5,400+ curated OpenClaw skills.
 * Filter by category, use case, or keyword.
 *
 * 类型: 纯逻辑处理 (无外部 API 依赖)
 * 标签: search, discovery, skills, openclaw, catalog, registry
 * 来源: https://github.com/VoltAgent/awesome-openclaw-skills
 * License: MIT
 */

// ─── Skill Catalog (curated subset for fast search) ─────────

interface SkillEntry {
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  repo_url: string;
  is_free: boolean;
}

// Top curated skills from the OpenClaw registry
// In production, this would be loaded from a JSON file or database
const SKILL_CATALOG: SkillEntry[] = [
  { name: 'AgentMail', slug: 'agentmail', description: 'API-first email platform for AI agents', category: 'Communication', tags: ['email', 'agent', 'api'], repo_url: 'https://github.com/openclaw/skills', is_free: false },
  { name: 'Capability Evolver', slug: 'capability-evolver', description: 'Meta-skill for agent self-improvement via GEP protocol', category: 'Agent Infrastructure', tags: ['evolution', 'self-improvement', 'meta'], repo_url: 'https://github.com/EvoMap/evolver', is_free: false },
  { name: 'Self-Improving Agent', slug: 'self-improving-agent', description: 'Capture learnings, errors, and corrections for continuous improvement', category: 'Agent Infrastructure', tags: ['learning', 'correction', 'pattern'], repo_url: 'https://github.com/pskoett/pskoett-ai-skills', is_free: true },
  { name: 'Web Scraper', slug: 'scrape', description: 'Extract structured data from any URL', category: 'Data Extraction', tags: ['scrape', 'web', 'html', 'extract'], repo_url: 'https://github.com/kennyzir/000xxx_skills', is_free: false },
  { name: 'Email Validator', slug: 'validate-email', description: 'Validate email format, domain, and risk scoring', category: 'Validation', tags: ['email', 'validate', 'risk'], repo_url: 'https://github.com/kennyzir/000xxx_skills', is_free: false },
  { name: 'Sentiment Analyzer', slug: 'sentiment', description: 'Analyze text sentiment with confidence scoring', category: 'NLP', tags: ['sentiment', 'text', 'nlp', 'analysis'], repo_url: 'https://github.com/kennyzir/000xxx_skills', is_free: false },
  { name: 'PDF Parser', slug: 'parse-pdf', description: 'Extract text and metadata from PDF documents', category: 'Data Extraction', tags: ['pdf', 'parse', 'text', 'document'], repo_url: 'https://github.com/kennyzir/000xxx_skills', is_free: false },
  { name: 'Translation', slug: 'translate', description: 'Translate text between 6+ languages', category: 'NLP', tags: ['translate', 'language', 'i18n', 'multilingual'], repo_url: 'https://github.com/kennyzir/000xxx_skills', is_free: false },
  { name: 'Image Generator', slug: 'generate-image', description: 'Generate images from text prompts', category: 'Creative', tags: ['image', 'generate', 'ai', 'creative'], repo_url: 'https://github.com/kennyzir/000xxx_skills', is_free: false },
  { name: 'Skills Archive', slug: 'skills', description: 'Archive of all ClawHub skill versions', category: 'Developer Tools', tags: ['archive', 'backup', 'metadata'], repo_url: 'https://github.com/openclaw/skills', is_free: true },
];

// ─── Search Logic ────────────────────────────────────────────

function searchSkills(query?: string, category?: string, limit: number = 20): { skills: SkillEntry[]; total: number } {
  let results = [...SKILL_CATALOG];

  // Filter by category
  if (category) {
    const cat = category.toLowerCase();
    results = results.filter(s => s.category.toLowerCase().includes(cat));
  }

  // Filter by keyword search
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some(t => t.includes(q)) ||
      s.category.toLowerCase().includes(q)
    );
  }

  const total = results.length;
  results = results.slice(0, Math.min(limit, 100));

  return { skills: results, total };
}

function getCategories(): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const s of SKILL_CATALOG) {
    counts[s.category] = (counts[s.category] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Handler ─────────────────────────────────────────────────

async function handler(req: VercelRequest, res: VercelResponse) {
  const validation = validateInput(req.body, {
    input: { type: 'object', required: true }
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { input } = validation.data!;

  try {
    const startTime = Date.now();

    const query = input.query as string | undefined;
    const category = input.category as string | undefined;
    const limit = typeof input.limit === 'number' ? input.limit : 20;
    const action = input.action as string | undefined;

    let result: any;

    if (action === 'categories') {
      result = { categories: getCategories(), total_skills: SKILL_CATALOG.length };
    } else {
      const searchResult = searchSkills(query, category, limit);
      result = {
        skills: searchResult.skills,
        total: searchResult.total,
        catalog_size: SKILL_CATALOG.length,
        query: query || null,
        category: category || null,
      };
    }

    const latencyMs = Date.now() - startTime;

    return successResponse(res, {
      ...result,
      _meta: {
        skill: 'awesome-openclaw-skills',
        latency_ms: latencyMs,
        source: 'https://github.com/VoltAgent/awesome-openclaw-skills',
      }
    });
  } catch (error: any) {
    console.error('[awesome-openclaw-skills] Error:', error.message);
    return errorResponse(res, 'Search failed', 500, error.message);
  }
}

export default authMiddleware(handler);
