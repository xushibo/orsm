'use client';

import { useCamera } from '../src/hooks/use-camera';
import { CaptureButton } from '../src/components/capture-button';

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

  const handleCapture = () => {
    // 暂时没有功能，将在 Story 1.4 中实现
    console.log('Capture button clicked');
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
        />
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
      {permissionState === 'granted' && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <CaptureButton onCapture={handleCapture} />
        </div>
      )}
    </main>
  );
}