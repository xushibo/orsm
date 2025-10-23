/**
 * Centralized error messages
 * Provides consistent error messages across the application
 */

export const ERROR_MESSAGES = {
  // Camera related errors
  CAMERA_NOT_READY: 'Camera not ready',
  CAMERA_PERMISSION_DENIED: 'Camera permission denied. Please allow camera access in your browser settings.',
  CAMERA_NOT_FOUND: 'No camera found on this device',
  CAMERA_IN_USE: 'Camera is already in use by another application',
  CAMERA_CONSTRAINTS_NOT_SUPPORTED: 'Camera constraints not supported by this device',
  
  // Image processing errors
  INVALID_IMAGE_QUALITY: 'Invalid image quality',
  IMAGE_TOO_SMALL: 'Image is too small. Please take a clearer photo.',
  IMAGE_TOO_LARGE: 'Image file too large. Maximum size is 10MB.',
  INVALID_IMAGE_FORMAT: 'Invalid image format. Please upload an image.',
  
  // API errors
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection and try again.',
  SERVER_ERROR: 'Server internal error. Please try again later.',
  API_TIMEOUT: 'Request timeout. Please try again.',
  API_RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  
  // Recognition errors
  RECOGNITION_FAILED: 'Recognition failed. Please try with a different photo.',
  NO_OBJECT_IDENTIFIED: 'I\'m sorry, but I couldn\'t clearly identify what\'s in this picture. Please try taking a clearer photo with better lighting and make sure the object is clearly visible.',
  
  // General errors
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
  INVALID_REQUEST: 'Invalid request. Please try again.',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  
  // User-friendly messages
  LOADING: 'AI is analyzing your image...',
  PROCESSING: 'Processing your image...',
  SUCCESS: 'Recognition successful!',
} as const;

export type ErrorKey = keyof typeof ERROR_MESSAGES;

/**
 * Get error message by key
 */
export function getErrorMessage(key: ErrorKey): string {
  return ERROR_MESSAGES[key];
}

/**
 * Get user-friendly error message for display
 */
export function getUserFriendlyError(error: Error | string): string {
  const errorMessage = error instanceof Error ? error.message : error;
  
  // Map common error patterns to user-friendly messages
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (errorMessage.includes('API error: 500')) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  if (errorMessage.includes('API error: 400')) {
    return ERROR_MESSAGES.INVALID_IMAGE_FORMAT;
  }
  
  if (errorMessage.includes('API error: 413')) {
    return ERROR_MESSAGES.IMAGE_TOO_LARGE;
  }
  
  if (errorMessage.includes('timeout')) {
    return ERROR_MESSAGES.API_TIMEOUT;
  }
  
  if (errorMessage.includes('NotAllowedError')) {
    return ERROR_MESSAGES.CAMERA_PERMISSION_DENIED;
  }
  
  if (errorMessage.includes('NotFoundError')) {
    return ERROR_MESSAGES.CAMERA_NOT_FOUND;
  }
  
  if (errorMessage.includes('NotReadableError')) {
    return ERROR_MESSAGES.CAMERA_IN_USE;
  }
  
  if (errorMessage.includes('OverconstrainedError')) {
    return ERROR_MESSAGES.CAMERA_CONSTRAINTS_NOT_SUPPORTED;
  }
  
  return errorMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
}
