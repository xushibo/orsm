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
 * Get object type for better Chinese story generation
 */
function getObjectType(objectName: string): string {
  const name = objectName.toLowerCase();
  if (name.includes('mouse') || name.includes('cat') || name.includes('dog') || name.includes('bird')) {
    return 'animal';
  } else if (name.includes('car') || name.includes('phone') || name.includes('computer')) {
    return 'technology';
  } else if (name.includes('book') || name.includes('pen') || name.includes('pencil')) {
    return 'education';
  } else if (name.includes('apple') || name.includes('banana') || name.includes('food')) {
    return 'food';
  } else if (name.includes('ball') || name.includes('toy')) {
    return 'toy';
  } else {
    return 'general';
  }
}

/**
 * Generate fallback Chinese name
 */
function generateFallbackChineseName(objectName: string): string {
  const nameMap: { [key: string]: string } = {
    'MOUSE': '鼠标',
    'BOTTLE': '瓶子',
    'PHONE': '手机',
    'BOOK': '书',
    'BALL': '球',
    'APPLE': '苹果',
    'COMPUTER': '电脑',
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
 * Generate fallback Chinese story based on object type
 */
function generateFallbackChineseStory(objectName: string, objectType: string): string {
  const chineseName = generateFallbackChineseName(objectName);
  
  const stories: { [key: string]: string } = {
    'animal': `这是一个关于${chineseName}的故事。${chineseName}是可爱的小动物，它们有自己的生活习性和特点。每个小动物都是独特的，教会我们如何爱护和尊重生命！`,
    'technology': `这是一个关于${chineseName}的故事。${chineseName}是现代科技的重要工具，帮助我们学习、工作和娱乐。科技让我们的生活变得更加便利和有趣！`,
    'education': `这是一个关于${chineseName}的故事。${chineseName}是学习的好伙伴，帮助我们获取知识和技能。学习让我们变得更聪明，更有智慧！`,
    'food': `这是一个关于${chineseName}的故事。${chineseName}是美味的食物，不仅好吃还很有营养。健康的饮食让我们变得更强壮，更有活力！`,
    'toy': `这是一个关于${chineseName}的故事。${chineseName}是很有趣的玩具，可以带给我们很多快乐。玩具让我们的童年更加丰富多彩！`,
    'general': `这是一个关于${chineseName}的故事。${chineseName}是我们生活中的一部分，每个物品都有自己的用途和价值。让我们学会珍惜身边的每一件东西！`
  };
  
  return stories[objectType] || `这是一个关于${chineseName}的有趣故事。让我们一起来探索这个奇妙的世界吧！`;
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
    },
    'MOUSE': {
      name: '鼠标',
      story: '这是一个关于鼠标的故事。鼠标是电脑的好朋友，它有一个小尾巴（电线）连接着电脑。当我们移动鼠标时，电脑屏幕上的小箭头也会跟着移动，就像在玩捉迷藏一样！鼠标帮助我们点击和选择，让电脑变得更好玩！'
    },
    'BOTTLE': {
      name: '瓶子',
      story: '这是一个关于瓶子的故事。瓶子可以装很多不同的东西，比如水、果汁或者牛奶。有些瓶子是透明的，我们可以看见里面装的是什么。瓶子就像一个小房子，保护里面的东西不被弄脏！'
    },
    'PHONE': {
      name: '手机',
      story: '这是一个关于手机的故事。手机是一个神奇的小盒子，可以让我们和远方的朋友说话，还可以拍照、听音乐。手机就像我们的魔法助手，帮助我们学习和玩耍！'
    },
    'BOOK': {
      name: '书',
      story: '这是一个关于书的故事。书里藏着很多有趣的故事和知识，就像一个个小世界。当我们翻开书页时，就像打开了一扇通往奇妙世界的大门！书是我们最好的朋友，教会我们很多东西！'
    },
    'BALL': {
      name: '球',
      story: '这是一个关于球的故事。球是圆圆的，可以滚来滚去，非常好玩！我们可以踢球、拍球、扔球，球就像我们的玩伴，总是陪我们一起游戏！'
    },
    'APPLE': {
      name: '苹果',
      story: '这是一个关于苹果的故事。苹果是红红的、甜甜的，非常好吃！苹果长在树上，就像树上挂着的红灯笼。苹果不仅好吃，还很有营养，让我们变得更强壮！'
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
    
    let chineseName = chineseNameMatch ? chineseNameMatch[1].trim() : generateFallbackChineseName(objectName);
    let chineseStory = chineseStoryMatch ? chineseStoryMatch[1].trim() : '';
    
    // 清理中文故事中的拼音注释和解释
    chineseStory = cleanChineseText(chineseStory);
    
    // 如果清理后的内容为空或只包含标点符号，生成更好的回退内容
    if (!chineseStory || /^[.,;:!?。，；：！？\s]*$/.test(chineseStory)) {
      const objectType = getObjectType(objectName);
      chineseStory = generateFallbackChineseStory(objectName, objectType);
    }
    
    // 如果中文名称包含拼音或异常字符，使用回退
    if (chineseName.includes('(') || /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(chineseName)) {
      chineseName = generateFallbackChineseName(objectName);
    }
    
    return {
      chineseName,
      chineseStory
    };
  } catch (error) {
    console.error('Chinese translation generation failed:', error);
    const objectType = getObjectType(objectName);
    return {
      chineseName: generateFallbackChineseName(objectName),
      chineseStory: generateFallbackChineseStory(objectName, objectType)
    };
  }
}
