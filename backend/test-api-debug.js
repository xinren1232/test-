/**
 * 测试API调试
 */
import fetch from 'node-fetch';

async function testAPIDebug() {
  console.log('🔍 测试API调试...\n');
  
  const queries = [
    '深圳工厂的库存情况',
    '查询深圳工厂库存',
    '深圳工厂库存查询',
    '深圳工厂'
  ];
  
  for (const query of queries) {
    console.log(`\n🧪 测试查询: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP错误: ${response.status}`);
        continue;
      }
      
      const result = await response.json();
      
      console.log(`📊 结果概览:`);
      console.log(`  - 成功: ${result.success}`);
      console.log(`  - 数据源: ${result.source || '未知'}`);
      console.log(`  - 结果数量: ${result.results?.length || 0}`);
      
      if (result.reply) {
        console.log(`  - 回复: ${result.reply.substring(0, 100)}...`);
      }
      
      if (result.data) {
        console.log(`  - 数据: ${result.data.substring(0, 100)}...`);
      }
      
      if (result.sql) {
        console.log(`  - SQL: ${result.sql}`);
      }
      
      if (result.params) {
        console.log(`  - 参数:`, result.params);
      }
      
      // 如果有结果，显示第一条
      if (result.results && result.results.length > 0) {
        console.log(`  - 样本记录:`, result.results[0]);
        console.log('✅ 查询成功！');
        break; // 找到成功的查询就停止
      }
      
    } catch (error) {
      console.log(`❌ 查询失败: ${error.message}`);
    }
  }
}

testAPIDebug().catch(console.error);
