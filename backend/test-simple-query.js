/**
 * 测试简单查询
 */
import { processQuery } from './src/services/assistantService.js';

async function testSimpleQuery() {
  console.log('🧪 测试简单查询...\n');
  
  try {
    const result = await processQuery('查询电容的库存情况');
    console.log('✅ 返回结果:');
    console.log(result);
  } catch (error) {
    console.log('❌ 错误:', error.message);
    console.log('错误详情:', error);
  }
}

testSimpleQuery();
