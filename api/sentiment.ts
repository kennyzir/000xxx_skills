import { VercelRequest, VercelResponse } from '@vercel/node';
const Sentiment = require('sentiment');
import { authMiddleware } from '../lib/auth';
import { validateInput } from '../lib/validation';
import { successResponse, errorResponse } from '../lib/response';

const sentiment = new Sentiment();

async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate input
  const validation = validateInput(req.body, {
    text: { type: 'string', required: true, min: 1, max: 10000 }
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { text } = validation.data!;

  try {
    // Analyze sentiment
    const analysis = sentiment.analyze(text);

    // Determine sentiment label
    let label: string;
    if (analysis.score > 2) {
      label = 'very positive';
    } else if (analysis.score > 0) {
      label = 'positive';
    } else if (analysis.score === 0) {
      label = 'neutral';
    } else if (analysis.score > -2) {
      label = 'negative';
    } else {
      label = 'very negative';
    }

    // Calculate confidence (0-100)
    const confidence = Math.min(100, Math.abs(analysis.score) * 10);

    const result = {
      sentiment: label,
      score: analysis.score,
      comparative: analysis.comparative,
      confidence: Math.round(confidence),
      tokens: analysis.tokens.length,
      positive_words: analysis.positive,
      negative_words: analysis.negative,
      analysis: {
        positive_count: analysis.positive.length,
        negative_count: analysis.negative.length,
        word_count: analysis.tokens.length
      }
    };

    return successResponse(res, result);
  } catch (error: any) {
    console.error('Sentiment analysis error:', error);
    return errorResponse(
      res, 
      'Failed to analyze sentiment', 
      500,
      error.message
    );
  }
}

export default authMiddleware(handler);
