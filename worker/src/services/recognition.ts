/**
 * AI Recognition Service
 * Handles image recognition using Cloudflare Workers AI
 */

/**
 * Generate Chinese content using AI
 */
async function generateChineseContent(objectName: string, env: Env): Promise<{ chineseName: string; chineseStory: string }> {
  console.log('Generating Chinese content for:', objectName);
  
  const prompt = `请为3岁儿童生成关于"${objectName}"的中文内容。

要求：
1. 中文名称：提供准确的中文翻译
2. 中文故事：生成一个简单、有趣的中文故事，适合3岁儿童

请按以下格式回复：
中文名称：[中文名称]
中文故事：[适合3岁儿童的中文故事]`;

  try {
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });
    
    const content = response.response || response.description || '';
    console.log('AI Chinese response:', content);
    
    // 解析响应
    const nameMatch = content.match(/中文名称[：:]\s*(.+)/i);
    const storyMatch = content.match(/中文故事[：:]\s*([\s\S]+)/i);
    
    let chineseName = nameMatch ? nameMatch[1].trim() : getFallbackChineseName(objectName);
    let chineseStory = storyMatch ? storyMatch[1].trim() : getFallbackChineseStory(objectName);
    
    // 清理内容
    chineseStory = cleanChineseText(chineseStory);
    
    return { chineseName, chineseStory };
  } catch (error) {
    console.error('AI Chinese generation failed:', error);
    return getFallbackChineseTranslation(objectName);
  }
}

/**
 * Get fallback Chinese translation
 */
function getFallbackChineseTranslation(objectName: string): { chineseName: string; chineseStory: string } {
  return {
    chineseName: getFallbackChineseName(objectName),
    chineseStory: getFallbackChineseStory(objectName)
  };
}

/**
 * Get fallback Chinese name
 */
function getFallbackChineseName(objectName: string): string {
  const nameMap: { [key: string]: string } = {
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
    'SHOE': '鞋子'
  };
  
  return nameMap[objectName.toUpperCase()] || objectName;
}

/**
 * Get fallback Chinese story
 */
function getFallbackChineseStory(objectName: string): string {
  const chineseName = getFallbackChineseName(objectName);
  return `这是一个关于${chineseName}的有趣故事。${chineseName}是我们生活中的一部分，每个物品都有自己的用途和价值。让我们学会珍惜身边的每一件东西！`;
}

/**
 * Clean Chinese text
 */
function cleanChineseText(text: string): string {
  // 移除拼音注释
  text = text.replace(/\([^)]*[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ][^)]*\)/g, '');
  
  // 移除 "Note:" 开头的解释部分
  text = text.replace(/Note:[\s\S]*$/i, '');
  
  // 移除 "*" 开头的解释行
  text = text.replace(/\*[^\n]*\n?/g, '');
  
  // 移除多余的空白行
  text = text.replace(/\n\s*\n/g, '\n');
  
  // 移除首尾空白
  text = text.trim();
  
  return text;
}

export interface Env {
  AI: any;
}

export interface RecognitionResult {
  objectName: string;
  confidence: number;
  source: 'resnet' | 'clip';
  chineseName?: string;
  chineseStory?: string;
}

/**
 * Perform AI image recognition using multiple models
 */
export async function recognizeImage(imageBytes: number[], env: Env): Promise<RecognitionResult | null> {
  console.log('=== Attempting AI Classification ===');
  console.log('AI binding available:', !!env.AI);
  
  // 首先尝试ResNet-50
  console.log('Trying ResNet-50...');
  const resnetResponse = await env.AI.run('@cf/microsoft/resnet-50', {
    image: imageBytes,
    top_k: 5
  }).catch((err: any) => {
    console.log('ResNet-50 failed:', err);
    return null;
  });
  
  if (resnetResponse && Array.isArray(resnetResponse) && resnetResponse.length > 0) {
    console.log('ResNet-50 response:', JSON.stringify(resnetResponse, null, 2));
    const topResult = resnetResponse[0];
    const objectName = topResult.label || topResult.class_name || topResult.name;
    const confidence = topResult.score || topResult.confidence || 0;
    
    if (objectName && confidence > 0.1) {
      console.log('ResNet-50 success:', { objectName, confidence });
      
      // 立即生成中文翻译
      try {
        const chineseTranslation = await generateChineseContent(objectName, env);
        return { 
          objectName, 
          confidence, 
          source: 'resnet',
          chineseName: chineseTranslation.chineseName,
          chineseStory: chineseTranslation.chineseStory
        };
      } catch (error) {
        console.log('Chinese translation failed, using fallback:', error);
        const fallbackTranslation = getFallbackChineseTranslation(objectName);
        return { 
          objectName, 
          confidence, 
          source: 'resnet',
          chineseName: fallbackTranslation.chineseName,
          chineseStory: fallbackTranslation.chineseStory
        };
      }
    }
  }
  
  // 如果ResNet-50失败，尝试CLIP
  if (!resnetResponse) {
    console.log('Trying CLIP...');
    const clipResponse = await env.AI.run('@cf/meta/clip', {
      image: imageBytes,
      text: "a photo of an object"
    }).catch((err: any) => {
      console.log('CLIP failed:', err);
      return null;
    });
    
    if (clipResponse && typeof clipResponse === 'object') {
      console.log('CLIP response:', JSON.stringify(clipResponse, null, 2));
      const similarity = clipResponse.similarity || clipResponse.score || 0;
      if (similarity > 0.1) {
        const objectName = 'Object'; // CLIP返回相似度，我们使用通用名称
        console.log('CLIP success:', { objectName, similarity });
        
        // 为CLIP结果也生成中文内容
        try {
          const chineseTranslation = await generateChineseContent(objectName, env);
          return { 
            objectName, 
            confidence: similarity, 
            source: 'clip',
            chineseName: chineseTranslation.chineseName,
            chineseStory: chineseTranslation.chineseStory
          };
        } catch (error) {
          console.log('Chinese translation failed for CLIP, using fallback:', error);
          const fallbackTranslation = getFallbackChineseTranslation(objectName);
          return { 
            objectName, 
            confidence: similarity, 
            source: 'clip',
            chineseName: fallbackTranslation.chineseName,
            chineseStory: fallbackTranslation.chineseStory
          };
        }
      }
    }
  }
  
  return null;
}
