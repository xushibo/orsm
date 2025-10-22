/**
 * Safari浏览器兼容性工具
 * 处理Safari特有的问题和限制
 */

import { isIOSDevice, isSafariBrowser, getIOSVersion } from './device-detector';

/**
 * Safari已知问题和解决方案
 */
export const SafariIssues = {
  // iOS 15以下版本的getUserMedia可能需要特殊处理
  requiresUserGesture: () => {
    const version = getIOSVersion();
    if (version) {
      const majorVersion = parseInt(version.split('.')[0]);
      return majorVersion < 15;
    }
    return false;
  },

  // Safari对video元素的autoplay有限制
  requiresPlaysinline: () => isIOSDevice(),

  // Safari的canvas.toBlob在某些情况下可能失败
  canvasToBlobIssues: () => isSafariBrowser(),
};

/**
 * 获取Safari优化的相机约束
 */
export function getSafariOptimizedConstraints(): MediaStreamConstraints {
  const isIOS = isIOSDevice();
  const isSafari = isSafariBrowser();

  if (isIOS || isSafari) {
    // Safari/iOS优化的约束
    return {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    };
  }

  // 其他浏览器使用更详细的约束
  return {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920, max: 3840 },
      height: { ideal: 1080, max: 2160 },
      frameRate: { ideal: 30, max: 60 },
    },
    audio: false,
  };
}

/**
 * 获取备用的相机约束（当主约束失败时使用）
 */
export function getFallbackConstraints(): MediaStreamConstraints {
  return {
    video: true,
    audio: false,
  };
}

/**
 * 修复Safari的video元素属性
 */
export function applySafariVideoFixes(video: HTMLVideoElement): void {
  if (!isIOSDevice() && !isSafariBrowser()) {
    return;
  }

  // iOS必需的属性
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.muted = true;

  // 防止视频自动全屏
  video.setAttribute('x5-video-player-type', 'h5');
  video.setAttribute('x5-video-player-fullscreen', 'false');

  console.log('Safari video fixes applied');
}

/**
 * 等待Safari视频流准备就绪
 * Safari需要更长的时间来准备视频流
 */
export async function waitForSafariVideoReady(
  video: HTMLVideoElement,
  timeout: number = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Safari video ready timeout'));
    }, timeout);

    const checkReady = () => {
      // Safari需要readyState >= 3 (HAVE_FUTURE_DATA)
      if (video.readyState >= 3 && video.videoWidth > 0 && video.videoHeight > 0) {
        clearTimeout(timeoutId);
        resolve();
      }
    };

    // 立即检查
    checkReady();

    // 如果还没准备好，监听事件
    if (video.readyState < 3 || video.videoWidth === 0) {
      const events = ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'];
      
      const handler = () => {
        checkReady();
        if (video.readyState >= 3 && video.videoWidth > 0) {
          events.forEach(event => video.removeEventListener(event, handler));
          clearTimeout(timeoutId);
          resolve();
        }
      };

      events.forEach(event => video.addEventListener(event, handler));
    }
  });
}

/**
 * 处理Safari的canvas.toBlob问题
 */
export async function safariSafeToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // 如果toBlob失败，尝试使用dataURL
            console.warn('canvas.toBlob failed, trying dataURL fallback');
            try {
              const dataURL = canvas.toDataURL(type, quality);
              const blob = dataURLToBlob(dataURL);
              resolve(blob);
            } catch {
              reject(new Error('Failed to create blob from canvas'));
            }
          }
        },
        type,
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 将DataURL转换为Blob（Safari fallback）
 */
function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * 检查Safari是否支持某个媒体约束
 */
export function checkSafariConstraintSupport(constraint: string): boolean {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getSupportedConstraints) {
    return false;
  }

  const supported = navigator.mediaDevices.getSupportedConstraints() as Record<string, boolean>;
  return supported[constraint] === true;
}

/**
 * 记录Safari兼容性信息
 */
export function logSafariCompatibility(): void {
  console.log('=== Safari Compatibility Info ===');
  console.log('Is iOS:', isIOSDevice());
  console.log('Is Safari:', isSafariBrowser());
  console.log('iOS Version:', getIOSVersion() || 'N/A');
  console.log('Requires User Gesture:', SafariIssues.requiresUserGesture());
  console.log('Requires Playsinline:', SafariIssues.requiresPlaysinline());
  console.log('Canvas toBlob Issues:', SafariIssues.canvasToBlobIssues());
  
  if (navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints) {
    console.log('Supported Constraints:', navigator.mediaDevices.getSupportedConstraints());
  }
  
  console.log('================================');
}

