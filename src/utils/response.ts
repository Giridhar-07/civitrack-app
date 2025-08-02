import { Response } from 'express';

// Standard response format
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | string[];
}

// Success response
export const successResponse = <T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

// Error response
export const errorResponse = (res: Response, message: string = 'An error occurred', statusCode: number = 500, errors?: string | string[]): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: errors,
  };
  return res.status(statusCode).json(response);
};

// Not found response
export const notFoundResponse = (res: Response, message: string = 'Resource not found'): Response => {
  return errorResponse(res, message, 404);
};

// Bad request response
export const badRequestResponse = (res: Response, message: string = 'Bad request', errors?: string | string[]): Response => {
  return errorResponse(res, message, 400, errors);
};

// Unauthorized response
export const unauthorizedResponse = (res: Response, message: string = 'Unauthorized'): Response => {
  return errorResponse(res, message, 401);
};

// Forbidden response
export const forbiddenResponse = (res: Response, message: string = 'Forbidden'): Response => {
  return errorResponse(res, message, 403);
};