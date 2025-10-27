/**
 * Validation utilities
 * Handles input validation for various data types and formats
 */

/**
 * Validate image blob
 */
export function validateImageBlob(blob: Blob): boolean {
  if (!blob) return false;
  
  // Check if it's an image type
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validImageTypes.includes(blob.type)) {
    return false;
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (blob.size > maxSize) {
    return false;
  }
  
  // Check minimum size (at least 1KB)
  const minSize = 1024; // 1KB
  if (blob.size < minSize) {
    return false;
  }
  
  return true;
}

/**
 * Validate camera stream
 */
export function validateCameraStream(stream: MediaStream | null): boolean {
  if (!stream) return false;
  
  // Check if stream is active
  if (stream.active === false) return false;
  
  // Check if it has video tracks
  const videoTracks = stream.getVideoTracks();
  if (videoTracks.length === 0) return false;
  
  // Check if video track is enabled
  const videoTrack = videoTracks[0];
  if (!videoTrack || !videoTrack.enabled) return false;
  
  return true;
}

/**
 * Validate AI recognition result
 */
export function validateAIResult(result: any): boolean {
  if (!result) return false;
  
  // Check required fields
  if (!result.word || typeof result.word !== 'string') return false;
  if (!result.story || typeof result.story !== 'string') return false;
  
  // Check word length
  if (result.word.length < 1 || result.word.length > 100) return false;
  
  // Check story length
  if (result.story.length < 10 || result.story.length > 2000) return false;
  
  return true;
}

/**
 * Validate text input
 */
export function validateTextInput(text: string, options: {
  minLength?: number;
  maxLength?: number;
  allowEmpty?: boolean;
  pattern?: RegExp;
} = {}): boolean {
  const { minLength = 1, maxLength = 1000, allowEmpty = false, pattern } = options;
  
  if (!text && !allowEmpty) return false;
  if (!text && allowEmpty) return true;
  
  if (text.length < minLength) return false;
  if (text.length > maxLength) return false;
  
  if (pattern && !pattern.test(text)) return false;
  
  return true;
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): boolean {
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
  return phonePattern.test(phone.replace(/\s/g, ''));
}

/**
 * Validate Chinese text
 */
export function validateChineseText(text: string): boolean {
  const chinesePattern = /[\u4e00-\u9fff]/;
  return chinesePattern.test(text);
}

/**
 * Validate English text
 */
export function validateEnglishText(text: string): boolean {
  const englishPattern = /^[a-zA-Z\s]+$/;
  return englishPattern.test(text);
}

/**
 * Validate mixed language text (Chinese + English)
 */
export function validateMixedLanguageText(text: string): boolean {
  const mixedPattern = /^[\u4e00-\u9fff\w\s]+$/;
  return mixedPattern.test(text);
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validate canvas dimensions
 */
export function validateCanvasDimensions(width: number, height: number): boolean {
  if (width <= 0 || height <= 0) return false;
  if (width > 10000 || height > 10000) return false; // Reasonable upper limit
  return true;
}

/**
 * Validate video element
 */
export function validateVideoElement(video: HTMLVideoElement): boolean {
  if (!video) return false;
  
  // Check if video has source
  if (!video.srcObject && !video.src) return false;
  
  // Check video dimensions
  if (video.videoWidth <= 0 || video.videoHeight <= 0) return false;
  
  return true;
}

/**
 * Validate speech synthesis
 */
export function validateSpeechSynthesis(): boolean {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Validate camera permissions
 */
export function validateCameraPermissions(): boolean {
  return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
}

/**
 * Validate browser compatibility
 */
export function validateBrowserCompatibility(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for required APIs
  if (!('mediaDevices' in navigator)) {
    issues.push('MediaDevices API not supported');
  }
  
  if (!('getUserMedia' in navigator.mediaDevices)) {
    issues.push('getUserMedia not supported');
  }
  
  if (!('speechSynthesis' in window)) {
    issues.push('Speech Synthesis not supported');
  }
  
  if (!('fetch' in window)) {
    issues.push('Fetch API not supported');
  }
  
  if (!('Blob' in window)) {
    issues.push('Blob API not supported');
  }
  
  if (!('URL' in window)) {
    issues.push('URL API not supported');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}
