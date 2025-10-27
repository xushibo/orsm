import { useState, useCallback } from 'react';
import { getSafariOptimizedConstraints, getFallbackConstraints } from '@/src/utils/safari-compatibility';
import { getUserFriendlyError, ERROR_MESSAGES } from '@/src/utils/error-messages';

export type PermissionState = 'prompt' | 'granted' | 'denied';

export interface CameraPermissionHook {
  permissionState: PermissionState;
  error: string | null;
  requestCamera: () => Promise<MediaStream | null>;
  resetPermission: () => void;
}

/**
 * Hook for managing camera permissions
 * Handles permission requests with Safari compatibility
 */
export function useCameraPermission(): CameraPermissionHook {
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [error, setError] = useState<string | null>(null);

  const requestCamera = useCallback(async (): Promise<MediaStream | null> => {
    try {
      console.log('=== Requesting camera permission ===');
      
      // First try Safari optimized constraints
      let mediaStream: MediaStream;
      try {
        const constraints = getSafariOptimizedConstraints();
        console.log('Trying with optimized constraints:', constraints);
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        console.warn('Optimized constraints failed, trying fallback');
        const fallbackConstraints = getFallbackConstraints();
        mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }

      console.log('Camera stream obtained');
      setPermissionState('granted');
      setError(null);
      return mediaStream;

    } catch (err) {
      console.error('Camera access error:', err);
      setPermissionState('denied');
      const errorMessage = getUserFriendlyError(err instanceof Error ? err : new Error(String(err)));
      setError(errorMessage);
      return null;
    }
  }, []);

  const resetPermission = useCallback(() => {
    setPermissionState('prompt');
    setError(null);
  }, []);

  return {
    permissionState,
    error,
    requestCamera,
    resetPermission,
  };
}
