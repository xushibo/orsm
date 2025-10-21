'use client';

import { useState } from 'react';
import { useCamera } from '../src/hooks/use-camera';
import { CaptureButton } from '../src/components/capture-button';
import { API_CONFIG } from '../src/config/api';

interface AIResult {
  word: string;
  story: string;
}

export default function Home() {
  const { 
    permissionState, 
    stream, 
    error, 
    isLoading, 
    isHttps,
    videoRef, 
    requestCameraPermission 
  } = useCamera();

  // 添加状态管理
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCapture = async () => {
    if (!videoRef.current || !stream) {
      console.log('Camera not ready');
      return;
    }

    try {
      // 开始处理状态
      setIsProcessing(true);
      
      // 创建 canvas 元素来捕获视频帧
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Failed to get canvas context');
        setIsProcessing(false);
        return;
      }

      // 设置 canvas 尺寸与视频相同
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // 将视频帧绘制到 canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // 转换为 Blob 用于发送到 Worker
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.8);
      });
      
      console.log('Photo captured successfully!');
      console.log('Image size:', blob.size, 'bytes');
      
      // 发送到 Worker
      await sendToWorker(blob);
      
    } catch (error) {
      console.error('Failed to capture photo:', error);
      setIsProcessing(false);
      alert('Failed to capture photo. Please try again.');
    }
  };

  const sendToWorker = async (imageBlob: Blob, retryCount = 0) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'captured-image.jpg');

      console.log('Sending image to backend:', {
        size: imageBlob.size,
        type: imageBlob.type,
        retry: retryCount,
        url: API_CONFIG.baseUrl,
        environment: process.env.NODE_ENV,
        useMock: process.env.NEXT_PUBLIC_USE_MOCK,
        isProduction: process.env.NODE_ENV === 'production'
      });

      // 创建 AbortController 用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      
      // 验证响应格式
      if (!result.word || !result.story) {
        throw new Error('Invalid response format from backend');
      }
      
      // 设置结果并显示弹窗
      setResult(result);
      setShowResult(true);
      setIsProcessing(false);

    } catch (error) {
      console.error('Failed to send image to backend:', error);
      
      // 重试逻辑
      if (retryCount < API_CONFIG.retries && !(error instanceof Error && error.name === 'AbortError')) {
        console.log(`Retrying... (${retryCount + 1}/${API_CONFIG.retries})`);
        setTimeout(() => {
          sendToWorker(imageBlob, retryCount + 1);
        }, 1000 * (retryCount + 1)); // 递增延迟
        return;
      }
      
      setIsProcessing(false);
      
      // 显示更友好的错误信息
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`Failed to process image: ${errorMessage}\n\nPlease try again.`);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setResult(null);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* 相机视频流 */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedMetadata={() => {
            console.log('Video metadata loaded');
            console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          }}
          onCanPlay={() => {
            console.log('Video can play');
          }}
          onError={(e) => {
            console.error('Video error:', e);
          }}
        />
      )}

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs p-2 rounded z-20">
          <div>Permission: {permissionState}</div>
          <div>Stream: {stream ? 'Yes' : 'No'}</div>
          <div>HTTPS: {isHttps ? 'Yes' : 'No'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* HTTPS 检查界面 */}
      {!isHttps && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-white p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">HTTPS Required</h1>
            <p className="text-lg mb-8 opacity-90">
              Camera access requires HTTPS. Please access this app through HTTPS or use localhost for development.
            </p>
            <div className="bg-white/20 rounded-lg p-4 text-sm">
              <p className="mb-2">For mobile testing:</p>
              <p className="font-mono text-xs break-all">
                https://your-domain.com
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 权限请求界面 */}
      {permissionState === 'prompt' && isHttps && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Object Recognition Story Machine</h1>
            <p className="text-lg mb-8 opacity-90">
              We need camera access to help you identify objects and create amazing stories!
            </p>
            <button
              onClick={requestCameraPermission}
              disabled={isLoading}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {isLoading ? 'Requesting Access...' : 'Allow Camera Access'}
            </button>
            <p className="text-sm mt-4 opacity-75">
              Tap the button above to enable camera access
            </p>
          </div>
        </div>
      )}

      {/* 权限被拒绝界面 */}
      {permissionState === 'denied' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Camera Access Denied</h1>
            <p className="text-lg mb-8 opacity-90">
              {error || 'Camera access is required to use this app. Please enable camera permissions in your browser settings.'}
            </p>
            <button
              onClick={requestCameraPermission}
              className="bg-white text-red-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* 拍照按钮 - 只在相机权限被授予时显示 */}
      {permissionState === 'granted' && !isProcessing && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <CaptureButton onCapture={handleCapture} />
        </div>
      )}

      {/* 加载动画 */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI 正在分析...</h3>
            <p className="text-gray-600">请稍等，我们正在识别物品并创作故事</p>
          </div>
        </div>
      )}

      {/* 结果弹窗 */}
      {showResult && result && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
            {/* 关闭按钮 */}
            <button
              onClick={closeResult}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 内容 */}
            <div className="text-center">
              {/* 图标 */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* 英文单词 */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">识别结果</h2>
                <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                  <span className="text-4xl font-bold text-blue-600">{result.word}</span>
                </div>
              </div>

              {/* 故事 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">为你创作的故事</h3>
                <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                  <p className="text-gray-700 leading-relaxed text-left">{result.story}</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={closeResult}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  继续拍照
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}