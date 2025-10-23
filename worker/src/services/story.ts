/**
 * Story Generation Service
 * Generates child-friendly stories using AI
 */

export interface Env {
  AI: any;
}

/**
 * Clean Chinese text by removing pinyin annotations and explanations
 */
function cleanChineseText(text: string): string {
  // 移除拼音注释 (如: (diàn fēi qiú))
  text = text.replace(/\([^)]*[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ][^)]*\)/g, '');
  
  // 移除 "Note:" 开头的解释部分
  text = text.replace(/Note:[\s\S]*$/i, '');
  
  // 移除 "*" 开头的解释行
  text = text.replace(/\*[^\n]*\n?/g, '');
  
  // 移除只包含标点符号的行
  text = text.replace(/^[.,;:!?。，；：！？\s]*$/gm, '');
  
  // 移除只包含标点符号的内容
  if (/^[.,;:!?。，；：！？\s]*$/.test(text)) {
    return '';
  }
  
  // 移除多余的空白行
  text = text.replace(/\n\s*\n/g, '\n');
  
  // 移除首尾空白
  text = text.trim();
  
  return text;
}

/**
 * Generate a child-friendly story for a recognized object
 */
export async function generateChildStory(objectName: string, env: Env): Promise<string> {
  try {
    const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'user',
          content: `Write a simple story about a ${objectName} for a 3-year-old child. Keep it to 3-4 sentences maximum. Use simple words and make it educational. Make sure the story is complete and not cut off.`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });
    
    const story = aiResponse.response || aiResponse.description || '';
    const trimmedStory = story.trim();
    
    // 检查故事是否被截断（以不完整的句子结尾）
    if (trimmedStory.length > 0) {
      // 如果故事以不完整的句子结尾，尝试修复
      let finalStory = trimmedStory;
      
      // 如果故事以引号开始但没有结束，尝试添加结束引号
      if (finalStory.includes('"') && (finalStory.split('"').length - 1) % 2 === 1) {
        finalStory += '"';
      }
      
      // 如果故事以不完整的句子结尾，添加句号
      if (!finalStory.endsWith('.') && !finalStory.endsWith('!') && !finalStory.endsWith('?')) {
        finalStory += '.';
      }
      
      // 如果故事太长，智能截断到完整的句子
      if (finalStory.length > 600) {
        const sentences = finalStory.split(/[.!?]+/);
        let shortStory = '';
        for (const sentence of sentences) {
          if (sentence.trim() && shortStory.length + sentence.length < 500) {
            shortStory += sentence.trim() + '.';
          } else {
            break;
          }
        }
        return shortStory.trim() || `I can see a ${objectName} in this picture. It's something interesting that tells its own story.`;
      }
      
      return finalStory;
    }
    
    return `I can see a ${objectName} in this picture. It's something interesting that tells its own story.`;
  } catch (error) {
    console.error('Story generation failed:', error);
    return `I can see a ${objectName} in this picture. It's something interesting that tells its own story.`;
  }
}

/**
 * Generate Chinese translation for object name and story
 */
export async function generateChineseTranslation(objectName: string, englishStory: string, env: Env): Promise<{ chineseName: string; chineseStory: string }> {
  try {
    const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'user',
          content: `Translate the following to Chinese for a 3-year-old child:

Object: ${objectName}
Story: ${englishStory}

Requirements:
- Use only Chinese characters (汉字)
- Keep it simple and child-friendly
- NO pinyin, NO English, NO explanations
- Write a complete, meaningful story

Format your response exactly like this:
Chinese Name: [中文名称]
Chinese Story: [中文故事]`
        }
      ],
      max_tokens: 400,
      temperature: 0.5
    });
    
    const response = aiResponse.response || aiResponse.description || '';
    
    // 解析AI响应
    const chineseNameMatch = response.match(/Chinese Name:\s*(.+)/i);
    const chineseStoryMatch = response.match(/Chinese Story:\s*([\s\S]+)/);
    
    let chineseName = chineseNameMatch ? chineseNameMatch[1].trim() : objectName;
    let chineseStory = chineseStoryMatch ? chineseStoryMatch[1].trim() : `这是一个关于${objectName}的有趣故事。让我们一起来探索这个奇妙的世界吧！`;
    
    // 清理中文故事中的拼音注释和解释
    chineseStory = cleanChineseText(chineseStory);
    
    // 如果清理后的内容为空或只包含标点符号，使用回退内容
    if (!chineseStory || /^[.,;:!?。，；：！？\s]*$/.test(chineseStory)) {
      chineseStory = `这是一个关于${objectName}的有趣故事。让我们一起来探索这个奇妙的世界吧！`;
    }
    
    // 如果中文名称包含拼音或异常字符，使用回退
    if (chineseName.includes('(') || /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(chineseName)) {
      chineseName = objectName;
    }
    
    return {
      chineseName,
      chineseStory
    };
  } catch (error) {
    console.error('Chinese translation generation failed:', error);
    return {
      chineseName: objectName,
      chineseStory: `这是一个关于${objectName}的有趣故事。让我们一起来探索这个奇妙的世界吧！`
    };
  }
}
