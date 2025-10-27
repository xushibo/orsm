/**
 * Tests for mobile camera hook
 */

import { renderHook, act } from '@testing-library/react';
import { useMobileCamera } from '../use-mobile-camera';

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

// Mock device detector
jest.mock('@/src/utils/device-detector', () => ({
  logDeviceInfo: jest.fn(),
}));

describe('useMobileCamera', () => {
  beforeEach(() => {
    mockGetUserMedia.mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMobileCamera());
    
    expect(result.current.stream).toBeNull();
    expect(result.current.permissionState).toBe('prompt');
    expect(result.current.error).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.showResult).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isChinese).toBe(false);
  });

  it('should request camera successfully', async () => {
    const mockStream = { getTracks: () => [] } as MediaStream;
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMobileCamera());

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

    const { result } = renderHook(() => useMobileCamera());

    await act(async () => {
      await result.current.requestCamera();
    });

    expect(result.current.stream).toBeNull();
    expect(result.current.permissionState).toBe('denied');
    expect(result.current.error).toBe('Permission denied');
  });

  it('should toggle language', () => {
    const { result } = renderHook(() => useMobileCamera());

    expect(result.current.isChinese).toBe(false);

    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.isChinese).toBe(true);

    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.isChinese).toBe(false);
  });

  it('should set result and show result', () => {
    const { result } = renderHook(() => useMobileCamera());
    const mockResult = { word: 'cat', story: 'A cat story' };

    act(() => {
      result.current.setResult(mockResult);
      result.current.setShowResult(true);
    });

    expect(result.current.result).toBe(mockResult);
    expect(result.current.showResult).toBe(true);
  });

  it('should set processing state', () => {
    const { result } = renderHook(() => useMobileCamera());

    act(() => {
      result.current.setIsProcessing(true);
    });

    expect(result.current.isProcessing).toBe(true);
  });

  it('should set speaking state', () => {
    const { result } = renderHook(() => useMobileCamera());

    act(() => {
      result.current.setIsSpeaking(true);
    });

    expect(result.current.isSpeaking).toBe(true);
  });

  it('should reset permission', () => {
    const { result } = renderHook(() => useMobileCamera());

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

  it('should cleanup stream on unmount', () => {
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() },
        { stop: jest.fn() },
      ]),
    } as any;

    const { result, unmount } = renderHook(() => useMobileCamera());

    act(() => {
      result.current.setStream(mockStream);
    });

    unmount();

    expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
    expect(mockStream.getTracks()[1].stop).toHaveBeenCalled();
  });
});
