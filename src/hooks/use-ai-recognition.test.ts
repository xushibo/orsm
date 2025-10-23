import { renderHook, waitFor } from '@testing-library/react';
import { useAIRecognition } from './use-ai-recognition';

// Mock the API config
jest.mock('@/src/config/api', () => ({
  API_CONFIG: {
    baseUrl: 'http://localhost:3001',
    timeout: 10000,
    retries: 3
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('useAIRecognition', () => {
  // Create a larger blob to pass size validation (1KB+)
  const mockImageData = new Array(1024).fill('fake image data').join('');
  const mockImageBlob = new Blob([mockImageData], { type: 'image/jpeg' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAIRecognition());
    
    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should start recognition when calling recognizeImage', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ word: 'apple', story: 'A red apple' })
    });

    const { result } = renderHook(() => useAIRecognition());
    
    expect(result.current.isRecognizing).toBe(false);
    
    const recognitionPromise = result.current.recognizeImage(mockImageBlob);
    
    // Should be recognizing immediately
    expect(result.current.isRecognizing).toBe(true);
    
    const recognitionResult = await recognitionPromise;
    
    // Should finish recognizing after promise resolves
    expect(result.current.isRecognizing).toBe(false);
    expect(recognitionResult).toEqual({ word: 'apple', story: 'A red apple' });
  });

  it('should handle API errors correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error')
    });

    const { result } = renderHook(() => useAIRecognition());
    
    await expect(result.current.recognizeImage(mockImageBlob)).rejects.toThrow('API error: 500 - Internal Server Error');
    
    await waitFor(() => {
      expect(result.current.isRecognizing).toBe(false);
      expect(result.current.error).toBe('API error: 500 - Internal Server Error');
    });
  });

  it('should handle network errors correctly', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAIRecognition());
    
    await expect(result.current.recognizeImage(mockImageBlob)).rejects.toThrow('Network error');
    
    await waitFor(() => {
      expect(result.current.isRecognizing).toBe(false);
      expect(result.current.error).toBe('Network error');
    });
  });

  it('should validate image size', async () => {
    const smallImageBlob = new Blob(['small'], { type: 'image/jpeg' });
    
    const { result } = renderHook(() => useAIRecognition());
    
    await expect(result.current.recognizeImage(smallImageBlob)).rejects.toThrow('Image too small (< 1KB)');
    
    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBe('Image too small (< 1KB)');
  });

  it('should validate image type', async () => {
    const textBlob = new Blob(['text content'], { type: 'text/plain' });
    
    const { result } = renderHook(() => useAIRecognition());
    
    await expect(result.current.recognizeImage(textBlob)).rejects.toThrow('Invalid image format');
    
    expect(result.current.isRecognizing).toBe(false);
    expect(result.current.error).toBe('Invalid image format');
  });

  it('should retry on failure according to options', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockRejectedValueOnce(new Error('Second attempt failed'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'apple', story: 'A red apple' })
      });

    const { result } = renderHook(() => useAIRecognition({ maxRetries: 3, retryDelay: 10 }));
    
    const recognitionResult = await result.current.recognizeImage(mockImageBlob);
    
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(recognitionResult).toEqual({ word: 'apple', story: 'A red apple' });
  });
});