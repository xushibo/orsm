/**
 * Camera-related type definitions
 */

export type CameraPermissionState = 'prompt' | 'granted' | 'denied';

export interface CameraConstraints {
  video: {
    width?: { ideal?: number; min?: number; max?: number };
    height?: { ideal?: number; min?: number; max?: number };
    facingMode?: 'user' | 'environment' | { ideal: 'user' | 'environment' };
    frameRate?: { ideal?: number; min?: number; max?: number };
  };
  audio?: boolean;
}

export interface CameraStream {
  stream: MediaStream | null;
  isActive: boolean;
  hasVideoTrack: boolean;
  hasAudioTrack: boolean;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
}

export interface CameraSettings {
  width: number;
  height: number;
  frameRate: number;
  facingMode: 'user' | 'environment';
  aspectRatio: number;
}

export interface CameraError {
  code: string;
  message: string;
  name: string;
}

export interface CameraPermissionHook {
  stream: MediaStream | null;
  permissionState: CameraPermissionState;
  error: string | null;
  requestCamera: () => Promise<void>;
  resetPermissionState: () => void;
}

export interface VideoStreamHook {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setupVideo: (stream: MediaStream) => Promise<void>;
  cleanupVideo: () => void;
  isVideoReady: boolean;
}

export interface ImageCaptureHook {
  captureImage: (options?: CaptureOptions) => Promise<Blob>;
}

export interface CaptureOptions {
  quality?: number;
  enhanceContrast?: boolean;
  format?: string;
  width?: number;
  height?: number;
}

export interface CameraComponentProps {
  onCapture?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  onPermissionChange?: (state: CameraPermissionState) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface CameraPermissionPromptProps {
  onRequestCamera: () => void;
  isChinese: boolean;
  toggleLanguage: () => void;
}

export interface CameraOverlayProps {
  isChinese: boolean;
  showGuide?: boolean;
  guideText?: string;
}

export interface PermissionDeniedProps {
  error: string | null;
  onRetry: () => void;
}

export interface CameraState {
  isInitialized: boolean;
  isStreaming: boolean;
  isCapturing: boolean;
  hasPermission: boolean;
  error: string | null;
  settings: CameraSettings;
}
