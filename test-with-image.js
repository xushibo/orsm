#!/usr/bin/env node

/**
 * Test script for ORSM AI Worker with local image
 * Usage: node test-with-image.js <worker-url>
 */

const fs = require('fs');
const path = require('path');

async function testWorkerWithImage(workerUrl) {
  console.log(`Testing worker at: ${workerUrl}`);
  
  // 检查图片文件是否存在
  const imagePath = './test-images/test.png';
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    return;
  }
  
  console.log('📸 Using test image:', imagePath);
  
  try {
    // 读取图片文件
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    
    // 创建 FormData
    const formData = new FormData();
    formData.append('image', imageBlob, '1.png');
    
    console.log('🚀 Sending request to worker...');
    console.log(`📊 Image size: ${imageBuffer.length} bytes`);
    
    const response = await fetch(workerUrl, {
      method: 'POST',
      body: formData
    });
    
    console.log(`📡 Response status: ${response.status}`);
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Success!');
        console.log('🔤 Word:', result.word);
        console.log('📖 Story:', result.story);
        
        // 保存结果到文件
        const resultPath = './test-result.json';
        fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
        console.log(`💾 Result saved to: ${resultPath}`);
        
      } catch (e) {
        console.log('❌ Invalid JSON response');
        console.log('Raw response:', responseText);
      }
    } else {
      console.log('❌ Request failed');
      try {
        const error = JSON.parse(responseText);
        console.log('Error details:', error);
      } catch (e) {
        console.log('Error response (not JSON):', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// 主执行
const workerUrl = process.argv[2];

if (!workerUrl) {
  console.log('Usage: node test-with-image.js <worker-url>');
  console.log('Examples:');
  console.log('  node test-with-image.js https://orsm-ai.xushibo.cn/');
  console.log('  node test-with-image.js https://orsm-ai-worker.your-subdomain.workers.dev/');
  process.exit(1);
}

async function runTest() {
  console.log('🧪 ORSM AI Worker Test with Local Image');
  console.log('=====================================');
  await testWorkerWithImage(workerUrl);
  console.log('=====================================');
  console.log('Test completed!');
}

runTest().catch(console.error);
