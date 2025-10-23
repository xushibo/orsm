import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileCamera } from './MobileCamera';

// Mock the browser APIs that are used in the component
const mockGetUserMedia = jest.fn();
const mockCreateObjectURL = jest.fn();

global.navigator.mediaDevices = {
  getUserMedia: mockGetUserMedia
} as unknown as MediaDevices;

global.URL.createObjectURL = mockCreateObjectURL;

// Mock child components
jest.mock('./MobileCaptureButton', () => ({
  MobileCaptureButton: ({ onCapture }: { onCapture: () => void }) => (
    <button data-testid="capture-button" onClick={onCapture}>
      Capture
    </button>
  )
}));

jest.mock('./MobileResultModal', () => ({
  MobileResultModal: ({ result, onClose }: { result: { word: string; story: string }; onClose: () => void }) => (
    <div data-testid="result-modal">
      <div data-testid="result-word">{result.word}</div>
      <div data-testid="result-story">{result.story}</div>
      <button data-testid="close-modal" onClick={onClose}>
        Close
      </button>
    </div>
  )
}));

jest.mock('../shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

describe('MobileCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the initial camera permission prompt', () => {
    render(<MobileCamera />);
    
    expect(screen.getByText('物品识别故事机')).toBeInTheDocument();
    expect(screen.getByText('拍照识别物品，AI为你创作故事')).toBeInTheDocument();
    expect(screen.getByText('启动相机')).toBeInTheDocument();
  });

  it('should request camera permission when clicking start button', async () => {
    const mockStream = {
      getTracks: () => []
    };
    
    mockGetUserMedia.mockResolvedValueOnce(mockStream);
    
    render(<MobileCamera />);
    
    fireEvent.click(screen.getByText('启动相机'));
    
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });
  });

  it('should show camera denied state when permission is rejected', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
    
    render(<MobileCamera />);
    
    fireEvent.click(screen.getByText('启动相机'));
    
    await waitFor(() => {
      expect(screen.getByText('相机访问被拒绝')).toBeInTheDocument();
      expect(screen.getByText('重试')).toBeInTheDocument();
    });
  });

  it('should show video stream when camera is granted', async () => {
    const mockStream = {
      getTracks: () => []
    };
    
    mockGetUserMedia.mockResolvedValueOnce(mockStream);
    
    render(<MobileCamera />);
    
    fireEvent.click(screen.getByText('启动相机'));
    
    await waitFor(() => {
      expect(screen.getByTestId('capture-button')).toBeInTheDocument();
    });
  });

  it('should show loading spinner during capture processing', async () => {
    const mockStream = {
      getTracks: () => []
    };
    
    mockGetUserMedia.mockResolvedValueOnce(mockStream);
    
    render(<MobileCamera />);
    
    fireEvent.click(screen.getByText('启动相机'));
    
    await waitFor(() => {
      expect(screen.getByTestId('capture-button')).toBeInTheDocument();
    });
    
    // Mock canvas and capture process
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => ({
            drawImage: jest.fn(),
            getImageData: () => ({ data: new Uint8ClampedArray(100) }),
            putImageData: jest.fn()
          }),
          toBlob: (callback: (blob: Blob | null) => void) => {
            callback(new Blob(['image-data'], { type: 'image/jpeg' }));
          },
          width: 100,
          height: 100
        };
      }
      return originalCreateElement.call(document, tagName);
    });
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ word: 'apple', story: 'A red apple' })
    });
    
    fireEvent.click(screen.getByTestId('capture-button'));
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('result-modal')).toBeInTheDocument();
    });
    
    // Restore original createElement
    document.createElement = originalCreateElement;
  });
});