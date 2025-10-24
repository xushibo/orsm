'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
  showChinese?: boolean;
}

export function MobileResultModal({ result, onClose, onSpeak, isSpeaking = false, showChinese = false }: MobileResultModalProps) {
  const [internalShowChinese, setInternalShowChinese] = useState(showChinese);
  const storyContentRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 同步外部传入的showChinese状态
  useEffect(() => {
    setInternalShowChinese(showChinese);
  }, [showChinese]);

  // 获取中文故事 - 使用useCallback避免重复创建
  const getChineseStory = useCallback((story: string): string => {
    // 简单的中文故事生成逻辑
    const chineseStory = story.replace(/I can see/g, '我可以看到')
      .replace(/in this picture/g, '在这张图片中')
      .replace(/It's something interesting/g, '这是一个有趣的东西')
      .replace(/that tells its own story/g, '它讲述着自己的故事');
    return chineseStory;
  }, []);

  // 自动滚动功能
  useEffect(() => {
    if (isSpeaking && storyContentRef.current) {
      const scrollContainer = storyContentRef.current;
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll > 0) {
        // 计算滚动时间（基于文本长度，大约每100字符1秒）
        const textLength = internalShowChinese 
          ? (result.chineseStory || getChineseStory(result.story)).length
          : result.story.length;
        const scrollDuration = Math.max(3000, (textLength / 100) * 1000); // 最少3秒
        
        const startTime = Date.now();
        
        const scrollStep = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / scrollDuration, 1);
          
          // 使用缓动函数，开始快，结束慢
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const scrollTop = maxScroll * easeOut;
          
          scrollContainer.scrollTop = scrollTop;
          
          if (progress < 1 && isSpeaking) {
            scrollIntervalRef.current = setTimeout(scrollStep, 16); // 60fps
          }
        };
        
        scrollStep();
      }
    } else {
      // 停止滚动
      if (scrollIntervalRef.current) {
        clearTimeout(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
    
    // 清理函数
    return () => {
      if (scrollIntervalRef.current) {
        clearTimeout(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [isSpeaking, internalShowChinese, result.chineseStory, result.story, getChineseStory]);
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

  // 获取中文故事翻译 - 删除重复定义，使用上面的useCallback版本
  /*
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
  */

  // 处理英文故事文本
  const processStory = (story: string): string => {
    return story;
  };

  // 清理中文文本，移除拼音注释和解释
  const cleanChineseText = (text: string): string => {
    if (!text) return text;
    
    // 移除拼音注释 (如: (diàn fēi qiú))
    text = text.replace(/\([^)]*[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ][^)]*\)/g, '');
    
    // 移除 "Note:" 开头的解释部分
    text = text.replace(/Note:[\s\S]*$/i, '');
    
    // 移除 "*" 开头的解释行
    text = text.replace(/\*[^\n]*\n?/g, '');
    
    // 移除英文内容（保留中文字符）
    text = text.replace(/[a-zA-Z\s]+/g, '');
    
    // 移除多余的空白行
    text = text.replace(/\n\s*\n/g, '\n');
    
    // 移除首尾空白
    text = text.trim();
    
    return text;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6 w-full h-full flex flex-col">
        {/* 关闭按钮 - 儿童友好设计 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:scale-110"
          >
            ✕
          </button>
        </div>

        {/* 成功图标 - 儿童友好设计 */}
        <div className="text-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl mb-2 shadow-xl animate-bounce">
              🎉
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse delay-100">🌟</div>
          </div>
            <h2 className="text-xl font-bold text-purple-800 drop-shadow-sm">
              {showChinese ? '🎊 魔法成功！🎊' : '🎊 Magic Success! 🎊'}
            </h2>
        </div>

        {/* 识别结果 - 儿童友好设计 */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 rounded-3xl p-5 text-center shadow-xl border-4 border-white">
            <div className="text-white text-sm mb-2 font-bold">
              {showChinese ? '🔍 我发现了什么' : '🔍 What I Found'}
            </div>
            <div className={`text-white text-3xl font-bold ${showChinese ? 'font-chinese' : ''} drop-shadow-lg`}>
              {showChinese ? (result.chineseName || getChineseTranslation(result.word)) : result.word}
            </div>
            {!showChinese && (result.chineseName || getChineseTranslation(result.word)) && (
              <div className="text-white/90 text-lg mt-2 font-chinese">
                {result.chineseName || getChineseTranslation(result.word)}
              </div>
            )}
            <div className="mt-3 flex justify-center space-x-2">
              <span className="text-2xl animate-bounce">🎈</span>
              <span className="text-2xl animate-bounce delay-100">🎪</span>
              <span className="text-2xl animate-bounce delay-200">🎈</span>
            </div>
          </div>
        </div>

        {/* 故事内容 - 儿童友好设计 */}
        <div className="flex-1 mb-4 min-h-0">
          <div className="bg-gradient-to-br from-yellow-50 to-pink-50 rounded-2xl p-4 border-4 border-yellow-200 shadow-xl h-full">
            <div className="text-purple-800 text-sm leading-relaxed text-left h-full flex flex-col">
              <div className="font-bold text-pink-600 mb-3 text-sm flex items-center">
                <span className="text-lg mr-2">📚</span>
                {internalShowChinese ? '🎭 魔法故事 🎭' : '🎭 Magic Story 🎭'}
              </div>
              <div 
                ref={storyContentRef}
                className={`flex-1 overflow-y-auto ${internalShowChinese ? 'font-chinese' : ''} text-sm leading-relaxed bg-white/60 rounded-xl p-3 scroll-smooth`}
              >
                {internalShowChinese ? cleanChineseText(result.chineseStory || getChineseStory(result.story)) : processStory(result.story)}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 - 儿童友好设计 */}
        <div className="space-y-3 flex-shrink-0">
          {/* 语言切换按钮 */}
          <button
            onClick={() => setInternalShowChinese(!internalShowChinese)}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-xl text-sm border-2 border-white/30 hover:scale-105"
          >
            {internalShowChinese ? '🌍 Switch to English' : '🌍 切换到中文'}
          </button>
          
          {onSpeak && (
            <button
              onClick={() => {
                let textToSpeak;
                if (internalShowChinese) {
                  // 优先使用API返回的中文故事
                  if (result.chineseStory) {
                    textToSpeak = cleanChineseText(result.chineseStory);
                  } else {
                    // 使用静态翻译作为后备
                    textToSpeak = cleanChineseText(getChineseStory(result.story));
                  }
                } else {
                  textToSpeak = processStory(result.story);
                }
                
                console.log('Modal - internalShowChinese:', internalShowChinese);
                console.log('Modal - result.chineseStory:', result.chineseStory);
                console.log('Modal - textToSpeak:', textToSpeak);
                console.log('Modal - textToSpeak has Chinese:', /[\u4e00-\u9fff]/.test(textToSpeak));
                
                onSpeak(textToSpeak);
              }}
              disabled={isSpeaking}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-3 rounded-2xl font-bold hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm border-2 border-white/30 hover:scale-105"
            >
              {isSpeaking ? '🔊 Reading...' : (internalShowChinese ? '🔊 听故事' : '🔊 Listen to Story')}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white px-4 py-3 rounded-2xl font-bold hover:from-pink-500 hover:to-purple-600 transition-all duration-300 shadow-xl text-sm border-2 border-white/30 hover:scale-105 animate-pulse"
          >
            {showChinese ? '🚀 再拍一张！' : '🚀 Take Another!'}
          </button>
        </div>
      </div>
    </div>
  );
}

