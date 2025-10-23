export interface Env {
  // Cloudflare Workers AI binding
  AI: any; // AI binding from wrangler.toml
}

// 添加 ExecutionContext 类型定义
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

interface ApiResponse {
  word: string;
  story: string;
}

interface ErrorResponse {
  error: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // 添加健康检查端点
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        aiBinding: !!env.AI
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 添加AI测试端点
    if (url.pathname === '/test-ai') {
      try {
        if (!env.AI) {
          return new Response(JSON.stringify({ error: 'AI binding not available' }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        // 测试ResNet-50模型
        const resnetTest = await env.AI.run('@cf/microsoft/resnet-50', {
          image: new Uint8Array(100), // 空图像数据
          top_k: 1
        }).catch((err: any) => ({ error: err.message }));

        // 测试CLIP模型
        const clipTest = await env.AI.run('@cf/meta/clip', {
          image: new Uint8Array(100), // 空图像数据
          text: "a photo of an object"
        }).catch((err: any) => ({ error: err.message }));

        return new Response(JSON.stringify({ 
          resnet: resnetTest,
          clip: clipTest
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    try {
      // 解析 multipart/form-data
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;

      console.log('Received request:', {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        hasImageFile: !!imageFile,
        imageFileType: imageFile?.type,
        imageFileSize: imageFile?.size,
        imageFileName: imageFile?.name
      });

      // 验证图片文件是否存在
      if (!imageFile) {
        console.error('No image file provided');
        return new Response(JSON.stringify({ error: 'No image file provided' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          }
        });
      }

      // 验证文件大小
      if (imageFile.size === 0) {
        console.error('Image file is empty');
        return new Response(JSON.stringify({ error: 'Image file is empty' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          }
        });
      }

      // 验证文件大小不要太小（移动端最小10KB）
      if (imageFile.size < 10000) {
        console.warn('Image file is very small:', imageFile.size, 'bytes');
        // 不阻止，只是警告
      }

      // 验证文件类型
      if (!imageFile.type.startsWith('image/')) {
        console.error('Invalid file type:', imageFile.type);
        return new Response(JSON.stringify({ error: 'Invalid file type. Please upload an image.' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          }
        });
      }

      // 调用 Cloudflare Workers AI
      const result = await callCloudflareAI(imageFile, env);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  },
};

async function callCloudflareAI(imageFile: File, env: Env): Promise<ApiResponse> {
  try {
    // 检查AI绑定是否存在
    if (!env.AI) {
      console.error('AI binding is not available');
      return {
        word: "Error",
        story: "AI service is not properly configured. Please contact the administrator."
      };
    }

    // 将图片转换为 base64
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const mimeType = imageFile.type;

    console.log('Calling Cloudflare Workers AI with image:', {
      size: imageFile.size,
      type: mimeType,
      base64Length: base64Image.length
    });

    // 使用 Cloudflare Workers AI 进行真实的图像识别
    console.log('Using Cloudflare Workers AI for real image recognition');
    console.log('=== IMAGE FILE DETAILS ===');
    console.log('Image file name:', imageFile.name);
    console.log('Image file size:', imageFile.size, 'bytes');
    console.log('Image file type:', imageFile.type);
    console.log('Image file lastModified:', imageFile.lastModified);
    console.log('Image file constructor:', imageFile.constructor.name);
    console.log('Image file instanceof File:', imageFile instanceof File);
    console.log('Image file instanceof Blob:', imageFile instanceof Blob);
    
    // 检查图片内容
    const arrayBuffer = await imageFile.arrayBuffer();
    console.log('Image arrayBuffer length:', arrayBuffer.byteLength);
    console.log('Image first 20 bytes:', Array.from(new Uint8Array(arrayBuffer.slice(0, 20))));
    
    return await callRealAI(imageFile, env);

  } catch (error) {
    console.error('Cloudflare AI error:', error);
    console.error('Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });
    
    // 返回错误响应而不是fallback
    return {
      word: "Error",
      story: "I encountered an error while trying to identify the object in this picture. Please try again with a different photo."
    };
  }
}


// 真实的 AI 图像识别函数
async function callRealAI(imageFile: File, env: Env): Promise<ApiResponse> {
  try {
    console.log('Attempting real AI image recognition...');
    
    // 检查AI绑定
    if (!env.AI) {
      throw new Error('AI binding is not configured');
    }
    
    // 使用 Cloudflare Workers AI 的图像识别模型
    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBytes = [...new Uint8Array(imageArrayBuffer)];
    
    console.log('Image file details:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      bytesLength: imageBytes.length
    });
    
    // 尝试AI模型识别
    let aiResult = null;
    console.log('=== Attempting AI Classification ===');
    console.log('AI binding available:', !!env.AI);
    
    // 首先尝试ResNet-50
    console.log('Trying ResNet-50...');
    try {
      const resnetResponse = await env.AI.run('@cf/microsoft/resnet-50', {
        image: imageBytes,
        top_k: 5
      });
      
      if (resnetResponse && Array.isArray(resnetResponse) && resnetResponse.length > 0) {
        console.log('ResNet-50 response:', JSON.stringify(resnetResponse, null, 2));
        const topResult = resnetResponse[0];
        const objectName = topResult.label || topResult.class_name || topResult.name;
        const confidence = topResult.score || topResult.confidence || 0;
        
        if (objectName && confidence > 0.1) {
          console.log('ResNet-50 success:', { objectName, confidence });
          aiResult = { objectName, confidence, source: 'resnet' };
        }
      }
    } catch (resnetError) {
      console.log('ResNet-50 failed:', resnetError);
    }
    
    // 如果ResNet-50失败，尝试CLIP
    if (!aiResult) {
      console.log('Trying CLIP...');
      try {
        const clipResponse = await env.AI.run('@cf/meta/clip', {
          image: imageBytes,
          text: "a photo of an object"
        });
        
        if (clipResponse && typeof clipResponse === 'object') {
          console.log('CLIP response:', JSON.stringify(clipResponse, null, 2));
          const similarity = clipResponse.similarity || clipResponse.score || 0;
          if (similarity > 0.1) {
            const objectName = 'Object'; // CLIP返回相似度，我们使用通用名称
            console.log('CLIP success:', { objectName, similarity });
            aiResult = { objectName, confidence: similarity, source: 'clip' };
          }
        }
      } catch (clipError) {
        console.log('CLIP failed:', clipError);
      }
    }
    
    // 如果AI识别成功，生成故事
    if (aiResult && aiResult.objectName) {
      console.log('AI recognition successful:', aiResult);
      try {
        const story = await generateChildStory(aiResult.objectName, env);
        return {
          word: aiResult.objectName,
          story: story
        };
      } catch (storyError) {
        console.log('Story generation failed, using fallback:', storyError);
        return {
          word: aiResult.objectName,
          story: `I can see a ${aiResult.objectName.toLowerCase()} in this picture. It's something interesting that tells its own story.`
        };
      }
    }
    
    // AI识别失败，返回Unknown
    console.log('AI recognition failed - no valid object identified');
    return {
      word: "Unknown",
      story: "I'm sorry, but I couldn't clearly identify what's in this picture. Please try taking a clearer photo with better lighting and make sure the object is clearly visible."
    };

  } catch (error) {
    console.error('AI processing failed:', error);
    return {
      word: "Error",
      story: "I encountered an error while trying to identify the object in this picture. Please try again with a different photo."
    };
  }
}


// 使用 AI 生成适合3岁儿童的故事
async function generateChildStory(objectName: string, env: Env): Promise<string> {
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

// 从 AI 响应中提取物体名称
function extractObjectName(text: string): string | null {
  const commonObjects = [
    'cat', 'dog', 'car', 'tree', 'house', 'book', 'ball', 'apple', 'flower', 'sun',
    'bird', 'fish', 'bear', 'rabbit', 'elephant', 'lion', 'butterfly', 'duck',
    'phone', 'cup', 'hat', 'shoe', 'chair', 'table', 'lamp', 'clock', 'key',
    'toy', 'bike', 'plane', 'boat', 'train', 'bus', 'truck', 'bike', 'motorcycle'
  ];
  
  const lowerText = text.toLowerCase();
  
  // 查找第一个匹配的物体
  for (const obj of commonObjects) {
    if (lowerText.includes(obj)) {
      return obj.charAt(0).toUpperCase() + obj.slice(1);
    }
  }
  
  // 如果没有找到，尝试提取第一个单词
  const words = text.trim().split(/\s+/);
  if (words.length > 0) {
    const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, '');
    if (firstWord.length > 2) {
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    }
  }
  
  return null;
}