/**
 * Story Generation Service
 * Generates child-friendly stories using AI
 */

export interface Env {
  AI: any;
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
          content: `Please provide Chinese translations for the following:
1. Object name: "${objectName}"
2. Story: "${englishStory}"

Please respond in this exact format:
Chinese Name: [Chinese translation of the object name]
Chinese Story: [Chinese translation of the story, keeping it simple and child-friendly]

Make sure the Chinese story is appropriate for a 3-year-old child and maintains the same meaning as the English version.`
        }
      ],
      max_tokens: 400,
      temperature: 0.5
    });
    
    const response = aiResponse.response || aiResponse.description || '';
    
    // 解析AI响应
    const chineseNameMatch = response.match(/Chinese Name:\s*(.+)/i);
    const chineseStoryMatch = response.match(/Chinese Story:\s*([\s\S]+)/);
    
    const chineseName = chineseNameMatch ? chineseNameMatch[1].trim() : objectName;
    const chineseStory = chineseStoryMatch ? chineseStoryMatch[1].trim() : `这是一个关于${objectName}的有趣故事。让我们一起来探索这个奇妙的世界吧！`;
    
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
