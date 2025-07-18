// 测试智能查询API
import fetch from 'node-fetch';

async function testQueryAPI() {
  console.log('🧪 测试智能查询API...\n');
  
  const testQueries = [
    {
      query: "查询库存数据",
      context: { type: "inventory" }
    },
    {
      query: "检验结果统计",
      context: { type: "inspection" }
    },
    {
      query: "生产线状态",
      context: { type: "production" }
    },
    {
      query: "规则测试",
      context: { type: "rule_test" }
    }
  ];

  try {
    for (let i = 0; i < testQueries.length; i++) {
      const testQuery = testQueries[i];
      console.log(`📋 测试查询 ${i + 1}: "${testQuery.query}"`);
      
      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testQuery)
      });
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功');
        console.log(`   响应时间: ${responseTime}ms`);
        console.log(`   答案: ${result.answer.substring(0, 100)}...`);
        console.log(`   置信度: ${result.metadata.confidence}`);
        console.log(`   数据源: ${result.metadata.dataSource}`);
      } else {
        const errorText = await response.text();
        console.log('❌ 查询失败');
        console.log(`   状态码: ${response.status} ${response.statusText}`);
        console.log(`   错误信息: ${errorText}`);
      }
      
      console.log('');
    }
    
    // 测试错误情况
    console.log('📋 测试错误情况: 空查询');
    const errorResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (errorResponse.status === 400) {
      console.log('✅ 错误处理正确 - 返回400状态码');
    } else {
      console.log('❌ 错误处理异常');
    }
    
    console.log('\n🎉 智能查询API测试完成！');
    
  } catch (error) {
    console.log('❌ 智能查询API测试失败');
    console.log(`   错误: ${error.message}`);
  }
}

testQueryAPI().catch(console.error);
