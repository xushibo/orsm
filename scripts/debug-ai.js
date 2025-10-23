#!/usr/bin/env node

/**
 * AI服务调试脚本
 * 用于测试Cloudflare Workers AI服务是否正常工作
 */

async function testAIService() {
  console.log('🔍 Testing Cloudflare Workers AI Service...\n');

  try {
    // 测试Worker健康检查端点
    console.log('1. Testing Worker Health Check...');
    const healthResponse = await fetch('https://orsm-ai.xushibo.cn/health');
    const healthData = await healthResponse.json();
    console.log('   Health Check Result:', healthData);
    
    // 测试AI模型可用性
    console.log('\n2. Testing AI Model Availability...');
    const aiTestResponse = await fetch('https://orsm-ai.xushibo.cn/test-ai');
    const aiTestData = await aiTestResponse.json();
    console.log('   AI Test Result:', JSON.stringify(aiTestData, null, 2));
    
    // 分析结果
    console.log('\n📊 Analysis:');
    if (healthData.aiBinding) {
      console.log('   ✅ AI Binding is available');
    } else {
      console.log('   ❌ AI Binding is NOT available');
    }
    
    if (aiTestData.resnet && !aiTestData.resnet.error) {
      console.log('   ✅ ResNet-50 model is accessible');
    } else {
      console.log('   ❌ ResNet-50 model is NOT accessible:', aiTestData.resnet?.error);
    }
    
    if (aiTestData.clip && !aiTestData.clip.error) {
      console.log('   ✅ CLIP model is accessible');
    } else {
      console.log('   ❌ CLIP model is NOT accessible:', aiTestData.clip?.error);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error('   Stack:', error.stack);
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Check Cloudflare Worker logs for detailed error information');
  console.log('   2. Verify AI binding configuration in wrangler.toml');
  console.log('   3. Ensure your Cloudflare account has Workers AI enabled');
  console.log('   4. Check if you have exceeded any usage limits');
}

// 执行测试
testAIService();