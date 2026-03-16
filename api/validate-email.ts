import { VercelRequest, VercelResponse } from '@vercel/node';
import validator from 'validator';
import { authMiddleware } from '../lib/auth';
import { validateInput } from '../lib/validation';
import { successResponse, errorResponse } from '../lib/response';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate input
  const validation = validateInput(req.body, {
    email: { type: 'string', required: true, min: 3, max: 254 }
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { email } = validation.data!;

  try {
    // Basic email validation
    const isValid = validator.isEmail(email);

    // Extract domain
    const domain = email.split('@')[1];

    // Additional checks
    const checks = {
      format_valid: isValid,
      has_mx_record: null, // Would require DNS lookup
      is_disposable: validator.isEmail(email, { 
        allow_display_name: false,
        require_display_name: false,
        allow_utf8_local_part: true,
        require_tld: true
      }),
      domain: domain,
      local_part: email.split('@')[0]
    };

    const result = {
      valid: isValid,
      email: email.toLowerCase(),
      checks,
      risk_score: isValid ? 10 : 90, // Simple risk scoring
      suggestion: !isValid ? 'Please check the email format' : null
    };

    return successResponse(res, result);
  } catch (error: any) {
    console.error('Validation error:', error);
    return errorResponse(
      res, 
      'Failed to validate email', 
      500,
      error.message
    );
  }
}

export default authMiddleware(handler);
