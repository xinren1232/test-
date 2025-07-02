/**
 * 测试DeepSeek AI服务
 */

import DeepSeekService from './src/services/DeepSeekService.js';

async function testDeepSeek() {
  console.log('🧪 开始测试DeepSeek服务...');
  
  const deepSeek = new DeepSeekService('sk-cab797574abf4288bcfaca253191565d');
  
  try {
    console.log('📝 测试简单问候...');
    const response = await deepSeek.analyzeQuery('你好，请介绍一下你的功能');
    console.log('✅ DeepSeek响应:', response);
  } catch (error) {
    console.error('❌ DeepSeek测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

testDeepSeek();
