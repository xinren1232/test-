/**
 * 测试增强意图识别服务
 */

import IntelligentIntentService from './src/services/intelligentIntentService.js';

async function testEnhancedIntent() {
  console.log('🧪 测试增强意图识别服务');
  
  try {
    const service = new IntelligentIntentService();
    await service.initialize();
    
    console.log('✅ 服务初始化成功');
    
    // 测试深圳工厂库存查询
    const result = await service.processQuery('深圳工厂库存查询');
    
    console.log('📊 查询结果:');
    console.log('- 成功:', result.success);
    console.log('- 数据类型:', typeof result.data);
    console.log('- 是否为对象:', typeof result.data === 'object');
    
    if (typeof result.data === 'object' && result.data !== null) {
      console.log('- 结构化数据类型:', result.data.type);
      console.log('- 结构化数据标题:', result.data.title);
      console.log('- 汇总信息:', result.data.summary ? '✅' : '❌');
      console.log('- 图表数据:', result.data.charts ? '✅' : '❌');
      console.log('- 表格数据:', result.data.table ? '✅' : '❌');
    } else {
      console.log('- 数据内容:', result.data);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

testEnhancedIntent();
