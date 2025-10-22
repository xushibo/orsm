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
    console.error('Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });
    
    // 如果出现错误，返回智能回退响应
    const imageSize = imageFile.size;
    const imageType = imageFile.type;
    const timestamp = Date.now();
    
    const fallbackObjects = [
      'Object', 'Item', 'Thing', 'Picture', 'Image', 'Photo', 'View', 'Scene'
    ];
    
    const hash = (imageSize + timestamp) % fallbackObjects.length;
    const fallbackWord = fallbackObjects[hash];
    
    console.log('Using intelligent fallback due to error:', { 
      imageSize, 
      imageType, 
      timestamp, 
      hash, 
      fallbackWord,
      error: (error as any)?.message
    });
    
    return {
      word: fallbackWord,
      story: `I can see something interesting in this picture. It's a wonderful ${fallbackWord.toLowerCase()} that tells its own story.`
    };
  }
}


// 真实的 AI 图像识别函数
async function callRealAI(imageFile: File, env: Env): Promise<ApiResponse> {
  try {
    console.log('Attempting real AI image recognition...');
    
    // 使用 Cloudflare Workers AI 的图像识别模型
    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBytes = [...new Uint8Array(imageArrayBuffer)];
    
    // 使用图像识别模型进行真实识别
    try {
      console.log('Attempting AI image classification with image bytes length:', imageBytes.length);
      console.log('Image file details:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        lastModified: imageFile.lastModified
      });
      
      // 尝试使用图像分类模型
      let aiResponse;
      try {
        console.log('=== Starting AI Classification ===');
        console.log('Image bytes length:', imageBytes.length);
        console.log('AI binding available:', !!env.AI);
        console.log('AI binding type:', typeof env.AI);
        
        // 首先尝试使用更通用的图像分类模型
        try {
          console.log('Attempting @cf/meta/llama-2-7b-chat-int8 for image description...');
          aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Look at this image and tell me what object you see. Respond with just the object name, nothing else."
                  },
                  {
                    type: "image",
                    image: imageBytes
                  }
                ]
              }
            ]
          });
          console.log('Llama-2 response:', JSON.stringify(aiResponse, null, 2));
        } catch (llamaError) {
          console.log('Llama-2 failed, trying ResNet-50:', llamaError);
          
          // 如果Llama失败，尝试ResNet-50
          try {
            console.log('Attempting ResNet-50 classification...');
            aiResponse = await env.AI.run('@cf/microsoft/resnet-50', {
              image: imageBytes
            });
            console.log('ResNet-50 response:', JSON.stringify(aiResponse, null, 2));
          } catch (resnetError) {
            console.log('ResNet-50 failed, trying CLIP:', resnetError);
            
            // 如果ResNet-50也失败，尝试CLIP
            try {
              console.log('Attempting CLIP classification...');
              aiResponse = await env.AI.run('@cf/meta/clip', {
                image: imageBytes,
                text: "a photo of"
              });
              console.log('CLIP response:', JSON.stringify(aiResponse, null, 2));
            } catch (clipError) {
              console.log('All AI models failed:', clipError);
              throw new Error('All AI models failed to process the image');
            }
          }
        }
      } catch (allModelsError) {
        console.error('All AI model attempts failed:', allModelsError);
        throw allModelsError;
      }
      
      console.log('AI classification response:', JSON.stringify(aiResponse, null, 2));
      
      // 解析不同模型的响应
      let objectName = null;
      let confidence = 0;
      
      console.log('Parsing AI response:', JSON.stringify(aiResponse, null, 2));
      
      if (aiResponse && Array.isArray(aiResponse) && aiResponse.length > 0) {
        // ResNet-50 或 CLIP 响应格式
        const topResult = aiResponse[0];
        objectName = topResult.label || topResult.class_name || topResult.name || topResult.text;
        confidence = topResult.score || topResult.confidence || topResult.similarity || 0;
        
        console.log('Array-based classification result:', { 
          objectName, 
          confidence, 
          fullResult: topResult 
        });
        
        // 如果置信度太低，尝试使用前几个结果
        if (confidence < 0.1 && aiResponse.length > 1) {
          for (let i = 1; i < Math.min(aiResponse.length, 3); i++) {
            const result = aiResponse[i];
            const altName = result.label || result.class_name || result.name || result.text;
            const altConfidence = result.score || result.confidence || result.similarity || 0;
            
            if (altConfidence > confidence) {
              objectName = altName;
              confidence = altConfidence;
              console.log('Using alternative result:', { objectName, confidence });
            }
          }
        }
      } else if (aiResponse && (aiResponse.response || aiResponse.description || aiResponse.choices)) {
        // Llama-2 或其他文本模型响应格式
        let responseText = '';
        
        if (aiResponse.choices && aiResponse.choices[0] && aiResponse.choices[0].message) {
          responseText = aiResponse.choices[0].message.content || '';
        } else if (aiResponse.response) {
          responseText = aiResponse.response;
        } else if (aiResponse.description) {
          responseText = aiResponse.description;
        } else if (typeof aiResponse === 'string') {
          responseText = aiResponse;
        }
        
        console.log('Text-based response:', responseText);
        
        // 清理响应文本，提取物体名称
        const cleanText = responseText.trim().toLowerCase();
        console.log('Cleaned response text:', cleanText);
        
        // 尝试提取第一个有意义的词
        const words = cleanText.split(/\s+/).filter(word => 
          word.length > 2 && 
          !['the', 'a', 'an', 'this', 'that', 'is', 'are', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)
        );
        
        if (words.length > 0) {
          objectName = words[0].charAt(0).toUpperCase() + words[0].slice(1);
          confidence = 0.8;
          console.log('Extracted object name from text:', objectName);
        } else {
          // 如果没找到合适的词，使用整个响应的第一个词
          const firstWord = cleanText.split(/\s+/)[0];
          if (firstWord && firstWord.length > 1) {
            objectName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
            confidence = 0.6;
            console.log('Using first word as object name:', objectName);
          }
        }
      } else {
        console.log('Invalid AI response format:', aiResponse);
      }
      
      if (objectName && objectName.length > 1) {
        console.log('Generating story for object:', objectName);
        const story = await generateChildStory(objectName, env);
        console.log('Generated story:', story);
        return {
          word: objectName,
          story: story
        };
      } else {
        console.log('No valid object identified:', { objectName });
      }
    } catch (modelError) {
      console.error('AI classification failed with error:', modelError);
      console.error('Error details:', {
        name: (modelError as any)?.name,
        message: (modelError as any)?.message,
        stack: (modelError as any)?.stack
      });
    }

    // AI 识别失败，不使用fallback，直接抛出错误
    console.error('AI recognition failed - no valid object identified');
    throw new Error('AI failed to identify any object in the image. Please try again with a clearer photo.');

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