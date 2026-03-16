import { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware } from '../lib/auth';
import { validateInput } from '../lib/validation';
import { successResponse, errorResponse } from '../lib/response';

// Simple translation dictionary for demo
// In production, use Google Translate API or similar
const TRANSLATIONS: Record<string, Record<string, string>> = {
  'hello': {
    'es': 'hola',
    'fr': 'bonjour',
    'de': 'hallo',
    'zh': '你好',
    'ja': 'こんにちは',
    'ko': '안녕하세요'
  },
  'goodbye': {
    'es': 'adiós',
    'fr': 'au revoir',
    'de': 'auf wiedersehen',
    'zh': '再见',
    'ja': 'さようなら',
    'ko': '안녕히 가세요'
  },
  'thank you': {
    'es': 'gracias',
    'fr': 'merci',
    'de': 'danke',
    'zh': '谢谢',
    'ja': 'ありがとう',
    'ko': '감사합니다'
  }
};

async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate input
  const validation = validateInput(req.body, {
    text: { type: 'string', required: true, min: 1, max: 5000 },
    target_lang: { type: 'string', required: true, min: 2, max: 5 }
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { text, target_lang } = validation.data!;

  try {
    // Simple demo translation
    const lowerText = text.toLowerCase().trim();
    const translation = TRANSLATIONS[lowerText]?.[target_lang];

    if (translation) {
      const result = {
        translated_text: translation,
        source_text: text,
        source_lang: 'en',
        target_lang: target_lang,
        confidence: 0.95,
        method: 'dictionary',
        note: 'Demo translation. Integrate Google Translate API for production.'
      };
      return successResponse(res, result);
    }

    // Fallback: return original text with note
    const result = {
      translated_text: text,
      source_text: text,
      source_lang: 'auto',
      target_lang: target_lang,
      confidence: 0.0,
      method: 'passthrough',
      note: 'Translation not available in demo mode. Integrate Google Translate API for production.',
      supported_phrases: Object.keys(TRANSLATIONS)
    };

    return successResponse(res, result);
  } catch (error: any) {
    console.error('Translation error:', error);
    return errorResponse(
      res, 
      'Failed to translate text', 
      500,
      error.message
    );
  }
}

export default authMiddleware(handler);
