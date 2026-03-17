import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { authMiddleware } from '../../lib/auth';
import { validateInput } from '../../lib/validation';
import { successResponse, errorResponse } from '../../lib/response';

/**
 * agentmail �?API Wrapper Skill
 * API-first email platform designed for AI agents. Create and manage dedicated ema
 * 
 * 类型: 包装上游 API (需要配�?AGENTMAIL_API_URL �?AGENTMAIL_API_KEY)
 * 标签: api, email, agent, ai, data, pdf, search, workflow
 * 来源: https://github.com/openclaw/skills/blob/main/skills/adboio/agentmail/SKILL.md
 */

async function handler(req: VercelRequest, res: VercelResponse) {
  // 输入验证
  const validation = validateInput(req.body, {
    input: { type: 'object', required: true }
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { input } = validation.data!;

  try {
    const apiUrl = process.env.AGENTMAIL_API_URL;
    const apiKey = process.env.AGENTMAIL_API_KEY;

    if (!apiUrl) {
      return errorResponse(res, 'AGENTMAIL_API_URL not configured', 500);
    }

    const startTime = Date.now();

    // 调用上游 API
    const response = await axios.post(apiUrl, input, {
      headers: {
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
        'Content-Type': 'application/json',
        'User-Agent': 'Claw0x-Skill/agentmail/1.0',
      },
      timeout: 30000,
    });

    const latencyMs = Date.now() - startTime;

    return successResponse(res, {
      ...response.data,
      _meta: {
        skill: 'agentmail',
        latency_ms: latencyMs,
        upstream_status: response.status,
      }
    });
  } catch (error: any) {
    console.error('[agentmail] Upstream API error:', error.message);

    if (error.code === 'ECONNABORTED') {
      return errorResponse(res, 'Upstream API timeout', 504);
    }
    if (error.response) {
      return errorResponse(
        res,
        `Upstream API error: ${error.response.status}`,
        502,
        error.response.data
      );
    }
    return errorResponse(res, 'Failed to call upstream API', 500, error.message);
  }
}

export default authMiddleware(handler);
