import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { authMiddleware } from '../../lib/auth';
import { validateInput } from '../../lib/validation';
import { successResponse, errorResponse } from '../../lib/response';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = 'https://api.tavily.com/search';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (!TAVILY_API_KEY) {
    return errorResponse(res, 'Tavily API key not configured', 500);
  }

  const validation = validateInput(req.body, {
    query: { type: 'string', required: true, min: 1, max: 400 },
    search_depth: { type: 'string', required: false },
    topic: { type: 'string', required: false },
    max_results: { type: 'number', required: false, min: 1, max: 20 },
    include_raw_content: { type: 'boolean', required: false },
    time_range: { type: 'string', required: false },
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const {
    query,
    search_depth = 'basic',
    topic = 'general',
    max_results = 5,
    include_raw_content = false,
    time_range,
  } = { ...req.body };

  // Validate enum values
  const validDepths = ['basic', 'advanced'];
  const validTopics = ['general', 'news'];
  const validTimeRanges = ['day', 'week', 'month', 'year'];

  if (!validDepths.includes(search_depth)) {
    return errorResponse(res, `search_depth must be one of: ${validDepths.join(', ')}`, 400);
  }
  if (!validTopics.includes(topic)) {
    return errorResponse(res, `topic must be one of: ${validTopics.join(', ')}`, 400);
  }
  if (time_range && !validTimeRanges.includes(time_range)) {
    return errorResponse(res, `time_range must be one of: ${validTimeRanges.join(', ')}`, 400);
  }

  try {
    const tavilyPayload: Record<string, any> = {
      api_key: TAVILY_API_KEY,
      query,
      search_depth,
      topic,
      max_results,
      include_raw_content,
      include_answer: true,
    };

    if (time_range) {
      tavilyPayload.time_range = time_range;
    }

    // Parse optional domain filters from body
    const { include_domains, exclude_domains } = req.body;
    if (Array.isArray(include_domains) && include_domains.length > 0) {
      tavilyPayload.include_domains = include_domains;
    }
    if (Array.isArray(exclude_domains) && exclude_domains.length > 0) {
      tavilyPayload.exclude_domains = exclude_domains;
    }

    const response = await axios.post(TAVILY_API_URL, tavilyPayload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    const { answer, results, response_time } = response.data;

    // Normalize results for LLM consumption
    const normalizedResults = (results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
      published_date: r.published_date || null,
      ...(include_raw_content && r.raw_content ? { raw_content: r.raw_content } : {}),
    }));

    return successResponse(res, {
      answer: answer || null,
      results: normalizedResults,
      result_count: normalizedResults.length,
      query,
      search_depth,
      response_time_ms: response_time ? Math.round(response_time * 1000) : null,
    });
  } catch (error: any) {
    console.error('Tavily search error:', error?.response?.data || error.message);

    if (error?.response?.status === 401) {
      return errorResponse(res, 'Tavily API authentication failed', 502);
    }
    if (error?.response?.status === 429) {
      return errorResponse(res, 'Tavily rate limit exceeded, try again later', 429);
    }

    return errorResponse(
      res,
      'Search failed',
      error?.response?.status || 500,
      error?.response?.data?.detail || error.message
    );
  }
}

export default authMiddleware(handler);
