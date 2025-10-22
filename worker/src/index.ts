export interface Env {
  // Cloudflare Workers AI 不需要 API 密钥
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

      if (!imageFile) {
        return new Response(JSON.stringify({ error: 'No image file provided' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 验证文件类型
      if (!imageFile.type.startsWith('image/')) {
        return new Response(JSON.stringify({ error: 'Invalid file type. Please upload an image.' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
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
    return await callRealAI(imageFile, env);

  } catch (error) {
    console.error('Cloudflare AI error:', error);
    
    // 如果出现错误，返回默认响应
    return {
      word: "Object",
      story: "I can see something interesting in this picture. It's a wonderful object that tells its own story."
    };
  }
}


// 真实的 AI 图像识别函数
async function callRealAI(imageFile: File, env: Env): Promise<ApiResponse> {
  try {
    console.log('Attempting real AI image recognition...');
    
    // 将图片转换为 base64
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    // 使用 Cloudflare Workers AI 的图像识别模型
    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBytes = [...new Uint8Array(imageArrayBuffer)];
    
    // 使用图像分类模型进行真实识别
    try {
      const inputs = {
        image: imageBytes
      };
      
      const aiResponse = await env.AI.run('@cf/microsoft/resnet-50', inputs);
      
      console.log('AI classification response:', aiResponse);
      
      // 解析分类结果
      if (aiResponse && Array.isArray(aiResponse) && aiResponse.length > 0) {
        const topResult = aiResponse[0];
        const objectName = topResult.label || topResult.class_name || topResult.name;
        const confidence = topResult.score || topResult.confidence || 0;
        
        console.log('Classification result:', { objectName, confidence });
        
        if (objectName && confidence > 0.1) {
          const story = await generateChildStory(objectName, env);
          return {
            word: objectName,
            story: story
          };
        }
      }
    } catch (modelError) {
      console.error('AI classification failed:', modelError);
    }

    // AI 识别失败，返回错误
    console.log('AI recognition failed, no fallback available');
    throw new Error('AI image recognition failed');

  } catch (aiError) {
    console.error('Real AI call failed:', aiError);
    throw aiError;
  }
}


// 使用 AI 生成适合3岁儿童的故事
async function generateChildStory(objectName: string, env: Env): Promise<string> {
  try {
    const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'user',
          content: `Write a simple, educational story about a ${objectName} for a 3-year-old child. The story should be 1-2 sentences, use simple words, and be educational.`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });
    
    const story = aiResponse.response || aiResponse.description || '';
    return story.trim() || `I can see a ${objectName} in this picture. It's something interesting that tells its own story.`;
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