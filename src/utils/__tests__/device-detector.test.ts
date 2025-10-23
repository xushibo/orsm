/**
 * Tests for device detector utility
 */

import { 
  isMobileDevice, 
  isIOSDevice, 
  isSafariBrowser, 
  isAndroidDevice, 
  getIOSVersion, 
  getSafariVersion,
  getDeviceInfo 
} from '../device-detector';

// Mock navigator
const mockNavigator = (userAgent: string) => {
  Object.defineProperty(window, 'navigator', {
    value: { userAgent },
    writable: true
  });
};

describe('Device Detector', () => {
  beforeEach(() => {
    // Reset window object
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true
    });
  });

  describe('isMobileDevice', () => {
    it('should detect mobile devices by user agent', () => {
      mockNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
      expect(isMobileDevice()).toBe(true);
    });

    it('should detect mobile devices by screen size and touch', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400 });
      Object.defineProperty(window, 'ontouchstart', { value: true });
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
      expect(isMobileDevice()).toBe(true);
    });

    it('should not detect desktop as mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      // Skip touch test for desktop
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('isIOSDevice', () => {
    it('should detect iPhone', () => {
      mockNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
      expect(isIOSDevice()).toBe(true);
    });

    it('should detect iPad', () => {
      mockNavigator('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)');
      expect(isIOSDevice()).toBe(true);
    });

    it('should not detect Android as iOS', () => {
      mockNavigator('Mozilla/5.0 (Linux; Android 10; SM-G975F)');
      expect(isIOSDevice()).toBe(false);
    });
  });

  describe('isSafariBrowser', () => {
    it('should detect Safari', () => {
      mockNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15');
      expect(isSafariBrowser()).toBe(true);
    });

    it('should not detect Chrome as Safari', () => {
      mockNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      expect(isSafariBrowser()).toBe(false);
    });
  });

  describe('isAndroidDevice', () => {
    it('should detect Android', () => {
      mockNavigator('Mozilla/5.0 (Linux; Android 10; SM-G975F)');
      expect(isAndroidDevice()).toBe(true);
    });

    it('should not detect iOS as Android', () => {
      mockNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
      expect(isAndroidDevice()).toBe(false);
    });
  });

  describe('getIOSVersion', () => {
    it('should extract iOS version', () => {
      mockNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X)');
      expect(getIOSVersion()).toBe('14.2.1');
    });

    it('should return empty string for non-iOS', () => {
      mockNavigator('Mozilla/5.0 (Linux; Android 10; SM-G975F)');
      expect(getIOSVersion()).toBe('');
    });
  });

  describe('getSafariVersion', () => {
    it('should extract Safari version', () => {
      mockNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15');
      expect(getSafariVersion()).toBe('14.0');
    });

    it('should return empty string for non-Safari', () => {
      mockNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124');
      expect(getSafariVersion()).toBe('');
    });
  });

  describe('getDeviceInfo', () => {
    it('should return complete device info for iPhone', () => {
      mockNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
      const info = getDeviceInfo();
      
      expect(info.isMobile).toBe(true);
      expect(info.isIOS).toBe(true);
      expect(info.isSafari).toBe(true);
      expect(info.isAndroid).toBe(false);
      expect(info.browserName).toBe('Safari');
      expect(info.deviceType).toBe('mobile');
    });

    it('should return complete device info for Android', () => {
      mockNavigator('Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36');
      const info = getDeviceInfo();
      
      expect(info.isMobile).toBe(true);
      expect(info.isIOS).toBe(false);
      expect(info.isSafari).toBe(false);
      expect(info.isAndroid).toBe(true);
      expect(info.browserName).toBe('Chrome');
      expect(info.deviceType).toBe('mobile');
    });
  });
});
