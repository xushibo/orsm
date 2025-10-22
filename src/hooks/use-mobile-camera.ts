import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getSafariOptimizedConstraints, 
  getFallbackConstraints,
  applySafariVideoFixes,
  waitForSafariVideoReady 
} from '@/src/utils/safari-compatibility';
import { logDeviceInfo } from '@/src/utils/device-detector';

export type PermissionState = 'prompt' | 'granted' | 'denied';

export interface MobileCameraState {
  permissionState: PermissionState;
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  isReady: boolean;
}

/**
 * 移动端相机Hook
 * 专门优化移动Safari的相机访问
 */
export function useMobileCamera() {
  const [state, setState] = useState<MobileCameraState>({
    permissionState: 'prompt',
    stream: null,
    error: null,
    isLoading: false,
    isReady: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // 记录设备信息
  useEffect(() => {
    logDeviceInfo();
  }, []);

  // 请求相机权限
  const requestCameraPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('=== Requesting mobile camera permission ===');

      // 首先尝试Safari优化的约束
      let mediaStream: MediaStream;
      try {
        const constraints = getSafariOptimizedConstraints();
        console.log('Trying with optimized constraints:', constraints);
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Optimized constraints succeeded');
      } catch (err) {
        console.warn('Optimized constraints failed, trying fallback:', err);
        const fallbackConstraints = getFallbackConstraints();
        console.log('Trying with fallback constraints:', fallbackConstraints);
        mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        console.log('Fallback constraints succeeded');
      }

      console.log('Camera stream obtained');

      // 应用Safari修复
      if (videoRef.current) {
        applySafariVideoFixes(videoRef.current);
        videoRef.current.srcObject = mediaStream;
        
        try {
          await videoRef.current.play();
          console.log('Video playback started');
          
          // 等待视频完全就绪
          await waitForSafariVideoReady(videoRef.current);
          console.log('Video is fully ready');
          
          setState({
            permissionState: 'granted',
            stream: mediaStream,
            error: null,
            isLoading: false,
            isReady: true,
          });
        } catch (playError) {
          console.error('Video play error:', playError);
          throw new Error('Failed to start video playback');
        }
      } else {
        setState({
          permissionState: 'granted',
          stream: mediaStream,
          error: null,
          isLoading: false,
          isReady: false,
        });
      }

    } catch (error) {
      console.error('Camera access error:', error);
      
      let errorMessage = 'Failed to access camera';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported by this device';
        } else {
          errorMessage = error.message;
        }
      }

      setState({
        permissionState: 'denied',
        stream: null,
        error: errorMessage,
        isLoading: false,
        isReady: false,
      });
    }
  }, []);

  // 停止相机
  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setState({
        permissionState: 'prompt',
        stream: null,
        error: null,
        isLoading: false,
        isReady: false,
      });
    }
  }, [state.stream]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        console.log('Camera stream cleaned up');
      }
    };
  }, [state.stream]);

  // 当stream变化时，更新video元素
  useEffect(() => {
    if (state.stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = state.stream;
      videoRef.current.play().catch(console.error);
    }
  }, [state.stream]);

  return {
    ...state,
    videoRef,
    requestCameraPermission,
    stopCamera,
  };
}

