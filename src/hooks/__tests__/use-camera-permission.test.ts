/**
 * Tests for camera permission hook
 */

import { renderHook, act } from '@testing-library/react';
import { useCameraPermission } from '../use-camera-permission';

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock Safari compatibility utilities
jest.mock('@/src/utils/safari-compatibility', () => ({
  getSafariOptimizedConstraints: () => ({ video: true }),
  getFallbackConstraints: () => ({ video: true }),
}));

// Mock error messages
jest.mock('@/src/utils/error-messages', () => ({
  getUserFriendlyError: (error: Error) => error.message,
  ERROR_MESSAGES: {
    CAMERA_PERMISSION_DENIED: 'Camera permission denied',
  },
}));

describe('useCameraPermission', () => {
  beforeEach(() => {
    mockGetUserMedia.mockClear();
  });

  it('should initialize with prompt state', () => {
    const { result } = renderHook(() => useCameraPermission());
    
    expect(result.current.permissionState).toBe('prompt');
    expect(result.current.error).toBeNull();
  });

  it('should successfully request camera permission', async () => {
    const mockStream = { getTracks: () => [] } as MediaStream;
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useCameraPermission());

    await act(async () => {
      const stream = await result.current.requestCamera();
      expect(stream).toBe(mockStream);
    });

    expect(result.current.permissionState).toBe('granted');
    expect(result.current.error).toBeNull();
  });

  it('should handle camera permission denial', async () => {
    const mockError = new Error('Permission denied');
    mockGetUserMedia.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCameraPermission());

    await act(async () => {
      const stream = await result.current.requestCamera();
      expect(stream).toBeNull();
    });

    expect(result.current.permissionState).toBe('denied');
    expect(result.current.error).toBe('Permission denied');
  });

  it('should reset permission state', () => {
    const { result } = renderHook(() => useCameraPermission());

    act(() => {
      result.current.resetPermission();
    });

    expect(result.current.permissionState).toBe('prompt');
    expect(result.current.error).toBeNull();
  });

  it('should try fallback constraints when optimized constraints fail', async () => {
    const mockStream = { getTracks: () => [] } as MediaStream;
    mockGetUserMedia
      .mockRejectedValueOnce(new Error('Optimized constraints failed'))
      .mockResolvedValueOnce(mockStream);

    const { result } = renderHook(() => useCameraPermission());

    await act(async () => {
      const stream = await result.current.requestCamera();
      expect(stream).toBe(mockStream);
    });

    expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
    expect(result.current.permissionState).toBe('granted');
  });
});
