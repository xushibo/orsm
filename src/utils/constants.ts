/**
 * Application constants
 * Centralized configuration for magic numbers and default values
 */

export const CANVAS_CONFIG = {
  MIN_SIZE: 100,
  FALLBACK_WIDTH: 720,
  FALLBACK_HEIGHT: 1280,
  DEFAULT_QUALITY: 0.8,
  ENHANCED_QUALITY: 0.92
} as const;

export const IMAGE_ENHANCEMENT = {
  CONTRAST_FACTOR: 1.3, // 统一使用1.3作为对比度因子
  BRIGHTNESS_OFFSET: 10,
  MIN_SIZE_BYTES: 10000, // 10KB
  MAX_SIZE_BYTES: 10 * 1024 * 1024 // 10MB
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

export const VIDEO_CONFIG = {
  SAFARI_TIMEOUT: 10000,
  READY_STATE_MIN: 2 // HAVE_CURRENT_DATA
} as const;
