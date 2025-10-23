/**
 * Common objects list for AI recognition
 * Centralized list of objects that can be recognized
 */

export const COMMON_OBJECTS = [
  'cat', 'dog', 'car', 'tree', 'house', 'book', 'ball', 'apple', 'flower', 'sun',
  'bird', 'fish', 'bear', 'rabbit', 'elephant', 'lion', 'butterfly', 'duck',
  'phone', 'cup', 'hat', 'shoe', 'chair', 'table', 'lamp', 'clock', 'key',
  'toy', 'bike', 'plane', 'boat', 'train', 'bus', 'truck', 'motorcycle',
  'spoon', 'fork', 'plate', 'bowl', 'bottle', 'glass', 'mug', 'teapot',
  'pencil', 'pen', 'paper', 'notebook', 'computer', 'mouse', 'keyboard',
  'shirt', 'pants', 'dress', 'jacket', 'socks', 'gloves', 'scarf',
  'banana', 'orange', 'grape', 'strawberry', 'lemon', 'cherry', 'pear',
  'camera', 'watch', 'ring', 'necklace', 'bracelet', 'earrings',
  'umbrella', 'bag', 'wallet', 'purse', 'backpack', 'suitcase'
] as const;

/**
 * Extract object name from AI response text
 */
export function extractObjectName(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  // 查找第一个匹配的物体
  for (const obj of COMMON_OBJECTS) {
    if (lowerText.includes(obj)) {
      return obj.charAt(0).toUpperCase() + obj.slice(1);
    }
  }
  
  // 如果没有找到，尝试提取第一个有意义的单词
  const words = text.trim().split(/\s+/);
  for (const word of words) {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length > 2) {
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    }
  }
  
  return null;
}
