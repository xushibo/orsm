'use client';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export function LoadingSpinner({ message = 'AI is analyzing your image...', size = 'medium' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-lg rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl border border-white/20">
        {/* 动画图标 */}
        <div className="relative mb-6">
          <div className={`${sizeClasses[size]} mx-auto relative`}>
            {/* 外圈旋转 */}
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"></div>
            {/* 内圈反向旋转 */}
            <div 
              className="absolute inset-2 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            ></div>
            {/* 中心图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl">🤖</div>
            </div>
          </div>
        </div>
        
        {/* 加载文字 */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">{message}</h3>
        <p className="text-gray-600 text-sm mb-4">Please wait while we analyze your image</p>
        
        {/* 进度指示器 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"
            style={{ width: '60%' }}
          ></div>
        </div>
        
        <div className="text-xs text-gray-500">This may take a few seconds</div>
      </div>
    </div>
  );
}

