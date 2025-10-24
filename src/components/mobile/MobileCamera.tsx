'use client';

import { useRef, useState, useEffect } from 'react';
import { MobileCaptureButton } from './MobileCaptureButton';
import { MobileResultModal } from './MobileResultModal';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { applySafariVideoFixes, waitForSafariVideoReady, getSafariOptimizedConstraints, getFallbackConstraints } from '@/src/utils/safari-compatibility';
import { logDeviceInfo } from '@/src/utils/device-detector';
import { captureImageFromVideo, validateImageQuality } from '@/src/utils/image-processor';
import { API_CONFIG } from '@/src/config/api';
import { CANVAS_CONFIG } from '@/src/utils/constants';
import { getUserFriendlyError, ERROR_MESSAGES } from '@/src/utils/error-messages';

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
  const [isChinese, setIsChinese] = useState(false);

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

      // 使用统一的图片捕获工具
      const blob = await captureImageFromVideo(videoRef.current, {
        quality: CANVAS_CONFIG.DEFAULT_QUALITY,
        enhanceContrast: true,
        format: 'image/jpeg'
      });

      console.log('=== Mobile Image Details ===');
      console.log('Image size:', blob.size, 'bytes');
      console.log('Image type:', blob.type);
      
      // 验证图片质量
      if (!validateImageQuality(blob)) {
        throw new Error(ERROR_MESSAGES.INVALID_IMAGE_QUALITY);
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

  // Safari语音加载辅助函数
  const loadVoicesForSafari = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Safari需要等待语音加载
        const checkVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve(voices);
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        checkVoices();
      }
    });
  };

  // 朗读故事
  const speakText = async (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    console.log('Speech text:', text);
    console.log('Text length:', text.length);
    console.log('First 50 chars:', text.substring(0, 50));

    // 检测文本语言
    const isChinese = /[\u4e00-\u9fff]/.test(text);
    console.log('Is Chinese text:', isChinese);
    console.log('Chinese characters found:', text.match(/[\u4e00-\u9fff]/g));
    
    // 检测Safari浏览器
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('Is Safari:', isSafari);

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Safari特殊处理
    if (isSafari && isChinese) {
      // Safari中文朗读需要特殊设置
      utterance.lang = 'zh-CN';
      utterance.rate = 0.84; // Safari中文朗读速度：0.6 * 1.4 = 0.84 (快40%)
      utterance.pitch = 0.8; // 降低音调
      utterance.volume = 0.9;
      
      // 异步获取中文语音
      loadVoicesForSafari().then(voices => {
        const chineseVoice = voices.find(voice => 
          voice.lang.startsWith('zh') || 
          voice.name.includes('Chinese') ||
          voice.name.includes('中文')
        );
        
        if (chineseVoice) {
          utterance.voice = chineseVoice;
          console.log('Using Chinese voice:', chineseVoice.name);
        }
        
        // 延迟开始朗读
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 200);
      });
      
      return; // 提前返回，避免执行下面的代码
    } else {
      // 非Safari或英文内容
      utterance.lang = isChinese ? 'zh-CN' : 'en-US';
      utterance.rate = isChinese ? 1.008 : 0.72; // 中文快40%: 0.72 * 1.4 = 1.008, 英文保持0.72
      utterance.pitch = 1.0;
    }

    console.log('Speech language set to:', utterance.lang);
    console.log('Speech rate:', utterance.rate);
    console.log('Speech pitch:', utterance.pitch);

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsSpeaking(false);
    };

    // 开始朗读（非Safari中文情况）
    window.speechSynthesis.speak(utterance);
  };

  // 切换语言
  const toggleLanguage = () => {
    setIsChinese(!isChinese);
  };

  // 关闭结果 - 通过跳转到结果页面再返回来解决黑屏问题
  const closeResult = () => {
    setShowResult(false);
    setResult(null);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
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

  // 视频流监控 - 确保视频始终在播放
  useEffect(() => {
    if (stream && videoRef.current && !showResult) {
      const video = videoRef.current;
      
      const checkVideoPlayback = () => {
        if (video && stream && !showResult) {
          if (video.paused || video.ended) {
            console.log('Video is paused/ended, attempting to restart');
            video.play().catch(console.warn);
          }
        }
      };
      
      // 定期检查视频播放状态
      const interval = setInterval(checkVideoPlayback, 1000);
      
      // 监听视频事件
      const handleVideoError = () => {
        console.log('Video error detected, attempting to restart');
        setTimeout(() => {
          if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.warn);
          }
        }, 500);
      };
      
      video.addEventListener('error', handleVideoError);
      video.addEventListener('pause', checkVideoPlayback);
      
      return () => {
        clearInterval(interval);
        video.removeEventListener('error', handleVideoError);
        video.removeEventListener('pause', checkVideoPlayback);
      };
    }
  }, [stream, showResult]);

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
              <div className="text-white text-sm font-medium">📷 Photo Recognition</div>
              <div className="text-white text-xs opacity-75">✅ Authorized</div>
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
                  <div className="text-sm">Place object in frame</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 未授权状态 */}
      {permissionState === 'prompt' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
          {/* 语言切换按钮 */}
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleLanguage}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
            >
              {isChinese ? '中文' : 'EN'}
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">📷</div>
            <h1 className="text-2xl font-bold text-white mb-2">Story Machine</h1>
            <p className="text-white/80 mb-6">
              {isChinese 
                ? '拍照识别物体，获取AI生成的故事' 
                : 'Take a photo to identify objects and get AI-generated stories'
              }
            </p>
            <button
              onClick={requestCamera}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              {isChinese ? '启动相机' : 'Start Camera'}
            </button>
          </div>
        </div>
      )}

      {/* 权限被拒绝 */}
      {permissionState === 'denied' && (
        <div className="absolute inset-0 bg-red-900 flex items-center justify-center p-4">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold mb-2">Camera Access Denied</h2>
            <p className="mb-6">{error || 'Please allow camera access in your browser settings'}</p>
            <button
              onClick={requestCamera}
              className="bg-white text-red-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Retry
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

