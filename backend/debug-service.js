/**
 * 调试服务启动问题
 */
import { loadIntentRules, processQuery } from './src/services/assistantService.js';

async function debugService() {
  console.log('🔍 调试服务启动...');
  
  try {
    // 1. 测试加载规则
    console.log('\n1️⃣ 测试加载NLP规则...');
    await loadIntentRules();
    console.log('✅ NLP规则加载成功');
    
    // 2. 测试查询处理
    console.log('\n2️⃣ 测试查询处理...');
    const testQuery = '高风险库存';
    console.log(`测试查询: "${testQuery}"`);
    
    const result = await processQuery(testQuery);
    console.log('✅ 查询处理成功:');
    console.log(result.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
    console.error('错误堆栈:', error.stack);
  }
  
  process.exit(0);
}

debugService();
