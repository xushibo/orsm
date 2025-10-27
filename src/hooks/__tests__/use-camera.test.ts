/**
 * Tests for camera hook
 */

import { renderHook, act } from '@testing-library/react';
import { useCamera } from '../use-camera';

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
  applySafariVideoFixes: jest.fn(),
  waitForSafariVideoReady: jest.fn().mockResolvedValue(undefined),
}));

// Mock error messages
jest.mock('@/src/utils/error-messages', () => ({
  getUserFriendlyError: (error: Error) => error.message,
  ERROR_MESSAGES: {
    CAMERA_PERMISSION_DENIED: 'Camera permission denied',
  },
}));

describe('useCamera', () => {
  beforeEach(() => {
    mockGetUserMedia.mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCamera());
    
    expect(result.current.stream).toBeNull();
    expect(result.current.permissionState).toBe('prompt');
    expect(result.current.error).toBeNull();
    expect(result.current.isVideoReady).toBe(false);
  });

  it('should request camera successfully', async () => {
    const mockStream = { getTracks: () => [] } as MediaStream;
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.requestCamera();
    });

    expect(result.current.stream).toBe(mockStream);
    expect(result.current.permissionState).toBe('granted');
    expect(result.current.error).toBeNull();
  });

  it('should handle camera permission denial', async () => {
    const mockError = new Error('Permission denied');
    mockGetUserMedia.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.requestCamera();
    });

    expect(result.current.stream).toBeNull();
    expect(result.current.permissionState).toBe('denied');
    expect(result.current.error).toBe('Permission denied');
  });

  it('should cleanup stream on unmount', () => {
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() },
        { stop: jest.fn() },
      ]),
    } as any;

    const { result, unmount } = renderHook(() => useCamera());

    act(() => {
      result.current.setStream(mockStream);
    });

    unmount();

    expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
    expect(mockStream.getTracks()[1].stop).toHaveBeenCalled();
  });

  it('should reset permission state', () => {
    const { result } = renderHook(() => useCamera());

    act(() => {
      result.current.setPermissionState('denied');
      result.current.setError('Test error');
    });

    expect(result.current.permissionState).toBe('denied');
    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.resetPermission();
    });

    expect(result.current.permissionState).toBe('prompt');
    expect(result.current.error).toBeNull();
  });

  it('should set video ready state', () => {
    const { result } = renderHook(() => useCamera());

    act(() => {
      result.current.setVideoReady(true);
    });

    expect(result.current.isVideoReady).toBe(true);
  });
});
