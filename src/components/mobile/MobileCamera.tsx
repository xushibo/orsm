'use client';

import { useRef, useState, useEffect } from 'react';
import { MobileCaptureButton } from './MobileCaptureButton';
import { MobileResultModal } from './MobileResultModal';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { captureImageFromVideo, validateImageQuality } from '@/src/utils/image-processor';
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

      // 使用改进的图片捕获
      const blob = await captureImageFromVideo(videoRef.current, {
        quality: 0.92,
        maxWidth: 1920,
        maxHeight: 1080,
        enhanceContrast: true,
        format: 'image/jpeg',
      });

      // 验证图片质量
      if (!validateImageQuality(blob, 10000)) {
        throw new Error('Captured image quality is too low');
      }

      console.log('Image captured, sending to API...');

      // 发送到API
      const formData = new FormData();
      formData.append('image', blob, 'mobile-capture.jpg');

      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const apiResult = await response.json();
      console.log('API result:', apiResult);

      if (!apiResult.word || !apiResult.story) {
        throw new Error('Invalid API response');
      }

      setResult(apiResult);
      setShowResult(true);
      setIsProcessing(false);
    } catch (err) {
      console.error('Capture error:', err);
      setIsProcessing(false);
      alert(`识别失败: ${err instanceof Error ? err.message : '未知错误'}`);
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

