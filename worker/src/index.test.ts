import { describe, it, expect, vi } from 'vitest';
import worker from './index';

// Mock fetch
global.fetch = vi.fn();

describe('ORSM AI Worker', () => {
  const mockEnv: any = {
    GEMINI_API_KEY: 'test-api-key'
  };

  const mockExecutionContext: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject non-POST requests', async () => {
    const request = new Request('https://example.com', { method: 'GET' });
    const response = await worker.fetch(request, mockEnv, mockExecutionContext);
    
    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.error).toBe('Method not allowed');
  });

  it('should return 400 when no image is provided', async () => {
    const formData = new FormData();
    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData
    });
    
    const response = await worker.fetch(request, mockEnv, mockExecutionContext);
    
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('No image file provided');
  });

  it('should return 400 for invalid file types', async () => {
    const formData = new FormData();
    const textFile = new File(['hello'], 'test.txt', { type: 'text/plain' });
    formData.append('image', textFile);
    
    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData
    });
    
    const response = await worker.fetch(request, mockEnv, mockExecutionContext);
    
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid file type. Please upload an image.');
  });

  it('should return 500 when API key is not configured', async () => {
    const formData = new FormData();
    const imageFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('image', imageFile);
    
    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData
    });
    
    const envWithoutKey: any = {};
    const response = await worker.fetch(request, envWithoutKey, mockExecutionContext);
    
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('API key not configured');
  });

  it('should handle successful Gemini API response', async () => {
    const formData = new FormData();
    const imageFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('image', imageFile);
    
    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData
    });

    // Mock successful Gemini API response
    const mockGeminiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              word: "apple",
              story: "This is a red apple. It's sweet and crunchy!"
            })
          }]
        }
      }]
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGeminiResponse)
    });
    
    const response = await worker.fetch(request, mockEnv, mockExecutionContext);
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.word).toBe('apple');
    expect(body.story).toBe("This is a red apple. It's sweet and crunchy!");
  });

  it('should handle Gemini API errors', async () => {
    const formData = new FormData();
    const imageFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('image', imageFile);
    
    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData
    });

    // Mock failed Gemini API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('API Error')
    });
    
    const response = await worker.fetch(request, mockEnv, mockExecutionContext);
    
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain('Gemini API error');
  });

  it('should handle invalid JSON response from Gemini', async () => {
    const formData = new FormData();
    const imageFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('image', imageFile);
    
    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData
    });

    // Mock Gemini API response with invalid JSON
    const mockGeminiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: 'word: apple, story: "This is a red apple. It\'s sweet and crunchy!"'
          }]
        }
      }]
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGeminiResponse)
    });
    
    const response = await worker.fetch(request, mockEnv, mockExecutionContext);
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.word).toBe('apple');
    expect(body.story).toBe("This is a red apple. It's sweet and crunchy!");
  });
});
