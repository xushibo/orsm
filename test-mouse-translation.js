// 测试MOUSE翻译的脚本
const { generateFallbackChineseName, generateFallbackChineseStory, getObjectType } = require('./worker/src/services/story');

// 模拟测试
function testMouseTranslation() {
  const objectName = 'MOUSE';
  
  console.log('测试MOUSE翻译：');
  console.log('================');
  
  // 测试对象类型检测
  const objectType = getObjectType(objectName);
  console.log('对象类型:', objectType);
  
  // 测试中文名称生成
  const chineseName = generateFallbackChineseName(objectName);
  console.log('中文名称:', chineseName);
  
  // 测试中文故事生成
  const chineseStory = generateFallbackChineseStory(objectName, objectType);
  console.log('中文故事:', chineseStory);
  
  console.log('\n预期结果：');
  console.log('- 对象类型: technology');
  console.log('- 中文名称: 鼠标');
  console.log('- 中文故事: 包含"鼠标"和"科技"相关内容');
}

testMouseTranslation();
