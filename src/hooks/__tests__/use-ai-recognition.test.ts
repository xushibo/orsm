/**
 * Tests for AI recognition hook
 */

import { renderHook, act } from '@testing-library/react';
import { useAIRecognition } from '../use-ai-recognition';

// Mock API config
jest.mock('@/src/config/api', () => ({
  API_CONFIG: {
    baseUrl: 'http://localhost:3001',
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('useAIRecognition', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should initialize with not recognizing', () => {
    const { result } = renderHook(() => useAIRecognition());
    
    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should recognize image successfully', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const mockResponse = {
      word: 'cat',
      story: 'A cute cat is sitting quietly.',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useAIRecognition());

    await act(async () => {
      const recognitionResult = await result.current.recognizeImage(mockBlob);
      expect(recognitionResult).toEqual(mockResponse);
    });

    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001', {
      method: 'POST',
      body: expect.any(FormData),
    });
  });

  it('should handle API error', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error'),
    });

    const { result } = renderHook(() => useAIRecognition());

    await act(async () => {
      await expect(result.current.recognizeImage(mockBlob)).rejects.toThrow('API error: 500 - Server error');
    });

    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBe('API error: 500 - Server error');
  });

  it('should handle invalid image size', async () => {
    const mockBlob = new Blob(['x'], { type: 'image/jpeg' }); // Very small blob

    const { result } = renderHook(() => useAIRecognition());

    await act(async () => {
      await expect(result.current.recognizeImage(mockBlob)).rejects.toThrow('Image too small (< 1KB)');
    });

    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBe('Image too small (< 1KB)');
  });

  it('should handle invalid image format', async () => {
    const mockBlob = new Blob(['test'], { type: 'text/plain' });

    const { result } = renderHook(() => useAIRecognition());

    await act(async () => {
      await expect(result.current.recognizeImage(mockBlob)).rejects.toThrow('Invalid image format');
    });

    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBe('Invalid image format');
  });

  it('should handle invalid API response format', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invalid: 'response' }),
    });

    const { result } = renderHook(() => useAIRecognition());

    await act(async () => {
      await expect(result.current.recognizeImage(mockBlob)).rejects.toThrow('Invalid API response format');
    });

    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBe('Invalid API response format');
  });

  it('should retry on failure with custom options', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'cat', story: 'A cat story' }),
      });

    const { result } = renderHook(() => useAIRecognition({
      maxRetries: 2,
      retryDelay: 100,
    }));

    await act(async () => {
      const recognitionResult = await result.current.recognizeImage(mockBlob);
      expect(recognitionResult).toEqual({ word: 'cat', story: 'A cat story' });
    });

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(result.current.isRecognizing).toBe(false);
  });
});
