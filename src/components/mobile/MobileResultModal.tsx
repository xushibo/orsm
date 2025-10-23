'use client';

interface AIResult {
  word: string;
  story: string;
  chineseName?: string;
  chineseStory?: string;
}

interface MobileResultModalProps {
  result: AIResult;
  onClose: () => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export function MobileResultModal({ result, onClose, onSpeak, isSpeaking = false }: MobileResultModalProps) {
  // 获取中文翻译
  const getChineseTranslation = (word: string): string => {
    const translations: { [key: string]: string } = {
      'cat': '猫',
      'dog': '狗',
      'car': '汽车',
      'tree': '树',
      'house': '房子',
      'book': '书',
      'ball': '球',
      'apple': '苹果',
      'flower': '花',
      'sun': '太阳',
      'bird': '鸟',
      'fish': '鱼',
      'bear': '熊',
      'rabbit': '兔子',
      'elephant': '大象',
      'lion': '狮子',
      'butterfly': '蝴蝶',
      'duck': '鸭子',
      'phone': '手机',
      'cup': '杯子',
      'hat': '帽子',
      'shoe': '鞋子',
      'chair': '椅子',
      'table': '桌子',
      'lamp': '台灯',
      'clock': '时钟',
      'key': '钥匙',
      'toy': '玩具',
      'bike': '自行车',
      'plane': '飞机',
      'boat': '船',
      'train': '火车',
      'bus': '公交车',
      'truck': '卡车',
      'motorcycle': '摩托车',
      'person': '人',
      'computer': '电脑',
      'keyboard': '键盘',
      'mouse': '鼠标',
      'monitor': '显示器',
      'bottle': '瓶子',
      'glass': '玻璃杯',
      'mug': '马克杯',
      'teapot': '茶壶',
      'pencil': '铅笔',
      'pen': '钢笔',
      'paper': '纸',
      'notebook': '笔记本',
      'shirt': '衬衫',
      'pants': '裤子',
      'dress': '裙子',
      'jacket': '夹克',
      'socks': '袜子',
      'gloves': '手套',
      'scarf': '围巾',
      'banana': '香蕉',
      'orange': '橙子',
      'grape': '葡萄',
      'strawberry': '草莓',
      'lemon': '柠檬',
      'cherry': '樱桃',
      'pear': '梨',
      'camera': '相机',
      'watch': '手表',
      'ring': '戒指',
      'necklace': '项链',
      'bracelet': '手镯',
      'earrings': '耳环',
      'umbrella': '雨伞',
      'bag': '包',
      'wallet': '钱包',
      'purse': '手提包',
      'backpack': '背包',
      'suitcase': '行李箱'
    };
    
    return translations[word.toLowerCase()] || word;
  };

  // 获取中文故事翻译
  const getChineseStory = (story: string): string => {
    const storyTranslations: { [key: string]: string } = {
      "I'm sorry, but I couldn't clearly identify what's in this picture. Please try taking a clearer photo with better lighting and make sure the object is clearly visible.": "抱歉，我无法清楚地识别图片中的内容。请尝试拍摄更清晰的照片，确保光线充足，物体清晰可见。",
      "A colorful book lies open on the desk. The book is full of wonderful stories to read.": "一本色彩丰富的书摊开在桌子上。这本书里充满了精彩的故事供人阅读。",
      "A cute cat is sitting quietly, looking around with curious eyes.": "一只可爱的猫安静地坐着，用好奇的眼神环顾四周。",
      "A beautiful flower blooms in the garden, bringing joy to everyone who sees it.": "一朵美丽的花在花园里绽放，给每个看到它的人带来快乐。",
      "A shiny red car is parked on the street, ready for a new adventure.": "一辆闪亮的红色汽车停在街上，准备开始新的冒险。",
      "A tall tree stands proudly, providing shade and shelter for all.": "一棵高大的树骄傲地矗立着，为所有人提供阴凉和庇护。",
      "A cozy house welcomes you home with warmth and comfort.": "一座舒适的房子用温暖和舒适欢迎你回家。",
      "A bright sun shines in the sky, bringing light and happiness to the world.": "明亮的太阳在天空中照耀，为世界带来光明和快乐。",
      "A playful dog runs around happily, spreading joy wherever it goes.": "一只顽皮的狗快乐地跑来跑去，无论走到哪里都传播着快乐。",
      "A beautiful bird sings a sweet melody in the morning air.": "一只美丽的鸟在晨风中唱着甜美的旋律。"
    };
    
    // 尝试找到完全匹配的翻译
    if (storyTranslations[story]) {
      return storyTranslations[story];
    }
    
    // 如果没有完全匹配，返回通用翻译
    return "这是一个关于" + getChineseTranslation(result.word) + "的有趣故事。让我们一起来探索这个奇妙的世界吧！";
  };

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
          <h2 className="text-lg font-bold text-gray-800">Recognition Successful!</h2>
        </div>

        {/* 识别结果 - 突出显示 */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-center">
            <div className="text-white text-xs mb-1 opacity-80">Recognition Result / 识别结果</div>
            <div className="text-white text-2xl font-bold">{result.word}</div>
            <div className="text-white/80 text-sm mt-1">{result.chineseName || getChineseTranslation(result.word)}</div>
          </div>
        </div>

        {/* 故事内容 */}
        <div className="mb-4">
          <div className="bg-white/80 rounded-xl p-3 border border-white/50">
            <div className="text-gray-700 text-sm leading-relaxed text-left mb-2">
              <div className="font-semibold text-blue-600 mb-1">English Story:</div>
              {processStory(result.story)}
            </div>
            <div className="text-gray-600 text-sm leading-relaxed text-left border-t border-gray-200 pt-2">
              <div className="font-semibold text-green-600 mb-1">中文故事:</div>
              {result.chineseStory || getChineseStory(result.story)}
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
              {isSpeaking ? '🔊 Reading...' : '🔊 Read Story'}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg text-sm"
          >
            📸 Continue Capturing
          </button>
        </div>
      </div>
    </div>
  );
}

