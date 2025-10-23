/**
 * AI Recognition Service
 * Handles image recognition using Cloudflare Workers AI
 */

export interface Env {
  AI: any;
}

export interface RecognitionResult {
  objectName: string;
  confidence: number;
  source: 'resnet' | 'clip';
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
      return { objectName, confidence, source: 'resnet' };
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
        return { objectName, confidence: similarity, source: 'clip' };
      }
    }
  }
  
  return null;
}
