import { useCallback } from 'react';
import { captureImageFromVideo, validateImageQuality } from '@/src/utils/image-processor';
import { CANVAS_CONFIG } from '@/src/utils/constants';
import { ERROR_MESSAGES } from '@/src/utils/error-messages';

export interface ImageCaptureHook {
  captureImage: (video: HTMLVideoElement) => Promise<Blob>;
}

/**
 * Hook for capturing images from video
 * Handles image capture, validation, and processing
 */
export function useImageCapture(): ImageCaptureHook {
  const captureImage = useCallback(async (video: HTMLVideoElement): Promise<Blob> => {
    console.log('=== Starting image capture ===');

    // Use unified image capture utility
    const blob = await captureImageFromVideo(video, {
      quality: CANVAS_CONFIG.DEFAULT_QUALITY,
      enhanceContrast: true,
      format: 'image/jpeg'
    });

    console.log('=== Image Details ===');
    console.log('Image size:', blob.size, 'bytes');
    console.log('Image type:', blob.type);
    
    // Validate image quality
    if (!validateImageQuality(blob)) {
      throw new Error(ERROR_MESSAGES.INVALID_IMAGE_QUALITY);
    }
    
    console.log('===========================');
    return blob;
  }, []);

  return {
    captureImage,
  };
}
