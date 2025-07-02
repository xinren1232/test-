/**
 * 直接测试AI增强服务
 */

import AIEnhancedService from './backend/src/services/AIEnhancedService.js';

async function testAIDirect() {
  console.log('🔍 直接测试AI增强服务...\n');

  try {
    const aiService = new AIEnhancedService();
    
    console.log('1. 测试简单问候...');
    const result1 = await aiService.processComplexQuery('你好');
    console.log('结果1:', result1);
    
    console.log('\n2. 测试功能介绍...');
    const result2 = await aiService.processComplexQuery('请介绍一下你的功能');
    console.log('结果2:', result2);
    
    console.log('\n3. 测试AI是否启用...');
    console.log('AI启用状态:', aiService.isEnabled);
    
    console.log('\n4. 测试shouldUseAI方法...');
    const shouldUse1 = await aiService.shouldUseAI('你好');
    const shouldUse2 = await aiService.shouldUseAI('请介绍一下你的功能');
    console.log('你好 -> shouldUseAI:', shouldUse1);
    console.log('请介绍一下你的功能 -> shouldUseAI:', shouldUse2);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

testAIDirect();
