/**
 * Image Processing Handler
 * Handles image upload, validation, and AI processing
 */

import { recognizeImage } from '../services/recognition';
import { generateChildStory, generateChineseTranslation } from '../services/story';
import { extractObjectName } from '../utils/objects';
import { addCorsHeaders } from '../utils/cors';

export interface Env {
  AI: any;
}

export interface ApiResponse {
  word: string;
  story: string;
  chineseName?: string;
  chineseStory?: string;
}

/**
 * Process image upload and return AI result
 */
export async function handleImageUpload(request: Request, env: Env): Promise<Response> {
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
      const response = new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      return addCorsHeaders(response, request);
    }

    // 验证文件大小
    if (imageFile.size === 0) {
      console.error('Image file is empty');
      const response = new Response(JSON.stringify({ error: 'Image file is empty' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      return addCorsHeaders(response, request);
    }

    // 验证文件大小不要太小（移动端最小10KB）
    if (imageFile.size < 10000) {
      console.warn('Image file is very small:', imageFile.size, 'bytes');
      // 不阻止，只是警告
    }

    // 验证文件大小不要太大（防止滥用，最大10MB）
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > MAX_FILE_SIZE) {
      console.error('Image file too large:', imageFile.size, 'bytes');
      const response = new Response(JSON.stringify({ error: 'Image file too large. Maximum size is 10MB.' }), {
        status: 413,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      return addCorsHeaders(response, request);
    }

    // 验证文件类型
    if (!imageFile.type.startsWith('image/')) {
      console.error('Invalid file type:', imageFile.type);
      const response = new Response(JSON.stringify({ error: 'Invalid file type. Please upload an image.' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      return addCorsHeaders(response, request);
    }

    // 调用 AI 识别服务
    const result = await processImageWithAI(imageFile, env);

    const response = new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    return addCorsHeaders(response, request);

  } catch (error) {
    console.error('Image processing error:', error);
    const response = new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    return addCorsHeaders(response, request);
  }
}

/**
 * Process image with AI and return result
 */
async function processImageWithAI(imageFile: File, env: Env): Promise<ApiResponse> {
  try {
    console.log('Attempting real AI image recognition...');
    
    // 将图片转换为字节数组
    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBytes = [...new Uint8Array(imageArrayBuffer)];
    
    console.log('Image file details:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      bytesLength: imageBytes.length
    });
    
    // 尝试AI模型识别
    const aiResult = await recognizeImage(imageBytes, env);
    
    // 如果AI识别成功，生成故事和中文翻译
    if (aiResult && aiResult.objectName) {
      console.log('AI recognition successful:', aiResult);
      console.log('Object name:', aiResult.objectName);
      try {
        const story = await generateChildStory(aiResult.objectName, env);
        
        // 生成中文翻译
        let chineseTranslation = null;
        try {
          console.log('Calling generateChineseTranslation with:', aiResult.objectName, story.substring(0, 100));
          chineseTranslation = await generateChineseTranslation(aiResult.objectName, story, env);
          console.log('Chinese translation generated:', chineseTranslation);
        } catch (translationError) {
          console.log('Chinese translation failed, using fallback:', translationError);
          chineseTranslation = {
            chineseName: aiResult.objectName,
            chineseStory: `这是一个关于${aiResult.objectName}的有趣故事。让我们一起来探索这个奇妙的世界吧！`
          };
        }
        
        // 确保 chineseTranslation 不为 null
        if (!chineseTranslation) {
          chineseTranslation = {
            chineseName: aiResult.objectName,
            chineseStory: `这是一个关于${aiResult.objectName}的有趣故事。让我们一起来探索这个奇妙的世界吧！`
          };
        }
        
        const result: ApiResponse = {
          word: aiResult.objectName,
          story: story,
          chineseName: chineseTranslation.chineseName,
          chineseStory: chineseTranslation.chineseStory
        };
        
        console.log('Final result:', JSON.stringify(result, null, 2));
        console.log('Result keys:', Object.keys(result));
        console.log('Chinese fields present:', 'chineseName' in result, 'chineseStory' in result);
        
        return result;
      } catch (storyError) {
        console.log('Story generation failed, using fallback:', storyError);
        return {
          word: aiResult.objectName,
          story: `I can see a ${aiResult.objectName.toLowerCase()} in this picture. It's something interesting that tells its own story.`,
          chineseName: aiResult.objectName,
          chineseStory: `这是一个关于${aiResult.objectName}的有趣故事。让我们一起来探索这个奇妙的世界吧！`
        };
      }
    }
    
    // AI识别失败，返回Unknown
    console.log('AI recognition failed - no valid object identified');
    return {
      word: "Unknown",
      story: "I'm sorry, but I couldn't clearly identify what's in this picture. Please try taking a clearer photo with better lighting and make sure the object is clearly visible.",
      chineseName: "未知",
      chineseStory: "抱歉，我无法清楚地识别图片中的内容。请尝试拍摄更清晰的照片，确保光线充足，物体清晰可见。"
    };

  } catch (error) {
    console.error('AI processing failed:', error);
    return {
      word: "Unknown",
      story: "I'm sorry, but I couldn't clearly identify what's in this picture. Please try taking a clearer photo with better lighting and make sure the object is clearly visible.",
      chineseName: "未知",
      chineseStory: "抱歉，我无法清楚地识别图片中的内容。请尝试拍摄更清晰的照片，确保光线充足，物体清晰可见。"
    };
  }
}
