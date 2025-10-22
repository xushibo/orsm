'use client';

import { useState, useEffect } from 'react';
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCapture = async () => {
    if (!videoRef.current || !stream) {
      console.log('Camera not ready');
      return;
    }

    console.log('=== CAPTURE STARTED ===');
    console.log('API Config:', API_CONFIG);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Use Mock:', process.env.NEXT_PUBLIC_USE_MOCK);

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

      // 检查视频尺寸
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      console.log('Video dimensions check:', {
        videoWidth,
        videoHeight,
        videoElementWidth: videoRef.current.clientWidth,
        videoElementHeight: videoRef.current.clientHeight,
        videoReadyState: videoRef.current.readyState
      });
      
      // 如果视频尺寸为 0，使用视频元素的显示尺寸
      let canvasWidth = videoWidth;
      let canvasHeight = videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        console.warn('Video dimensions are 0, using element dimensions');
        canvasWidth = videoRef.current.clientWidth || 720;
        canvasHeight = videoRef.current.clientHeight || 1280;
      }
      
      // 设置 canvas 尺寸
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // 将视频帧绘制到 canvas
      context.drawImage(videoRef.current, 0, 0, canvasWidth, canvasHeight);
      
      // 移动端 Safari 可能需要处理图片方向
      console.log('Canvas drawing completed:', {
        canvasWidth,
        canvasHeight,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight
      });
      
      // 移动端图片预处理：提高对比度和清晰度
      try {
        const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        
        console.log('Starting image preprocessing:', {
          imageDataLength: imageData.data.length,
          canvasWidth,
          canvasHeight
        });
        
        // 简单的对比度增强
        for (let i = 0; i < data.length; i += 4) {
          // 增强对比度
          data[i] = Math.min(255, data[i] * 1.2);     // R
          data[i + 1] = Math.min(255, data[i + 1] * 1.2); // G
          data[i + 2] = Math.min(255, data[i + 2] * 1.2); // B
          // Alpha 保持不变
        }
        
        context.putImageData(imageData, 0, 0);
        console.log('Image preprocessing completed successfully');
      } catch (preprocessingError) {
        console.warn('Image preprocessing failed, using original image:', preprocessingError);
        // 如果预处理失败，继续使用原始图片
      }

      // 转换为 Blob 用于发送到 Worker
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9); // 提高图片质量从 0.8 到 0.9
      });
      
      console.log('Photo captured successfully!');
      console.log('Image details:', {
        size: blob.size,
        type: blob.type,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight
      });
      
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
        isProduction: process.env.NODE_ENV === 'production',
        userAgent: navigator.userAgent,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      });

      // 创建 AbortController 用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      console.log('Making request to:', API_CONFIG.baseUrl);
      console.log('Request details:', {
        method: 'POST',
        url: API_CONFIG.baseUrl,
        bodyType: 'FormData',
        timeout: API_CONFIG.timeout
      });

      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

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

  // 处理故事文本，提取核心故事内容
  const processStory = (story: string): string => {
    // 移除 AI 生成故事时的额外说明文字
    const lines = story.split('\n');
    let coreStory = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // 查找包含引号的故事内容
      if (trimmedLine.includes('"') && !trimmedLine.includes('story') && !trimmedLine.includes('child')) {
        // 提取引号内的内容
        const match = trimmedLine.match(/"([^"]+)"/);
        if (match) {
          coreStory = match[1];
          break;
        }
      }
    }
    
    // 如果没有找到引号内容，返回原始故事的前半部分
    if (!coreStory) {
      const firstParagraph = story.split('\n\n')[0];
      coreStory = firstParagraph.replace(/Here is a simple.*?:/i, '').trim();
    }
    
    return coreStory || story;
  };

  // 自动朗读功能
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // 停止当前朗读
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // 停止朗读
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const closeResult = () => {
    stopSpeaking();
    setShowResult(false);
    setResult(null);
    setIsSpeaking(false);
  };

  // 移动端安全区域处理
  useEffect(() => {
    const updateSafeArea = () => {
      const buttonContainer = document.querySelector('.bottom-button-container') as HTMLElement;
      if (buttonContainer) {
        // 获取安全区域值
        const safeAreaBottom = getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-bottom') || '0px';
        
        // 如果没有 CSS 变量，尝试从环境变量获取
        if (safeAreaBottom === '0px') {
          const envSafeArea = getComputedStyle(document.documentElement)
            .getPropertyValue('env(safe-area-inset-bottom)') || '0px';
          
          if (envSafeArea !== '0px') {
            buttonContainer.style.paddingBottom = `calc(2rem + ${envSafeArea})`;
            buttonContainer.style.minHeight = `calc(80px + ${envSafeArea})`;
          }
        }
      }
    };

    // 初始设置
    updateSafeArea();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);
    
    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black no-zoom">
      {/* 相机视频流 */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedMetadata={() => {
            console.log('Video metadata loaded:', {
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight,
              duration: videoRef.current?.duration,
              readyState: videoRef.current?.readyState
            });
          }}
          onCanPlay={() => {
            console.log('Video can play:', {
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight,
              readyState: videoRef.current?.readyState
            });
          }}
          onResize={() => {
            console.log('Video resized:', {
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight
            });
          }}
          onError={(e) => {
            console.error('Video error:', e);
          }}
        />
      )}

      {/* 移动端相机界面覆盖层 */}
      {stream && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 顶部状态栏 */}
          <div className="absolute top-0 left-0 right-0 z-20 pt-safe">
            <div className="flex justify-between items-center px-4 py-2">
              <div className="text-white text-sm font-medium">
                📷 拍照识别
              </div>
              <div className="text-white text-xs opacity-75">
                {permissionState === 'granted' ? '✅ 已授权' : '⏳ 等待授权'}
              </div>
            </div>
          </div>

          {/* 拍照引导框 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative pointer-events-none">
              {/* 四个角的装饰 */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg pointer-events-none"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg pointer-events-none"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg pointer-events-none"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg pointer-events-none"></div>
              
              {/* 中心提示 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white/80 text-center">
                  <div className="text-2xl mb-2">📸</div>
                  <div className="text-sm">将物品放在框内</div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

      {/* 移动端拍照按钮区域 */}
      {permissionState === 'granted' && !isProcessing && (
        <div className="absolute bottom-0 left-0 right-0 z-30 pb-safe">
          <div className="flex flex-col items-center pb-8">
            {/* 拍照按钮 */}
            <div className="relative">
              <CaptureButton onCapture={handleCapture} />
              {/* 按钮周围的装饰环 - 使用pointer-events-none避免阻挡点击 */}
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse pointer-events-none"></div>
            </div>
            
            {/* 拍照提示文字 */}
            <div className="mt-4 text-center pointer-events-none">
              <div className="text-white text-sm font-medium mb-1">点击拍照</div>
              <div className="text-white/70 text-xs">AI 将识别物品并创作故事</div>
            </div>
          </div>
        </div>
      )}

      {/* 移动端加载动画 */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-lg rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl border border-white/20">
            {/* 动画图标 */}
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto relative">
                {/* 外圈旋转 */}
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"></div>
                {/* 内圈反向旋转 */}
                <div className="absolute inset-2 border-4 border-purple-300 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                {/* 中心图标 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl">🤖</div>
                </div>
              </div>
            </div>
            
            {/* 加载文字 */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI 正在识别中...</h3>
            <p className="text-gray-600 text-sm mb-4">请稍候，我们正在分析您的图片</p>
            
            {/* 进度指示器 */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            
            <div className="text-xs text-gray-500">这可能需要几秒钟时间</div>
          </div>
        </div>
      )}

      {/* 移动端结果弹窗 */}
      {showResult && result && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-lg rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/30 relative">
            {/* 关闭按钮 */}
            <button
              onClick={closeResult}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center text-gray-600 transition-colors"
            >
              ✕
            </button>

            {/* 成功图标 */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl mb-2">
                ✨
              </div>
              <h2 className="text-lg font-bold text-gray-800">识别成功！</h2>
            </div>

            {/* 识别结果 - 突出显示 */}
            <div className="mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-center">
                <div className="text-white text-xs mb-1 opacity-80">识别结果</div>
                <div className="text-white text-2xl font-bold">{result.word}</div>
              </div>
            </div>

            {/* 故事内容 */}
            <div className="mb-4">
              <div className="bg-white/80 rounded-xl p-3 border border-white/50">
                <div className="text-gray-700 text-sm leading-relaxed text-left">
                  {processStory(result.story)}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2">
              <button
                onClick={() => speakText(processStory(result.story))}
                disabled={isSpeaking}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSpeaking ? '🔊 朗读中...' : '🔊 朗读故事'}
              </button>
              <button
                onClick={closeResult}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg text-sm"
              >
                📸 继续拍照
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}