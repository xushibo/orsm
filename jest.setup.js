import '@testing-library/jest-dom';

// Optional: setup a fake browser environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock HTMLMediaElement.play() method
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve())
});

// Mock device detector
jest.mock('@/src/utils/device-detector', () => ({
  useDeviceDetector: () => ({
    isMobile: true,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: true
  }),
  logDeviceInfo: jest.fn()
}));