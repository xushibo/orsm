#!/usr/bin/env node

/**
 * Test Gemini API directly
 */

const fs = require('fs');

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API directly...');
  
  // 读取测试图片
  const imagePath = './test-images/test.png';
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    return;
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  console.log('📸 Image size:', imageBuffer.length, 'bytes');
  console.log('📊 Base64 size:', base64Image.length, 'characters');
  
  // 这里需要你提供真实的 API 密钥
  const apiKey = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
  
  if (apiKey === 'YOUR_API_KEY_HERE') {
    console.log('❌ Please set GEMINI_API_KEY environment variable');
    console.log('Example: GEMINI_API_KEY=your_key_here node test-gemini-api.js');
    return;
  }
  
  const requestBody = {
    contents: [{
      parts: [
        { text: "请识别这张图片里的主要物品，返回它的英文单词，并创作一个适合3岁儿童的、一到两句话的英文小故事。请以JSON格式返回，包含'word'和'story'两个字段。" },
        {
          inline_data: {
            mime_type: 'image/png',
            data: base64Image
          }
        }
      ]
    }]
  };
  
  console.log('🚀 Sending request to Gemini API...');
  console.log('📋 Request body size:', JSON.stringify(requestBody).length, 'characters');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Success!');
        console.log('🔤 Response:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('❌ Invalid JSON response');
        console.log('Raw response:', responseText);
      }
    } else {
      console.log('❌ Request failed');
      console.log('Error response:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testGeminiAPI().catch(console.error);
