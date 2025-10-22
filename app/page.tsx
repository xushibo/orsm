'use client';

import { useState, useRef, useEffect } from 'react';

interface AIResult {
  word: string;
  story: string;
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 启动相机
  const startCamera = async () => {
    try {
      setError(null);
      console.log('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      console.log('Camera access granted');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setError('无法访问相机，请检查权限设置');
    }
  };

  // 拍照识别
  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('相机未准备就绪');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      console.log('Starting image capture...');

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('无法获取画布上下文');
      }

      // 设置画布尺寸
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;

      // 绘制视频帧到画布
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // 转换为Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('无法创建图片'));
          }
        }, 'image/jpeg', 0.9);
      });

      console.log('Image captured, size:', blob.size, 'bytes');

      // 发送到API
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      console.log('Sending to API...');
      const response = await fetch('https://orsm-ai.xushibo.cn', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      const apiResult = await response.json();
      console.log('API response:', apiResult);

      if (!apiResult.word || !apiResult.story) {
        throw new Error('API响应格式错误');
      }

      setResult(apiResult);
      setIsProcessing(false);
    } catch (err) {
      console.error('Capture failed:', err);
      setError(err instanceof Error ? err.message : '识别失败');
      setIsProcessing(false);
    }
  };

  // 朗读故事
  const speakStory = () => {
    if (!result) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(result.story);
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
    setResult(null);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // 清理资源
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
    <div className="min-h-screen bg-black text-white">
      {/* 视频流 */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-screen object-cover"
        />
      )}

      {/* 隐藏的画布 */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 主界面 */}
      {!stream && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <div className="text-8xl mb-6">📷</div>
            <h1 className="text-3xl font-bold mb-4">物品识别故事机</h1>
            <p className="text-gray-300 mb-8">拍照识别物品，AI为你创作故事</p>
            <button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors"
            >
              启动相机
            </button>
          </div>
        </div>
      )}

      {/* 相机界面 */}
      {stream && (
        <div className="absolute inset-0">
          {/* 拍照引导框 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 border-2 border-white/50 rounded-2xl relative">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/80 text-center">
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-sm">将物品放在框内</div>
                </div>
              </div>
            </div>
          </div>

          {/* 拍照按钮 */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={captureAndRecognize}
              disabled={isProcessing}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 结果弹窗 */}
      {result && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold">识别成功！</h2>
            </div>
            
            <div className="mb-6">
              <div className="text-lg font-semibold mb-2">识别结果：{result.word}</div>
              <div className="text-gray-700 leading-relaxed">{result.story}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={speakStory}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {isSpeaking ? '停止朗读' : '朗读故事'}
              </button>
              <button
                onClick={closeResult}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}