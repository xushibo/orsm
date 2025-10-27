'use client';

interface CameraOverlayProps {
  isChinese?: boolean;
}

export function CameraOverlay({ isChinese = false }: CameraOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 顶部状态栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="text-white text-sm font-medium">📷 Photo Recognition</div>
          <div className="text-white text-xs opacity-75">✅ Authorized</div>
        </div>
      </div>

      {/* 拍照引导框 - 儿童友好设计 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 border-4 border-yellow-300 rounded-3xl relative shadow-2xl bg-gradient-to-br from-yellow-100/20 to-orange-100/20">
          {/* 可爱的角落装饰 */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-pink-400 rounded-tl-xl"></div>
          <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-pink-400 rounded-tr-xl"></div>
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-pink-400 rounded-bl-xl"></div>
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-pink-400 rounded-br-xl"></div>
          
          {/* 中心引导内容 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-3 animate-bounce">📸</div>
              <div className="text-lg font-bold drop-shadow-lg">
                {isChinese ? '把东西放在框框里！' : 'Put your object here!'}
              </div>
              <div className="text-sm mt-2 opacity-90">
                {isChinese ? '✨ 准备变魔法啦！' : '✨ Ready for magic!'}
              </div>
            </div>
          </div>
          
          {/* 可爱的装饰星星 */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xl animate-pulse">⭐</div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xl animate-pulse delay-100">⭐</div>
        </div>
      </div>
    </div>
  );
}
