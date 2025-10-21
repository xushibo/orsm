import { useState, useEffect, useRef } from 'react';

export type PermissionState = 'prompt' | 'granted' | 'denied';

export interface CameraState {
  permissionState: PermissionState;
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  isHttps: boolean;
}

export const useCamera = () => {
  const [state, setState] = useState<CameraState>({
    permissionState: 'prompt',
    stream: null,
    error: null,
    isLoading: false,
    isHttps: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // 检查是否为 HTTPS 环境
  useEffect(() => {
    const isHttps = window.location.protocol === 'https:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    setState(prev => ({ ...prev, isHttps }));
  }, []);

  const requestCameraPermission = async () => {
    // 检查 HTTPS 环境
    if (!state.isHttps) {
      setState(prev => ({
        ...prev,
        error: 'Camera access requires HTTPS. Please use HTTPS or localhost.',
        isLoading: false,
      }));
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setState(prev => ({
        ...prev,
        error: 'Camera not supported on this device',
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 移动端 Safari 兼容性配置
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // 优先使用后置摄像头
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setState({
        permissionState: 'granted',
        stream,
        error: null,
        isLoading: false,
        isHttps: state.isHttps,
      });

      // 将流附加到视频元素
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // 确保视频播放
        videoRef.current.play().catch(console.error);
      }

    } catch (error) {
      console.error('Camera access error:', error);
      
      let errorMessage = 'Failed to access camera';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setState(prev => ({ ...prev, permissionState: 'denied' }));
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported. Trying with basic settings...';
          // 尝试使用更简单的约束
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setState({
              permissionState: 'granted',
              stream: basicStream,
              error: null,
              isLoading: false,
              isHttps: state.isHttps,
            });
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream;
              videoRef.current.play().catch(console.error);
            }
            return;
          } catch {
            errorMessage = 'Camera access failed with basic settings';
          }
        }
      }

      setState(prev => ({
        ...prev,
        permissionState: 'denied',
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const stopCamera = () => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      setState({
        permissionState: 'prompt',
        stream: null,
        error: null,
        isLoading: false,
        isHttps: state.isHttps,
      });
    }
  };

  // 清理函数
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.stream]);

  return {
    ...state,
    videoRef,
    requestCameraPermission,
    stopCamera,
  };
};
