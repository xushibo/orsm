/**
 * Tests for image capture hook
 */

import { renderHook, act } from '@testing-library/react';
import { useImageCapture } from '../use-image-capture';

// Mock image processor utilities
jest.mock('@/src/utils/image-processor', () => ({
  captureImageFromVideo: jest.fn(),
  validateImageQuality: jest.fn(),
}));

// Mock constants
jest.mock('@/src/utils/constants', () => ({
  CANVAS_CONFIG: {
    DEFAULT_QUALITY: 0.92,
  },
}));

// Mock error messages
jest.mock('@/src/utils/error-messages', () => ({
  ERROR_MESSAGES: {
    INVALID_IMAGE_QUALITY: 'Invalid image quality',
  },
}));

import { captureImageFromVideo, validateImageQuality } from '@/src/utils/image-processor';

describe('useImageCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should capture image successfully', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const mockVideo = {
      videoWidth: 1920,
      videoHeight: 1080,
    } as HTMLVideoElement;

    (captureImageFromVideo as jest.Mock).mockResolvedValue(mockBlob);
    (validateImageQuality as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useImageCapture());

    await act(async () => {
      const blob = await result.current.captureImage(mockVideo);
      expect(blob).toBe(mockBlob);
    });

    expect(captureImageFromVideo).toHaveBeenCalledWith(mockVideo, {
      quality: 0.92,
      enhanceContrast: true,
      format: 'image/jpeg'
    });
    expect(validateImageQuality).toHaveBeenCalledWith(mockBlob);
  });

  it('should throw error for invalid image quality', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const mockVideo = {
      videoWidth: 1920,
      videoHeight: 1080,
    } as HTMLVideoElement;

    (captureImageFromVideo as jest.Mock).mockResolvedValue(mockBlob);
    (validateImageQuality as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useImageCapture());

    await act(async () => {
      await expect(result.current.captureImage(mockVideo)).rejects.toThrow('Invalid image quality');
    });
  });

  it('should handle capture error', async () => {
    const mockVideo = {
      videoWidth: 1920,
      videoHeight: 1080,
    } as HTMLVideoElement;

    (captureImageFromVideo as jest.Mock).mockRejectedValue(new Error('Capture failed'));

    const { result } = renderHook(() => useImageCapture());

    await act(async () => {
      await expect(result.current.captureImage(mockVideo)).rejects.toThrow('Capture failed');
    });
  });
});
