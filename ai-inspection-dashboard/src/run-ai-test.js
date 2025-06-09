/**
 * AI模型测试运行脚本
 */

import testAIModels from './test-ai-models';

// 运行测试
(async () => {
  console.log('开始运行AI模型测试...');
  try {
    await testAIModels();
    console.log('AI模型测试完成');
  } catch (error) {
    console.error('AI模型测试失败:', error);
  }
})(); 