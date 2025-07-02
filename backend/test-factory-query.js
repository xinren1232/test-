/**
 * 测试工厂查询功能
 */
import { processQuery } from './src/services/assistantService.js';

async function testFactoryQuery() {
  console.log('🧪 测试工厂查询功能...\n');
  
  const testQueries = [
    '查询深圳工厂的使用情况',
    '深圳工厂情况',
    '重庆工厂的物料使用',
    '工厂使用情况'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    try {
      const result = await processQuery(query);
      console.log('✅ 结果:');
      console.log(result.substring(0, 300) + (result.length > 300 ? '...' : ''));
      console.log('─'.repeat(50));
    } catch (error) {
      console.log('❌ 错误:', error.message);
      console.log('─'.repeat(50));
    }
  }
  
  console.log('\n🎉 测试完成！');
  process.exit(0);
}

testFactoryQuery();
