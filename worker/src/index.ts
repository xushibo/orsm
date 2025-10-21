export interface Env {
  GEMINI_API_KEY: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
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
    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // 解析 multipart/form-data
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;

      if (!imageFile) {
        return new Response(JSON.stringify({ error: 'No image file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 验证文件类型
      if (!imageFile.type.startsWith('image/')) {
        return new Response(JSON.stringify({ error: 'Invalid file type. Please upload an image.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 检查 API 密钥
      if (!env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 调用 Gemini API
      const result = await callGeminiAPI(imageFile, env.GEMINI_API_KEY);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
};

async function callGeminiAPI(imageFile: File, apiKey: string): Promise<ApiResponse> {
  // 将图片转换为 base64
  const imageBuffer = await imageFile.arrayBuffer();
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  const mimeType = imageFile.type;

  const prompt = "请识别这张图片里的主要物品，返回它的英文单词，并创作一个适合3岁儿童的、一到两句话的英文小故事。请以JSON格式返回，包含'word'和'story'两个字段。";

  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: mimeType,
            data: base64Image
          }
        }
      ]
    }],
    generation_config: {
      temperature: 0.7,
      top_k: 40,
      top_p: 0.95,
      max_output_tokens: 1024,
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    console.error('Request body:', JSON.stringify(requestBody, null, 2));
    console.error('Image size:', base64Image.length);
    console.error('MIME type:', mimeType);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API');
  }

  const responseText = data.candidates[0].content.parts[0].text;
  
  try {
    // 尝试解析 JSON 响应
    const parsedResponse = JSON.parse(responseText);
    
    if (!parsedResponse.word || !parsedResponse.story) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return {
      word: parsedResponse.word,
      story: parsedResponse.story
    };
  } catch (parseError) {
    // 如果 JSON 解析失败，尝试从文本中提取信息
    console.warn('Failed to parse JSON response, attempting text extraction:', parseError);
    
    // 简单的文本提取逻辑
    const wordMatch = responseText.match(/word["\s]*:["\s]*([^",\s]+)/i);
    const storyMatch = responseText.match(/story["\s]*:["\s]*"([^"]+)"/i);
    
    if (!wordMatch || !storyMatch) {
      throw new Error('Could not extract word and story from Gemini response');
    }
    
    return {
      word: wordMatch[1],
      story: storyMatch[1]
    };
  }
}
