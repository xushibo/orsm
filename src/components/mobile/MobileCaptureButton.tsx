'use client';

interface MobileCaptureButtonProps {
  onCapture: () => void;
  disabled?: boolean;
}

export function MobileCaptureButton({ onCapture, disabled = false }: MobileCaptureButtonProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pb-safe">
      <div className="flex flex-col items-center pb-8">
        {/* 拍照按钮 */}
        <div className="relative">
          <button
            onClick={onCapture}
            disabled={disabled}
            className={`
              relative w-20 h-20 rounded-full border-4 border-white
              bg-gradient-to-br from-blue-400 to-blue-600
              shadow-2xl flex items-center justify-center
              focus:outline-none focus:ring-4 focus:ring-blue-300
              transition-all duration-200 touch-manipulation
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
            `}
          >
            {/* 内圆 */}
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700" />
            </div>
          </button>
          
          {/* 按钮周围的装饰环 - pointer-events-none避免阻挡点击 */}
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse pointer-events-none"></div>
        </div>
        
        {/* 拍照提示文字 */}
        <div className="mt-4 text-center pointer-events-none">
          <div className="text-white text-sm font-medium mb-1">Tap to Capture</div>
          <div className="text-white/70 text-xs">AI will identify objects and create stories</div>
        </div>
      </div>
    </div>
  );
}

