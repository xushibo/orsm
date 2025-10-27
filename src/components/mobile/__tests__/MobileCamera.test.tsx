/**
 * Tests for MobileCamera component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileCamera } from '../MobileCamera';

// Mock all hooks
jest.mock('@/src/hooks/use-camera-permission', () => ({
  useCameraPermission: () => ({
    permissionState: 'prompt',
    error: null,
    requestCamera: jest.fn(),
    resetPermission: jest.fn(),
  }),
}));

jest.mock('@/src/hooks/use-video-stream', () => ({
  useVideoStream: () => ({
    videoRef: { current: null },
    setupVideo: jest.fn(),
    cleanupVideo: jest.fn(),
    isVideoReady: false,
  }),
}));

jest.mock('@/src/hooks/use-speech-synthesis', () => ({
  useSpeechSynthesis: () => ({
    isSpeaking: false,
    speakText: jest.fn(),
    stopSpeaking: jest.fn(),
  }),
}));

jest.mock('@/src/hooks/use-image-capture', () => ({
  useImageCapture: () => ({
    captureImage: jest.fn(),
  }),
}));

// Mock device detector
jest.mock('@/src/utils/device-detector', () => ({
  logDeviceInfo: jest.fn(),
}));

// Mock child components
jest.mock('../MobileCaptureButton', () => ({
  MobileCaptureButton: ({ onCapture }: { onCapture: () => void }) => (
    <button onClick={onCapture} data-testid="capture-button">
      Capture
    </button>
  ),
}));

jest.mock('../MobileResultModal', () => ({
  MobileResultModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="result-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('../../shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

jest.mock('../../camera/CameraPermissionPrompt', () => ({
  CameraPermissionPrompt: ({ onRequestCamera }: { onRequestCamera: () => void }) => (
    <div data-testid="permission-prompt">
      <button onClick={onRequestCamera}>Request Camera</button>
    </div>
  ),
}));

jest.mock('../../camera/CameraOverlay', () => ({
  CameraOverlay: () => <div data-testid="camera-overlay">Overlay</div>,
}));

jest.mock('../../camera/PermissionDenied', () => ({
  PermissionDenied: ({ onRetry }: { onRetry: () => void }) => (
    <div data-testid="permission-denied">
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

describe('MobileCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render permission prompt when permission state is prompt', () => {
    render(<MobileCamera />);
    
    expect(screen.getByTestId('permission-prompt')).toBeInTheDocument();
    expect(screen.queryByTestId('camera-overlay')).not.toBeInTheDocument();
    expect(screen.queryByTestId('permission-denied')).not.toBeInTheDocument();
  });

  it('should render camera overlay when permission is granted', () => {
    // Mock granted permission state
    jest.doMock('@/src/hooks/use-camera-permission', () => ({
      useCameraPermission: () => ({
        permissionState: 'granted',
        error: null,
        requestCamera: jest.fn(),
        resetPermission: jest.fn(),
      }),
    }));

    render(<MobileCamera />);
    
    expect(screen.getByTestId('camera-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('capture-button')).toBeInTheDocument();
  });

  it('should render permission denied when permission is denied', () => {
    // Mock denied permission state
    jest.doMock('@/src/hooks/use-camera-permission', () => ({
      useCameraPermission: () => ({
        permissionState: 'denied',
        error: 'Permission denied',
        requestCamera: jest.fn(),
        resetPermission: jest.fn(),
      }),
    }));

    render(<MobileCamera />);
    
    expect(screen.getByTestId('permission-denied')).toBeInTheDocument();
  });

  it('should render loading spinner when processing', () => {
    // Mock processing state
    jest.doMock('@/src/hooks/use-camera-permission', () => ({
      useCameraPermission: () => ({
        permissionState: 'granted',
        error: null,
        requestCamera: jest.fn(),
        resetPermission: jest.fn(),
      }),
    }));

    // Mock processing state
    const mockUseState = jest.fn()
      .mockReturnValueOnce([null, jest.fn()]) // stream
      .mockReturnValueOnce([true, jest.fn()]) // isProcessing
      .mockReturnValueOnce([null, jest.fn()]) // result
      .mockReturnValueOnce([false, jest.fn()]) // showResult
      .mockReturnValueOnce([false, jest.fn()]); // isChinese

    jest.spyOn(require('react'), 'useState').mockImplementation(mockUseState);

    render(<MobileCamera />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render result modal when result is shown', () => {
    // Mock result state
    const mockResult = { word: 'cat', story: 'A cat story' };
    const mockUseState = jest.fn()
      .mockReturnValueOnce([null, jest.fn()]) // stream
      .mockReturnValueOnce([false, jest.fn()]) // isProcessing
      .mockReturnValueOnce([mockResult, jest.fn()]) // result
      .mockReturnValueOnce([true, jest.fn()]) // showResult
      .mockReturnValueOnce([false, jest.fn()]); // isChinese

    jest.spyOn(require('react'), 'useState').mockImplementation(mockUseState);

    render(<MobileCamera />);
    
    expect(screen.getByTestId('result-modal')).toBeInTheDocument();
  });

  it('should have proper main container styling', () => {
    const { container } = render(<MobileCamera />);
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('relative', 'w-full', 'h-screen', 'overflow-hidden', 'bg-black');
  });
});
