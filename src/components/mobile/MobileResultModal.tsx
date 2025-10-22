'use client';

interface AIResult {
  word: string;
  story: string;
}

interface MobileResultModalProps {
  result: AIResult;
  onClose: () => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export function MobileResultModal({ result, onClose, onSpeak, isSpeaking = false }: MobileResultModalProps) {
  const processStory = (story: string): string => {
    const lines = story.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('"') && !trimmedLine.includes('story') && !trimmedLine.includes('child')) {
        const match = trimmedLine.match(/"([^"]+)"/);
        if (match) {
          return match[1];
        }
      }
    }
    
    const cleanedStory = story
      .replace(/^Here is.*?:/i, '')
      .replace(/^This is.*?:/i, '')
      .replace(/\(Note:.*?\)/gi, '')
      .trim();
    
    return cleanedStory || story;
  };

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-lg rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/30 relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center text-gray-600 transition-colors"
        >
          ✕
        </button>

        {/* 成功图标 */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl mb-2">
            ✨
          </div>
          <h2 className="text-lg font-bold text-gray-800">识别成功！</h2>
        </div>

        {/* 识别结果 - 突出显示 */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-center">
            <div className="text-white text-xs mb-1 opacity-80">识别结果</div>
            <div className="text-white text-2xl font-bold">{result.word}</div>
          </div>
        </div>

        {/* 故事内容 */}
        <div className="mb-4">
          <div className="bg-white/80 rounded-xl p-3 border border-white/50">
            <div className="text-gray-700 text-sm leading-relaxed text-left">
              {processStory(result.story)}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          {onSpeak && (
            <button
              onClick={() => onSpeak(processStory(result.story))}
              disabled={isSpeaking}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSpeaking ? '🔊 朗读中...' : '🔊 朗读故事'}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg text-sm"
          >
            📸 继续拍照
          </button>
        </div>
      </div>
    </div>
  );
}

