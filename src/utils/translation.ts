/**
 * Translation utilities
 * Handles word and story translations between English and Chinese
 */

/**
 * English to Chinese word translation mapping
 */
const WORD_TRANSLATIONS: Record<string, string> = {
  'UMBRELLA': '雨伞',
  'INDIGO FINCH': '靛蓝雀',
  'CAT': '猫',
  'DOG': '狗',
  'CAR': '汽车',
  'TREE': '树',
  'MOUSE': '鼠标',
  'BOTTLE': '瓶子',
  'PHONE': '手机',
  'BOOK': '书',
  'BALL': '球',
  'APPLE': '苹果',
  'COMPUTER': '电脑',
  'LAPTOP': '笔记本电脑',
  'KEYBOARD': '键盘',
  'MONITOR': '显示器',
  'CUP': '杯子',
  'CHAIR': '椅子',
  'TABLE': '桌子',
  'LAMP': '台灯',
  'CLOCK': '时钟',
  'KEY': '钥匙',
  'WATCH': '手表',
  'CAMERA': '相机',
  'BAG': '包',
  'HAT': '帽子',
  'SHOE': '鞋子',
  'HOUSE': '房子',
  'FLOWER': '花',
  'SUN': '太阳',
  'BIRD': '鸟',
  'FISH': '鱼',
  'BEAR': '熊',
  'RABBIT': '兔子',
  'ELEPHANT': '大象',
  'LION': '狮子',
  'BUTTERFLY': '蝴蝶',
  'DUCK': '鸭子',
  'TOY': '玩具',
  'BIKE': '自行车',
  'PLANE': '飞机',
  'BOAT': '船',
  'TRAIN': '火车',
  'BUS': '公交车',
  'TRUCK': '卡车',
  'MOTORCYCLE': '摩托车',
  'PERSON': '人',
  'GLASS': '玻璃杯',
  'MUG': '马克杯',
  'TEAPOT': '茶壶',
  'PENCIL': '铅笔',
  'PEN': '钢笔',
  'PAPER': '纸',
  'NOTEBOOK': '笔记本',
  'SHIRT': '衬衫',
  'PANTS': '裤子',
  'DRESS': '裙子',
  'JACKET': '夹克',
  'SOCKS': '袜子',
  'GLOVES': '手套',
  'SCARF': '围巾',
  'BANANA': '香蕉',
  'ORANGE': '橙子',
  'GRAPE': '葡萄',
  'STRAWBERRY': '草莓',
  'LEMON': '柠檬',
  'CHERRY': '樱桃',
  'PEAR': '梨',
  'RING': '戒指',
  'NECKLACE': '项链',
  'BRACELET': '手镯',
  'EARRINGS': '耳环',
  'WALLET': '钱包',
  'PURSE': '手提包',
  'BACKPACK': '背包',
  'SUITCASE': '行李箱',
};

/**
 * Translate English word to Chinese
 */
export function translateWordToChinese(englishWord: string): string {
  const upperWord = englishWord.toUpperCase();
  return WORD_TRANSLATIONS[upperWord] || englishWord;
}

/**
 * Generate fallback Chinese story for a given object
 */
export function generateFallbackChineseStory(objectName: string): string {
  const chineseName = translateWordToChinese(objectName);
  return `这是一个关于${chineseName}的有趣故事。${chineseName}是我们生活中的一部分，每个物品都有自己的用途和价值。让我们学会珍惜身边的每一件东西！`;
}

/**
 * Generate fallback Chinese translation object
 */
export function generateFallbackChineseTranslation(objectName: string): {
  chineseName: string;
  chineseStory: string;
} {
  return {
    chineseName: translateWordToChinese(objectName),
    chineseStory: generateFallbackChineseStory(objectName),
  };
}

/**
 * Simple English to Chinese story translation
 */
export function translateStoryToChinese(englishStory: string): string {
  const storyTranslations: Record<string, string> = {
    "I'm sorry, but I couldn't clearly identify what's in this picture. Please try taking a clearer photo with better lighting and make sure the object is clearly visible.": 
      "抱歉，我无法清楚地识别图片中的内容。请尝试拍摄更清晰的照片，确保光线充足，物体清晰可见。",
    "A colorful book lies open on the desk. The book is full of wonderful stories to read.": 
      "一本色彩丰富的书摊开在桌子上。这本书里充满了精彩的故事供人阅读。",
    "A cute cat is sitting quietly, looking around with curious eyes.": 
      "一只可爱的猫安静地坐着，用好奇的眼神环顾四周。",
    "A beautiful flower blooms in the garden, bringing joy to everyone who sees it.": 
      "一朵美丽的花在花园里绽放，给每个看到它的人带来快乐。",
    "A shiny red car is parked on the street, ready for a new adventure.": 
      "一辆闪亮的红色汽车停在街上，准备开始新的冒险。",
    "A tall tree stands proudly, providing shade and shelter for all.": 
      "一棵高大的树骄傲地矗立着，为所有人提供阴凉和庇护。",
    "A cozy house welcomes you home with warmth and comfort.": 
      "一座舒适的房子用温暖和舒适欢迎你回家。",
    "A bright sun shines in the sky, bringing light and happiness to the world.": 
      "明亮的太阳在天空中照耀，为世界带来光明和快乐。",
    "A playful dog runs around happily, spreading joy wherever it goes.": 
      "一只顽皮的狗快乐地跑来跑去，无论走到哪里都传播着快乐。",
    "A beautiful bird sings a sweet melody in the morning air.": 
      "一只美丽的鸟在晨风中唱着甜美的旋律。",
  };
  
  // Try to find exact match first
  if (storyTranslations[englishStory]) {
    return storyTranslations[englishStory];
  }
  
  // Simple word-by-word translation for common patterns
  let chineseStory = englishStory
    .replace(/I can see/g, '我可以看到')
    .replace(/in this picture/g, '在这张图片中')
    .replace(/It's something interesting/g, '这是一个有趣的东西')
    .replace(/that tells its own story/g, '它讲述着自己的故事')
    .replace(/A /g, '一个')
    .replace(/The /g, '这个')
    .replace(/is /g, '是')
    .replace(/are /g, '是')
    .replace(/and /g, '和')
    .replace(/with /g, '带着')
    .replace(/in /g, '在')
    .replace(/on /g, '在')
    .replace(/at /g, '在')
    .replace(/to /g, '到')
    .replace(/for /g, '为')
    .replace(/of /g, '的')
    .replace(/the /g, '这个')
    .replace(/a /g, '一个')
    .replace(/an /g, '一个');
  
  return chineseStory || generateFallbackChineseStory('object');
}

/**
 * Get all available translations
 */
export function getAllTranslations(): Record<string, string> {
  return { ...WORD_TRANSLATIONS };
}

/**
 * Check if a word has a translation
 */
export function hasTranslation(englishWord: string): boolean {
  return englishWord.toUpperCase() in WORD_TRANSLATIONS;
}

/**
 * Get translation count
 */
export function getTranslationCount(): number {
  return Object.keys(WORD_TRANSLATIONS).length;
}
