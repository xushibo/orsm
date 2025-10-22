import { useState, useCallback } from 'react';
import { API_CONFIG } from '@/src/config/api';

export interface AIResult {
  word: string;
  story: string;
}

export interface RecognitionOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: RecognitionOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带重试的异步函数执行
 */
async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RecognitionOptions
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${maxRetries}`);
        await delay(retryDelay * attempt); // 递增延迟
      }
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Attempt ${attempt + 1} failed:`, lastError.message);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

/**
 * AI识别Hook
 */
export function useAIRecognition(options: RecognitionOptions = {}) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 识别图片
   */
  const recognizeImage = useCallback(async (imageBlob: Blob): Promise<AIResult> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    setIsRecognizing(true);
    setError(null);

    try {
      console.log('=== Starting AI Recognition ===');
      console.log('Image size:', imageBlob.size, 'bytes');
      console.log('Image type:', imageBlob.type);
      console.log('API endpoint:', API_CONFIG.baseUrl);

      // 验证图片
      if (imageBlob.size < 1000) {
        throw new Error('Image too small (< 1KB)');
      }

      if (!imageBlob.type.startsWith('image/')) {
        throw new Error('Invalid image format');
      }

      // 发送到API（带重试）
      const result = await retryAsync(async () => {
        const formData = new FormData();
        formData.append('image', imageBlob, 'captured-image.jpg');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

        try {
          const response = await fetch(API_CONFIG.baseUrl, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          
          // 验证响应格式
          if (!data.word || !data.story) {
            throw new Error('Invalid API response format');
          }

          return data as AIResult;
        } finally {
          clearTimeout(timeoutId);
        }
      }, opts);

      console.log('Recognition successful:', result);
      setIsRecognizing(false);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Recognition failed';
      console.error('Recognition error:', errorMessage);
      setError(errorMessage);
      setIsRecognizing(false);
      throw err;
    }
  }, [options]);

  return {
    recognizeImage,
    isRecognizing,
    error,
  };
}

