/**
 * Text processing utilities
 * Handles text cleaning, formatting, and processing for stories and translations
 */

/**
 * Clean Chinese text by removing unwanted content
 */
export function cleanChineseText(text: string): string {
  if (!text) return text;
  
  // Remove pinyin annotations (e.g., (diàn fēi qiú))
  text = text.replace(/\([^)]*[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ][^)]*\)/g, '');
  
  // Remove "Note:" explanations
  text = text.replace(/Note:[\s\S]*$/i, '');
  
  // Remove "*" explanation lines
  text = text.replace(/\*[^\n]*\n?/g, '');
  
  // Remove English content (keep Chinese characters only)
  text = text.replace(/[a-zA-Z\s]+/g, '');
  
  // Remove extra blank lines
  text = text.replace(/\n\s*\n/g, '\n');
  
  // Trim whitespace
  text = text.trim();
  
  return text;
}

/**
 * Process English story text by removing common prefixes
 */
export function processStoryText(story: string): string {
  if (!story) return story;
  
  // Remove common story prefixes
  const cleanedStory = story
    .replace(/^Here is a simple story about .*? for a 3-year-old:\s*/i, '')
    .replace(/^Here is a story about .*? for a 3-year-old:\s*/i, '')
    .replace(/^Here's a simple story about .*? for a 3-year-old:\s*/i, '')
    .replace(/^Here's a story about .*? for a 3-year-old:\s*/i, '')
    .replace(/^Here is a simple story about .*?:\s*/i, '')
    .replace(/^Here is a story about .*?:\s*/i, '')
    .replace(/^Here's a simple story about .*?:\s*/i, '')
    .replace(/^Here's a story about .*?:\s*/i, '')
    .replace(/^Here is a simple story for a 3-year-old:\s*/i, '')
    .replace(/^Here is a story for a 3-year-old:\s*/i, '')
    .replace(/^Here's a simple story for a 3-year-old:\s*/i, '')
    .replace(/^Here's a simple story for a 3-year-old:\s*/i, '')
    .replace(/^Here is a simple story:\s*/i, '')
    .replace(/^Here is a story:\s*/i, '')
    .replace(/^Here's a simple story:\s*/i, '')
    .replace(/^Here's a story:\s*/i, '')
    .replace(/^Here is a simple story about .*? for children:\s*/i, '')
    .replace(/^Here is a story about .*? for children:\s*/i, '')
    .replace(/^Here's a simple story about .*? for children:\s*/i, '')
    .replace(/^Here's a story about .*? for children:\s*/i, '')
    .replace(/^Here is a simple story for children:\s*/i, '')
    .replace(/^Here is a story for children:\s*/i, '')
    .replace(/^Here's a simple story for children:\s*/i, '')
    .replace(/^Here's a story for children:\s*/i, '')
    .replace(/^Here is a simple story about .*? for kids:\s*/i, '')
    .replace(/^Here is a story about .*? for kids:\s*/i, '')
    .replace(/^Here's a simple story about .*? for kids:\s*/i, '')
    .replace(/^Here's a story about .*? for kids:\s*/i, '')
    .replace(/^Here is a simple story for kids:\s*/i, '')
    .replace(/^Here is a story for kids:\s*/i, '')
    .replace(/^Here's a simple story for kids:\s*/i, '')
    .replace(/^Here's a story for kids:\s*/i, '')
    .replace(/^Here is a simple story about .*? for young children:\s*/i, '')
    .replace(/^Here is a story about .*? for young children:\s*/i, '')
    .replace(/^Here's a simple story about .*? for young children:\s*/i, '')
    .replace(/^Here's a story about .*? for young children:\s*/i, '')
    .replace(/^Here is a simple story for young children:\s*/i, '')
    .replace(/^Here is a story for young children:\s*/i, '')
    .replace(/^Here's a simple story for young children:\s*/i, '')
    .replace(/^Here's a story for young children:\s*/i, '')
    .trim();
  
  return cleanedStory || story;
}

/**
 * Detect if text contains Chinese characters
 */
export function isChineseText(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/**
 * Extract Chinese characters from mixed text
 */
export function extractChineseCharacters(text: string): string[] {
  return text.match(/[\u4e00-\u9fff]/g) || [];
}

/**
 * Format text for display with proper line breaks
 */
export function formatTextForDisplay(text: string, maxLineLength: number = 50): string {
  if (!text) return text;
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length <= maxLineLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.join('\n');
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Remove extra whitespace and normalize text
 */
export function normalizeText(text: string): string {
  if (!text) return text;
  
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();
}
