/**
 * Tests for error messages utility
 */

import { ERROR_MESSAGES, getErrorMessage, getUserFriendlyError } from '../error-messages';

describe('Error Messages', () => {
  describe('ERROR_MESSAGES', () => {
    it('should have all required error messages', () => {
      expect(ERROR_MESSAGES.CAMERA_NOT_READY).toBe('Camera not ready');
      expect(ERROR_MESSAGES.CAMERA_PERMISSION_DENIED).toBe('Camera permission denied. Please allow camera access in your browser settings.');
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBe('Network connection failed. Please check your internet connection and try again.');
      expect(ERROR_MESSAGES.SERVER_ERROR).toBe('Server internal error. Please try again later.');
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error message for valid key', () => {
      expect(getErrorMessage('CAMERA_NOT_READY')).toBe('Camera not ready');
      expect(getErrorMessage('NETWORK_ERROR')).toBe('Network connection failed. Please check your internet connection and try again.');
    });
  });

  describe('getUserFriendlyError', () => {
    it('should map network errors correctly', () => {
      const networkError = new Error('Failed to fetch');
      expect(getUserFriendlyError(networkError)).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('should map server errors correctly', () => {
      const serverError = new Error('API error: 500');
      expect(getUserFriendlyError(serverError)).toBe(ERROR_MESSAGES.SERVER_ERROR);
    });

    it('should map camera permission errors correctly', () => {
      const permissionError = new Error('NotAllowedError');
      expect(getUserFriendlyError(permissionError)).toBe(ERROR_MESSAGES.CAMERA_PERMISSION_DENIED);
    });

    it('should return original message for unmapped errors', () => {
      const customError = new Error('Custom error message');
      expect(getUserFriendlyError(customError)).toBe('Custom error message');
    });

    it('should handle string errors', () => {
      expect(getUserFriendlyError('String error')).toBe('String error');
    });

    it('should return unknown error for empty messages', () => {
      expect(getUserFriendlyError('')).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });
});
