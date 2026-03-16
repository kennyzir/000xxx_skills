import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
const pdf = require('pdf-parse');
import { authMiddleware } from '../lib/auth';
import { validateInput } from '../lib/validation';
import { successResponse, errorResponse } from '../lib/response';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate input
  const validation = validateInput(req.body, {
    pdf_url: { type: 'string', required: true, min: 10, max: 2000 }
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { pdf_url } = validation.data!;

  try {
    // Download PDF
    const response = await axios.get(pdf_url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024, // 10MB limit
      headers: {
        'User-Agent': 'Claw0x-PDFParser/1.0'
      }
    });

    // Parse PDF
    const data = await pdf(response.data);

    // Extract structured information
    const result = {
      text: data.text,
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      version: data.version,
      word_count: data.text.split(/\s+/).length,
      char_count: data.text.length,
      preview: data.text.slice(0, 500) + (data.text.length > 500 ? '...' : '')
    };

    return successResponse(res, result);
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return errorResponse(res, 'PDF download timeout', 408);
    }
    
    if (error.response?.status === 404) {
      return errorResponse(res, 'PDF not found', 404);
    }

    return errorResponse(
      res, 
      'Failed to parse PDF', 
      500,
      error.message
    );
  }
}

export default authMiddleware(handler);
