/**
 * Tests for constants utility
 */

import { CANVAS_CONFIG, IMAGE_ENHANCEMENT, API_CONFIG, VIDEO_CONFIG } from '../constants';

describe('Constants', () => {
  describe('CANVAS_CONFIG', () => {
    it('should have valid canvas configuration', () => {
      expect(CANVAS_CONFIG.MIN_SIZE).toBe(100);
      expect(CANVAS_CONFIG.FALLBACK_WIDTH).toBe(720);
      expect(CANVAS_CONFIG.FALLBACK_HEIGHT).toBe(1280);
      expect(CANVAS_CONFIG.DEFAULT_QUALITY).toBe(0.8);
      expect(CANVAS_CONFIG.ENHANCED_QUALITY).toBe(0.92);
    });
  });

  describe('IMAGE_ENHANCEMENT', () => {
    it('should have valid image enhancement configuration', () => {
      expect(IMAGE_ENHANCEMENT.CONTRAST_FACTOR).toBe(1.3);
      expect(IMAGE_ENHANCEMENT.BRIGHTNESS_OFFSET).toBe(10);
      expect(IMAGE_ENHANCEMENT.MIN_SIZE_BYTES).toBe(10000);
      expect(IMAGE_ENHANCEMENT.MAX_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });
  });

  describe('API_CONFIG', () => {
    it('should have valid API configuration', () => {
      expect(API_CONFIG.TIMEOUT).toBe(30000);
      expect(API_CONFIG.RETRY_ATTEMPTS).toBe(3);
      expect(API_CONFIG.RETRY_DELAY).toBe(1000);
    });
  });

  describe('VIDEO_CONFIG', () => {
    it('should have valid video configuration', () => {
      expect(VIDEO_CONFIG.SAFARI_TIMEOUT).toBe(10000);
      expect(VIDEO_CONFIG.READY_STATE_MIN).toBe(2);
    });
  });
});
