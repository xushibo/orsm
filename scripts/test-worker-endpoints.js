#!/usr/bin/env node

/**
 * 测试Worker端点的脚本
 * 用于验证Worker的各项功能是否正常工作
 */

async function testWorkerEndpoints() {
  const workerUrl = process.argv[2] || 'https://orsm-ai.xushibo.cn';
  
  console.log(`🔍 Testing Worker endpoints at: ${workerUrl}\n`);

  try {
    // 1. 测试健康检查端点
    console.log('1. Testing Health Check Endpoint (/health)...');
    const healthResponse = await fetch(`${workerUrl}/health`);
    console.log('   Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   Response:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('   Error Response:', await healthResponse.text());
    }

    // 2. 测试AI服务端点
    console.log('\n2. Testing AI Service Endpoint (/test-ai)...');
    const aiTestResponse = await fetch(`${workerUrl}/test-ai`);
    console.log('   Status:', aiTestResponse.status);
    
    if (aiTestResponse.ok) {
      const aiTestData = await aiTestResponse.json();
      console.log('   Response:', JSON.stringify(aiTestData, null, 2));
    } else {
      console.log('   Error Response:', await aiTestResponse.text());
    }

    // 3. 测试错误的HTTP方法
    console.log('\n3. Testing Wrong HTTP Method (GET)...');
    const getResponse = await fetch(workerUrl, { method: 'GET' });
    console.log('   Status:', getResponse.status);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('   Response:', JSON.stringify(getData, null, 2));
    } else {
      console.log('   Error Response:', await getResponse.text());
    }

    console.log('\n✅ Testing completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// 执行测试
testWorkerEndpoints();