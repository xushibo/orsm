'use client';

import { useState, useEffect } from 'react';
import { MobileCaptureButton } from './MobileCaptureButton';
import { MobileResultModal } from './MobileResultModal';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { CameraPermissionPrompt } from '../camera/CameraPermissionPrompt';
import { CameraOverlay } from '../camera/CameraOverlay';
import { PermissionDenied } from '../camera/PermissionDenied';
import { logDeviceInfo } from '@/src/utils/device-detector';
import { API_CONFIG } from '@/src/config/api';
import { getUserFriendlyError } from '@/src/utils/error-messages';
import { useCameraPermission } from '@/src/hooks/use-camera-permission';
import { useVideoStream } from '@/src/hooks/use-video-stream';
import { useSpeechSynthesis } from '@/src/hooks/use-speech-synthesis';
import { useImageCapture } from '@/src/hooks/use-image-capture';

interface AIResult {
  word: string;
  story: string;
  chineseName?: string;
  chineseStory?: string;
}

export function MobileCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isChinese, setIsChinese] = useState(false);

  // Custom hooks
  const { permissionState, error, requestCamera, resetPermission } = useCameraPermission();
  const { videoRef, setupVideo, cleanupVideo, isVideoReady } = useVideoStream();
  const { isSpeaking, speakText, stopSpeaking } = useSpeechSynthesis();
  const { captureImage } = useImageCapture();

  // 记录设备信息
  useEffect(() => {
    logDeviceInfo();
  }, []);

  // 处理相机权限请求
  const handleRequestCamera = async () => {
    const mediaStream = await requestCamera();
    if (mediaStream) {
      setStream(mediaStream);
      await setupVideo(mediaStream);
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

      // 使用图片捕获Hook
      const blob = await captureImage(videoRef.current);
      
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
      
      // 使用统一的错误处理
      const errorMessage = getUserFriendlyError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      
      alert(`Recognition failed: ${errorMessage}`);
    }
  };

  // 关闭结果 - 通过跳转到结果页面再返回来解决黑屏问题
  const closeResult = () => {
    setShowResult(false);
    setResult(null);
    stopSpeaking();
    
    // 通过重新加载页面来彻底解决黑屏问题
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // 当stream变化时，确保video元素正确设置
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Setting video stream to video element');
      const video = videoRef.current;
      
      // 完全重置视频元素
      video.pause();
      video.srcObject = null;
      
      // 短暂延迟后重新设置
      setTimeout(() => {
        if (stream && videoRef.current) {
          const video = videoRef.current;
          
          // 重新设置视频流
          video.srcObject = stream;
          
          // 确保视频属性正确设置
          video.muted = true;
          video.playsInline = true;
          video.setAttribute('playsinline', '');
          video.setAttribute('webkit-playsinline', '');
          
          // 强制设置样式
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'cover';
          video.style.backgroundColor = '#000';
          
          // 强制加载并播放
          video.load();
          video.play().catch((error) => {
            console.warn('Initial video play failed:', error);
            // 重试播放
            setTimeout(() => {
              video.play().catch(console.warn);
            }, 100);
          });
        }
      }, 50);
    }
  }, [stream]);

  // 清理
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopSpeaking();
      cleanupVideo();
    };
  }, [stream, stopSpeaking, cleanupVideo]);

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
      {stream && <CameraOverlay isChinese={isChinese} />}

      {/* 未授权状态 - 儿童友好设计 */}
      {permissionState === 'prompt' && (
        <CameraPermissionPrompt 
          onRequestCamera={handleRequestCamera}
          isChinese={isChinese}
        />
      )}

      {/* 权限被拒绝 */}
      {permissionState === 'denied' && (
        <PermissionDenied 
          error={error}
          onRetry={handleRequestCamera}
        />
      )}

      {/* 拍照按钮 */}
      {permissionState === 'granted' && !isProcessing && (
        <MobileCaptureButton onCapture={handleCapture} />
      )}

      {/* 加载动画 */}
      {isProcessing && <LoadingSpinner />}

      {/* 结果页面 - 全屏显示 */}
      {showResult && result && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col z-50">
          <MobileResultModal
            result={result}
            onClose={closeResult}
            onSpeak={speakText}
            isSpeaking={isSpeaking}
            showChinese={isChinese}
          />
        </div>
      )}
    </main>
  );
}