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
  // 首先尝试静态翻译
  const staticTranslations: { [key: string]: { name: string; story: string } } = {
    'UMBRELLA': {
      name: '雨伞',
      story: '这是一个关于雨伞的故事。雨伞可以帮助我们在下雨天保持干燥。当天空开始下雨时，雨伞会张开它的大伞面，保护我们不被雨水淋湿。雨伞就像我们的好朋友，总是在我们需要的时候出现！'
    },
    'INDIGO FINCH': {
      name: '靛蓝雀',
      story: '这是一个关于靛蓝雀的故事。靛蓝雀是一种美丽的小鸟，有着漂亮的蓝色羽毛。它们喜欢在天空中自由飞翔，唱着甜美的歌曲。靛蓝雀告诉我们，每个小生命都有自己独特的美丽！'
    },
    'CAT': {
      name: '猫',
      story: '这是一个关于猫的故事。猫是可爱的小动物，有着柔软的毛发和明亮的眼睛。它们喜欢玩耍，也喜欢安静地休息。猫教会我们如何享受生活的每一个美好时刻！'
    },
    'DOG': {
      name: '狗',
      story: '这是一个关于狗的故事。狗是人类最好的朋友，它们忠诚、友好，总是陪伴在我们身边。狗教会我们什么是真正的友谊和忠诚！'
    },
    'CAR': {
      name: '汽车',
      story: '这是一个关于汽车的故事。汽车可以带我们去很远的地方，就像我们的魔法马车。它们有不同的颜色和形状，每一辆汽车都有自己的故事！'
    },
    'TREE': {
      name: '树',
      story: '这是一个关于树的故事。大树给我们提供阴凉，让小鸟在上面筑巢。它们教会我们如何坚强地成长，如何保护我们周围的环境！'
    }
  };
  
  // 检查是否有静态翻译
  const upperObjectName = objectName.toUpperCase();
  if (staticTranslations[upperObjectName]) {
    console.log('Using static translation for:', objectName);
    return {
      chineseName: staticTranslations[upperObjectName].name,
      chineseStory: staticTranslations[upperObjectName].story
    };
  }
  
  // 如果没有静态翻译，尝试AI翻译
  try {
    const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'user',
          content: `Translate to Chinese:

Object: ${objectName}
Story: ${englishStory}

Reply with:
Chinese Name: [中文名称]
Chinese Story: [中文故事]`
        }
      ],
      max_tokens: 400,
      temperature: 0.5
    });
    
    const response = aiResponse.response || aiResponse.description || '';
    
    console.log('AI Translation Response:', response);
    console.log('Response length:', response.length);
    
    // 解析AI响应 - 更灵活的匹配
    let chineseNameMatch = response.match(/Chinese Name:\s*(.+)/i);
    let chineseStoryMatch = response.match(/Chinese Story:\s*([\s\S]+)/);
    
    // 如果标准格式不匹配，尝试其他格式
    if (!chineseNameMatch) {
      chineseNameMatch = response.match(/中文名称[：:]\s*(.+)/i);
    }
    if (!chineseStoryMatch) {
      chineseStoryMatch = response.match(/中文故事[：:]\s*([\s\S]+)/i);
    }
    
    // 如果还是没有匹配，尝试提取第一行作为名称，其余作为故事
    if (!chineseNameMatch && !chineseStoryMatch) {
      const lines = response.split('\n').filter((line: string) => line.trim());
      if (lines.length >= 2) {
        chineseNameMatch = [null, lines[0].trim()];
        chineseStoryMatch = [null, lines.slice(1).join('\n').trim()];
      }
    }
    
    console.log('Chinese Name Match:', chineseNameMatch);
    console.log('Chinese Story Match:', chineseStoryMatch);
    
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
