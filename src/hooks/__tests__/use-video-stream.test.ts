/**
 * Tests for video stream hook
 */

import { renderHook, act } from '@testing-library/react';
import { useVideoStream } from '../use-video-stream';

// Mock Safari compatibility utilities
jest.mock('@/src/utils/safari-compatibility', () => ({
  applySafariVideoFixes: jest.fn(),
  waitForSafariVideoReady: jest.fn().mockResolvedValue(undefined),
}));

describe('useVideoStream', () => {
  it('should initialize with video ref and ready state false', () => {
    const { result } = renderHook(() => useVideoStream());
    
    expect(result.current.videoRef.current).toBeNull();
    expect(result.current.isVideoReady).toBe(false);
  });

  it('should setup video with stream', async () => {
    const mockStream = { getTracks: () => [] } as MediaStream;
    const { result } = renderHook(() => useVideoStream());

    // Mock video element
    const mockVideo = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      srcObject: null,
      muted: false,
      playsInline: false,
      setAttribute: jest.fn(),
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as any;

    // Set ref to mock video
    act(() => {
      result.current.videoRef.current = mockVideo;
    });

    await act(async () => {
      await result.current.setupVideo(mockStream);
    });

    expect(mockVideo.srcObject).toBe(mockStream);
    expect(mockVideo.muted).toBe(true);
    expect(mockVideo.playsInline).toBe(true);
    expect(mockVideo.play).toHaveBeenCalled();
  });

  it('should cleanup video', () => {
    const { result } = renderHook(() => useVideoStream());

    // Mock video element
    const mockVideo = {
      pause: jest.fn(),
      srcObject: {} as MediaStream,
    } as any;

    act(() => {
      result.current.videoRef.current = mockVideo;
    });

    act(() => {
      result.current.cleanupVideo();
    });

    expect(mockVideo.pause).toHaveBeenCalled();
    expect(mockVideo.srcObject).toBeNull();
    expect(result.current.isVideoReady).toBe(false);
  });

  it('should handle video setup without video ref', async () => {
    const mockStream = { getTracks: () => [] } as MediaStream;
    const { result } = renderHook(() => useVideoStream());

    // Don't set video ref
    await act(async () => {
      await result.current.setupVideo(mockStream);
    });

    // Should not throw error
    expect(result.current.isVideoReady).toBe(false);
  });
});
