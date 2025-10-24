// 测试中文翻译功能
const testTranslation = async () => {
  const testData = {
    word: "UMBRELLA",
    story: "Here is a simple story about an umbrella for a 3-year-old child."
  };
  
  console.log('Testing API with translation...');
  
  try {
    const response = await fetch('https://orsm-ai.xushibo.cn', {
      method: 'POST',
      body: (() => {
        const formData = new FormData();
        // 创建一个简单的测试图片
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 100, 100);
        return new Promise(resolve => {
          canvas.toBlob(blob => {
            formData.append('image', blob, 'test.png');
            resolve(formData);
          });
        });
      })()
    });
    
    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (result.chineseName && result.chineseStory) {
      console.log('✅ Chinese translation working!');
      console.log('Chinese Name:', result.chineseName);
      console.log('Chinese Story:', result.chineseStory);
    } else {
      console.log('❌ Chinese translation missing!');
      console.log('Available fields:', Object.keys(result));
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// 在浏览器中运行
if (typeof window !== 'undefined') {
  testTranslation();
} else {
  console.log('This test should be run in a browser environment');
}
