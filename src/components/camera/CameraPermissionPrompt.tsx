'use client';

import { useState } from 'react';

interface CameraPermissionPromptProps {
  onRequestCamera: () => void;
  isChinese?: boolean;
}

export function CameraPermissionPrompt({ onRequestCamera, isChinese = false }: CameraPermissionPromptProps) {
  const [internalIsChinese, setInternalIsChinese] = useState(isChinese);

  const toggleLanguage = () => {
    setInternalIsChinese(!internalIsChinese);
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 flex items-center justify-center p-4">
      <div className="text-center w-full max-w-sm">
        {/* 可爱的相机图标和装饰 */}
        <div className="relative mb-6">
          <div className="text-8xl mb-2 animate-bounce">📷</div>
          <div className="flex justify-center space-x-2">
            <span className="text-2xl animate-pulse">✨</span>
            <span className="text-2xl animate-pulse delay-100">🌟</span>
            <span className="text-2xl animate-pulse delay-200">✨</span>
          </div>
        </div>
        
        {/* 儿童友好的标题 */}
        <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          {internalIsChinese ? '🎭 故事魔法相机 🎭' : '🎭 Story Magic Camera 🎭'}
        </h1>
        
        {/* 可爱的描述文字 */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border-2 border-white/30">
          <p className="text-white text-lg font-medium leading-relaxed">
            {internalIsChinese 
              ? '📸 拍一拍，变魔法！\n🎨 让AI为你讲故事！' 
              : '📸 Take a photo, create magic!\n🎨 Let AI tell you a story!'
            }
          </p>
        </div>
        
        {/* 语言切换按钮 - 儿童友好设计 */}
        <div className="mb-4">
          <button
            onClick={toggleLanguage}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-xl text-lg border-2 border-white/30 hover:scale-105"
          >
            {internalIsChinese ? '🌍 Switch to English' : '🌍 切换到中文'}
          </button>
        </div>
        
        {/* 开始按钮 - 儿童友好设计 */}
        <button
          onClick={onRequestCamera}
          className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-2xl font-bold hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-xl text-xl border-2 border-white/30 hover:scale-105 animate-pulse"
        >
          {internalIsChinese ? '🚀 开始魔法之旅！' : '🚀 Start Magic Journey!'}
        </button>
        
        {/* 可爱的装饰元素 */}
        <div className="mt-6 flex justify-center space-x-4">
          <span className="text-2xl animate-bounce">🎈</span>
          <span className="text-2xl animate-bounce delay-100">🎪</span>
          <span className="text-2xl animate-bounce delay-200">🎈</span>
        </div>
      </div>
    </div>
  );
}
