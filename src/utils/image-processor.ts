/**
 * 图片处理工具
 * 专门处理移动端Safari的图片捕获和优化
 */

export interface CaptureOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  enhanceContrast?: boolean;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  format: string;
}

const DEFAULT_OPTIONS: CaptureOptions = {
  quality: 0.92,
  maxWidth: 1920,
  maxHeight: 1080,
  enhanceContrast: true,
  format: 'image/jpeg',
};

/**
 * 等待视频元素完全就绪
 */
async function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('Video ready timeout, proceeding anyway');
      resolve(); // 不抛出错误，继续执行
    }, 8000); // 增加超时时间

    const checkReady = () => {
      console.log('Video ready state check:', {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });

      // 降低要求：readyState >= 2 就可以继续
      if (video.readyState >= 2) {
        clearTimeout(timeout);
        resolve();
      }
    };

    // 立即检查
    checkReady();

    // 如果还没准备好，监听多个事件
    if (video.readyState < 2) {
      const events = ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing'];
      
      const handler = () => {
        console.log('Video event received, checking ready state');
        checkReady();
      };

      events.forEach(event => {
        video.addEventListener(event, handler, { once: true });
      });
    }
  });
}

/**
 * 获取视频实际尺寸（处理Safari的0x0问题）
 */
function getVideoActualDimensions(video: HTMLVideoElement): { width: number; height: number } {
  let width = video.videoWidth;
  let height = video.videoHeight;

  // 如果videoWidth/videoHeight为0（Safari的常见问题）
  if (width === 0 || height === 0) {
    console.warn('Video dimensions are 0, using element dimensions');
    width = video.clientWidth || video.offsetWidth || 1280;
    height = video.clientHeight || video.offsetHeight || 720;
  }

  console.log('Video dimensions:', { width, height, videoWidth: video.videoWidth, videoHeight: video.videoHeight });
  
  return { width, height };
}

/**
 * 应用图片增强（对比度、清晰度）
 */
function enhanceImage(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  try {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 简单的对比度增强
    const factor = 1.2; // 对比度因子
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);     // R
      data[i + 1] = Math.min(255, data[i + 1] * factor); // G
      data[i + 2] = Math.min(255, data[i + 2] * factor); // B
      // Alpha channel (data[i + 3]) remains unchanged
    }

    context.putImageData(imageData, 0, 0);
    console.log('Image enhancement applied');
  } catch (error) {
    console.warn('Image enhancement failed:', error);
    // 如果增强失败，继续使用原图
  }
}

/**
 * 从视频元素捕获图片
 */
export async function captureImageFromVideo(
  video: HTMLVideoElement,
  options: CaptureOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 1. 等待视频完全就绪
  await waitForVideoReady(video);

  // 2. 获取实际视频尺寸
  const { width: videoWidth, height: videoHeight } = getVideoActualDimensions(video);

  // 3. 计算目标尺寸（保持宽高比）
  let targetWidth = videoWidth;
  let targetHeight = videoHeight;

  if (opts.maxWidth && targetWidth > opts.maxWidth) {
    const ratio = opts.maxWidth / targetWidth;
    targetWidth = opts.maxWidth;
    targetHeight = Math.round(targetHeight * ratio);
  }

  if (opts.maxHeight && targetHeight > opts.maxHeight) {
    const ratio = opts.maxHeight / targetHeight;
    targetHeight = opts.maxHeight;
    targetWidth = Math.round(targetWidth * ratio);
  }

  console.log('Target dimensions:', { targetWidth, targetHeight });

  // 4. 创建canvas并绘制
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  // 绘制视频帧到canvas
  context.drawImage(video, 0, 0, targetWidth, targetHeight);

  // 5. 应用图片增强
  if (opts.enhanceContrast) {
    enhanceImage(context, targetWidth, targetHeight);
  }

  // 6. 转换为Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      opts.format,
      opts.quality
    );
  });

  console.log('Image captured:', {
    width: targetWidth,
    height: targetHeight,
    size: blob.size,
    format: blob.type,
  });

  return blob;
}

/**
 * 获取图片信息
 */
export function getImageInfo(blob: Blob): ImageInfo {
  return {
    width: 0, // 需要从blob读取
    height: 0, // 需要从blob读取
    size: blob.size,
    format: blob.type,
  };
}

/**
 * 验证图片质量
 */
export function validateImageQuality(blob: Blob, minSize: number = 10000): boolean {
  if (blob.size < minSize) {
    console.error('Image too small:', blob.size, 'bytes (minimum:', minSize, 'bytes)');
    return false;
  }

  if (!blob.type.startsWith('image/')) {
    console.error('Invalid image type:', blob.type);
    return false;
  }

  return true;
}

/**
 * 创建图片预览URL
 */
export function createImagePreviewURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * 释放图片预览URL
 */
export function revokeImagePreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}

