/**
 * 直接测试工厂查询的意图匹配
 */

import IntelligentIntentService from './src/services/intelligentIntentService.js';

async function testFactoryQueryDirect() {
  console.log('🔍 直接测试工厂查询的意图匹配\n');
  
  const service = new IntelligentIntentService();
  await service.initialize();
  
  const testQueries = [
    '查询深圳工厂库存',
    '重庆工厂的情况怎么样？',
    '南昌工厂有多少库存？',
    '宜宾工厂库存分析'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    
    try {
      const result = await service.processQuery(query);
      
      console.log(`✅ 处理结果:`);
      console.log(`   成功: ${result.success}`);
      console.log(`   来源: ${result.source}`);
      console.log(`   服务: ${result.service}`);
      
      // 显示返回内容的前200个字符
      const preview = result.reply ? result.reply.substring(0, 200) : '无返回内容';
      console.log(`   返回预览: ${preview}...`);
      
    } catch (error) {
      console.log(`❌ 处理异常: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
}

testFactoryQueryDirect();
