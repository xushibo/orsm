#!/usr/bin/env node

/**
 * Test script for ORSM AI Worker
 * Usage: node test-worker.js <worker-url>
 */

const fs = require('fs');
const path = require('path');

async function testWorker(workerUrl) {
  console.log(`Testing worker at: ${workerUrl}`);
  
  // Create a simple test image (1x1 pixel PNG)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  const formData = new FormData();
  const blob = new Blob([testImageBuffer], { type: 'image/png' });
  formData.append('image', blob, 'test.png');
  
  try {
    console.log('Sending test request...');
    const response = await fetch(workerUrl, {
      method: 'POST',
      body: formData
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Success!');
        console.log('Word:', result.word);
        console.log('Story:', result.story);
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    } else {
      console.log('❌ Request failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test error cases
async function testErrorCases(workerUrl) {
  console.log('\n--- Testing Error Cases ---');
  
  // Test 1: No image
  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      body: new FormData()
    });
    console.log('No image test - Status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('No image test failed:', error.message);
  }
  
  // Test 2: Invalid method
  try {
    const response = await fetch(workerUrl, {
      method: 'GET'
    });
    console.log('GET method test - Status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('GET method test failed:', error.message);
  }
}

// Main execution
const workerUrl = process.argv[2];

if (!workerUrl) {
  console.log('Usage: node test-worker.js <worker-url>');
  console.log('Example: node test-worker.js https://orsm-ai-worker.your-subdomain.workers.dev/');
  process.exit(1);
}

async function runTests() {
  await testWorker(workerUrl);
  await testErrorCases(workerUrl);
}

runTests().catch(console.error);
