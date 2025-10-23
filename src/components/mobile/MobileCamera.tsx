'use client';

import { useRef, useState, useEffect } from 'react';
import { MobileCaptureButton } from './MobileCaptureButton';
import { MobileResultModal } from './MobileResultModal';
import { LoadingSpinner } from '../shared/LoadingSpinner';
// import { captureImageFromVideo, validateImageQuality } from '@/src/utils/image-processor';
import { applySafariVideoFixes, waitForSafariVideoReady, getSafariOptimizedConstraints, getFallbackConstraints } from '@/src/utils/safari-compatibility';
import { logDeviceInfo } from '@/src/utils/device-detector';
import { API_CONFIG } from '@/src/config/api';

interface AIResult {
  word: string;
  story: string;
}

export function MobileCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 记录设备信息
  useEffect(() => {
    logDeviceInfo();
  }, []);

  // 请求相机权限
  const requestCamera = async () => {
    try {
      console.log('=== Requesting mobile camera ===');
      
      // 首先尝试Safari优化的约束
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
      setStream(mediaStream);
      setPermissionState('granted');
      setError(null);

      // 应用Safari修复
      if (videoRef.current) {
        applySafariVideoFixes(videoRef.current);
        videoRef.current.srcObject = mediaStream;
        
        // 设置视频属性
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.setAttribute('webkit-playsinline', '');
        
        // 强制设置视频样式
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = '100%';
        videoRef.current.style.objectFit = 'cover';
        videoRef.current.style.backgroundColor = '#000';
        
        try {
          await videoRef.current.play();
          console.log('Video playback started');
        } catch (playError) {
          console.warn('Video play failed, but continuing:', playError);
        }
        
        // 等待视频准备就绪（不阻塞）
        try {
          await waitForSafariVideoReady(videoRef.current);
          console.log('Video is ready');
        } catch (readyError) {
          console.warn('Video ready check failed, but continuing:', readyError);
        }
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setPermissionState('denied');
      setError(err instanceof Error ? err.message : 'Failed to access camera');
    }
  };

  // 拍照并识别
  const handleCapture = async () => {
    if (!videoRef.current || !stream) {
      console.error('Camera not ready');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('=== Starting capture ===');

      // 使用和debug-mobile.html相同的简单方式
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // 检查视频尺寸
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      console.log('Video dimensions check:', {
        videoWidth,
        videoHeight,
        clientWidth: videoRef.current.clientWidth,
        clientHeight: videoRef.current.clientHeight,
        readyState: videoRef.current.readyState
      });
      
      // 如果视频尺寸为 0，使用视频元素的显示尺寸
      let canvasWidth = videoWidth;
      let canvasHeight = videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        console.warn('Video dimensions are 0, using element dimensions');
        canvasWidth = videoRef.current.clientWidth || 720;
        canvasHeight = videoRef.current.clientHeight || 1280;
      }
      
      // 确保最小尺寸
      if (canvasWidth < 100) canvasWidth = 720;
      if (canvasHeight < 100) canvasHeight = 1280;
      
      // 设置 canvas 尺寸
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // 将视频帧绘制到 canvas
      context.drawImage(videoRef.current, 0, 0, canvasWidth, canvasHeight);
      
      console.log('Canvas drawing completed:', {
        canvasWidth,
        canvasHeight,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight
      });

      // 图片预处理：增强对比度和亮度
      const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      const data = imageData.data;
      
      // 增强对比度 (1.2倍) 和亮度 (+10)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128 + 10));     // R
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128 + 10)); // G
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128 + 10)); // B
      }
      
      context.putImageData(imageData, 0, 0);
      
      // 转换为 Blob（Safari兼容版本）
      const blob = await new Promise<Blob>((resolve, reject) => {
        try {
          // 使用Safari兼容的toBlob方法
          if (canvas.toBlob) {
            canvas.toBlob((blob) => {
              if (blob) {
                console.log('Image enhancement applied, final size:', blob.size, 'bytes');
                resolve(blob);
              } else {
                reject(new Error('Failed to create image blob - toBlob returned null'));
              }
            }, 'image/jpeg', 0.8); // 降低质量以提高兼容性
          } else {
            // 如果toBlob不可用，使用dataURL方法
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            const byteString = atob(dataURL.split(',')[1]);
            const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            console.log('Image created via dataURL, size:', blob.size, 'bytes');
            resolve(blob);
          }
        } catch (error) {
          console.error('Canvas toBlob error:', error);
          reject(new Error('Failed to create image blob: ' + (error instanceof Error ? error.message : 'Unknown error')));
        }
      });

      console.log('=== Mobile Image Details ===');
      console.log('Image size:', blob.size, 'bytes');
      console.log('Image type:', blob.type);
      console.log('Canvas dimensions:', `${canvasWidth}x${canvasHeight}`);
      console.log('Video dimensions:', {
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        clientWidth: videoRef.current.clientWidth,
        clientHeight: videoRef.current.clientHeight
      });
      
      // 检查图片是否太小
      if (blob.size < 10000) {
        console.warn('WARNING: Image is very small (' + blob.size + ' bytes), this may cause recognition issues');
      }
      
      // 检查图片类型
      if (!blob.type.startsWith('image/')) {
        console.error('ERROR: Invalid image type:', blob.type);
      }
      
      console.log('===========================');

      console.log('Image captured, sending to API...');

      // 发送到API
      const formData = new FormData();
      formData.append('image', blob, 'mobile-capture.jpg');

      console.log('=== Sending to API ===');
      console.log('API URL:', API_CONFIG.baseUrl);
      const imageFile = formData.get('image') as File;
      console.log('FormData size:', imageFile?.size);
      console.log('FormData type:', imageFile?.type);

      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('API Error Data:', errorData);
          errorMessage = errorData.error || errorData.story || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          try {
            const errorText = await response.text();
            console.error('API Error Text:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to get error text:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const apiResult = await response.json();
      console.log('API result:', apiResult);

      if (!apiResult.word || !apiResult.story) {
        console.error('Invalid API response structure:', apiResult);
        throw new Error('Invalid API response');
      }

      setResult(apiResult);
      setShowResult(true);
      setIsProcessing(false);
    } catch (err) {
      console.error('Capture error:', err);
      setIsProcessing(false);
      
      // 更详细的错误信息
      let errorMessage = '未知错误';
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
      
      // 检查是否是网络错误
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = '网络连接失败，请检查网络连接或稍后重试';
      } else if (errorMessage.includes('API error: 500')) {
        errorMessage = '服务器内部错误，请稍后重试';
      } else if (errorMessage.includes('API error: 400')) {
        errorMessage = '图片格式不支持，请重新拍照';
      }
      
      alert(`识别失败: ${errorMessage}`);
    }
  };

  // 朗读故事
  const speakText = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // 关闭结果
  const closeResult = () => {
    setShowResult(false);
    setResult(null);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // 当stream变化时，确保video元素正确设置
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Setting video stream to video element');
      videoRef.current.srcObject = stream;
      
      // 确保视频属性正确设置
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.setAttribute('playsinline', '');
      videoRef.current.setAttribute('webkit-playsinline', '');
      
      // 强制设置样式
      videoRef.current.style.width = '100%';
      videoRef.current.style.height = '100%';
      videoRef.current.style.objectFit = 'cover';
      videoRef.current.style.backgroundColor = '#000';
      
      // 尝试播放
      videoRef.current.play().catch(console.warn);
    }
  }, [stream]);

  // 清理
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stream, isSpeaking]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black no-zoom">
      {/* 视频流 */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#000'
          }}
          onLoadedMetadata={() => {
            console.log('Video metadata loaded:', {
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight,
              readyState: videoRef.current?.readyState
            });
          }}
          onCanPlay={() => {
            console.log('Video can play');
          }}
          onError={(e) => {
            console.error('Video error:', e);
          }}
        />
      )}

      {/* 相机界面覆盖层 */}
      {stream && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 顶部状态栏 */}
          <div className="absolute top-0 left-0 right-0 z-20 pt-safe">
            <div className="flex justify-between items-center px-4 py-2">
              <div className="text-white text-sm font-medium">📷 拍照识别</div>
              <div className="text-white text-xs opacity-75">✅ 已授权</div>
            </div>
          </div>

          {/* 拍照引导框 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/80 text-center">
                  <div className="text-2xl mb-2">📸</div>
                  <div className="text-sm">将物品放在框内</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 未授权状态 */}
      {permissionState === 'prompt' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">📷</div>
            <h1 className="text-2xl font-bold text-white mb-2">物品识别故事机</h1>
            <p className="text-white/80 mb-6">拍照识别物品，AI为你创作故事</p>
            <button
              onClick={requestCamera}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              启动相机
            </button>
          </div>
        </div>
      )}

      {/* 权限被拒绝 */}
      {permissionState === 'denied' && (
        <div className="absolute inset-0 bg-red-900 flex items-center justify-center p-4">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold mb-2">相机访问被拒绝</h2>
            <p className="mb-6">{error || '请在浏览器设置中允许相机访问'}</p>
            <button
              onClick={requestCamera}
              className="bg-white text-red-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* 拍照按钮 */}
      {permissionState === 'granted' && !isProcessing && (
        <MobileCaptureButton onCapture={handleCapture} />
      )}

      {/* 加载动画 */}
      {isProcessing && <LoadingSpinner />}

      {/* 结果弹窗 */}
      {showResult && result && (
        <MobileResultModal
          result={result}
          onClose={closeResult}
          onSpeak={speakText}
          isSpeaking={isSpeaking}
        />
      )}
    </main>
  );
}

