/**
 * Tests for speech synthesis hook
 */

import { renderHook, act } from '@testing-library/react';
import { useSpeechSynthesis } from '../use-speech-synthesis';

// Mock speech synthesis
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
const mockGetVoices = jest.fn();

Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: mockGetVoices,
  },
  writable: true,
});

// Mock SpeechSynthesisUtterance
const mockUtterance = {
  lang: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
  onstart: null,
  onend: null,
  onerror: null,
};

global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => mockUtterance);

describe('useSpeechSynthesis', () => {
  beforeEach(() => {
    mockSpeak.mockClear();
    mockCancel.mockClear();
    mockGetVoices.mockClear();
    
    // Reset utterance callbacks
    mockUtterance.onstart = null;
    mockUtterance.onend = null;
    mockUtterance.onerror = null;
  });

  it('should initialize with not speaking', () => {
    const { result } = renderHook(() => useSpeechSynthesis());
    
    expect(result.current.isSpeaking).toBe(false);
  });

  it('should speak English text', async () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      await result.current.speakText('Hello world');
    });

    expect(mockUtterance.lang).toBe('en-US');
    expect(mockUtterance.rate).toBe(0.72);
    expect(mockUtterance.pitch).toBe(1.0);
    expect(mockSpeak).toHaveBeenCalledWith(mockUtterance);
  });

  it('should speak Chinese text', async () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      await result.current.speakText('你好世界');
    });

    expect(mockUtterance.lang).toBe('zh-CN');
    expect(mockUtterance.rate).toBe(1.008);
    expect(mockUtterance.pitch).toBe(1.0);
    expect(mockSpeak).toHaveBeenCalledWith(mockUtterance);
  });

  it('should stop speaking when already speaking', async () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    // First call to start speaking
    await act(async () => {
      await result.current.speakText('Hello world');
    });

    // Simulate speech started
    act(() => {
      if (mockUtterance.onstart) {
        mockUtterance.onstart();
      }
    });

    expect(result.current.isSpeaking).toBe(true);

    // Second call should stop speaking
    await act(async () => {
      await result.current.speakText('Hello world');
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it('should stop speaking explicitly', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.stopSpeaking();
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it('should handle speech start event', async () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      await result.current.speakText('Hello world');
    });

    act(() => {
      if (mockUtterance.onstart) {
        mockUtterance.onstart();
      }
    });

    expect(result.current.isSpeaking).toBe(true);
  });

  it('should handle speech end event', async () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      await result.current.speakText('Hello world');
    });

    act(() => {
      if (mockUtterance.onend) {
        mockUtterance.onend();
      }
    });

    expect(result.current.isSpeaking).toBe(false);
  });

  it('should handle speech error event', async () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    await act(async () => {
      await result.current.speakText('Hello world');
    });

    act(() => {
      if (mockUtterance.onerror) {
        mockUtterance.onerror({ error: 'test-error' } as any);
      }
    });

    expect(result.current.isSpeaking).toBe(false);
  });
});
