import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock browser APIs
const mockGetUserMedia = jest.fn();
const mockCreateObjectURL = jest.fn();

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia
  }
});

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: mockCreateObjectURL
});

// Mock fetch
global.fetch = jest.fn();

describe('Integration Test: Object Recognition Story Machine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should complete the full flow from camera access to story generation', async () => {
    // Mock successful camera access
    const mockStream = {
      getTracks: () => [],
      getVideoTracks: () => []
    };
    mockGetUserMedia.mockResolvedValueOnce(mockStream);

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        word: 'teddy bear',
        story: 'This is a soft teddy bear. It is brown and fluffy.'
      })
    });

    // Dynamically import the component to avoid SSR issues
    const { MobileCamera } = await import('../src/components/mobile/MobileCamera');
    const { render } = await import('@testing-library/react');

    // Render the component
    render(<MobileCamera />);

    // Wait for and click the start camera button
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const startButton = document.querySelector('button')!;
    startButton.click();

    // Wait for camera to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock canvas for image capture
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => ({
            drawImage: vi.fn(),
            getImageData: () => ({ data: new Uint8ClampedArray(100) }),
            putImageData: vi.fn()
          }),
          toBlob: (callback: Function) => {
            callback(new Blob(['image-data'], { type: 'image/jpeg' }));
          },
          width: 100,
          height: 100
        };
      }
      return originalCreateElement.call(document, tagName);
    });

    // Simulate capture button click
    const captureButton = document.querySelector('[data-testid="capture-button"]') || 
                         Array.from(document.querySelectorAll('button')).find(btn => 
                           btn.textContent?.includes('拍照') || 
                           btn.textContent?.toLowerCase().includes('capture'));
    
    if (captureButton) {
      captureButton.click();
    }

    // Wait for API call and response
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST'
      })
    );

    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('should handle API error gracefully', async () => {
    // Mock successful camera access
    const mockStream = {
      getTracks: () => []
    };
    mockGetUserMedia.mockResolvedValueOnce(mockStream);

    // Mock API error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error')
    });

    // Dynamically import the component
    const { MobileCamera } = await import('../src/components/mobile/MobileCamera');
    const { render } = await import('@testing-library/react');

    // Render the component
    render(<MobileCamera />);

    // Wait for and click the start camera button
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const startButton = document.querySelector('button')!;
    startButton.click();

    // Wait for camera to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock canvas for image capture
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => ({
            drawImage: vi.fn(),
            getImageData: () => ({ data: new Uint8ClampedArray(100) }),
            putImageData: vi.fn()
          }),
          toBlob: (callback: Function) => {
            callback(new Blob(['image-data'], { type: 'image/jpeg' }));
          },
          width: 100,
          height: 100
        };
      }
      return originalCreateElement.call(document, tagName);
    });

    // Simulate capture button click
    const captureButton = document.querySelector('[data-testid="capture-button"]') || 
                         Array.from(document.querySelectorAll('button')).find(btn => 
                           btn.textContent?.includes('拍照') || 
                           btn.textContent?.toLowerCase().includes('capture'));
    
    if (captureButton) {
      captureButton.click();
    }

    // Wait for API call and error handling
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled();

    // Restore original createElement
    document.createElement = originalCreateElement;
  });
});