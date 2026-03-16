import { VercelResponse } from '@vercel/node';

export function successResponse(res: VercelResponse, data: any, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data
  });
}

export function errorResponse(
  res: VercelResponse, 
  error: string, 
  statusCode = 400,
  details?: any
) {
  res.status(statusCode).json({
    success: false,
    error,
    ...(details && { details })
  });
}
