export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export function validateInput(
  input: any,
  schema: ValidationSchema
): { valid: boolean; errors: string[]; data?: any } {
  const errors: string[] = [];
  const data: any = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = input[field];

    // Check required
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`Field '${field}' is required`);
      continue;
    }

    // Skip if not required and not provided
    if (!rule.required && (value === undefined || value === null)) {
      continue;
    }

    // Check type
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rule.type) {
      errors.push(`Field '${field}' must be of type ${rule.type}`);
      continue;
    }

    // Check string constraints
    if (rule.type === 'string') {
      if (rule.min && value.length < rule.min) {
        errors.push(`Field '${field}' must be at least ${rule.min} characters`);
      }
      if (rule.max && value.length > rule.max) {
        errors.push(`Field '${field}' must be at most ${rule.max} characters`);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`Field '${field}' has invalid format`);
      }
    }

    // Check number constraints
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`Field '${field}' must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`Field '${field}' must be at most ${rule.max}`);
      }
    }

    data[field] = value;
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined
  };
}
