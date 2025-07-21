import fetch from 'node-fetch';

async function testTianmaQuery() {
  try {
    console.log('🧪 测试天马供应商查询...');

    // 首先测试API连接
    console.log('📡 测试API连接...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    console.log('健康检查状态:', healthResponse.status);

    const testQueries = [
      '查询天马库存',
      '天马供应商的物料',
      '天马的库存情况',
      '查询天马供应商库存'
    ];
    
    for (const query of testQueries) {
      console.log(`\n📝 测试查询: "${query}"`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        console.error(`❌ API调用失败: ${response.status}`);
        const errorText = await response.text();
        console.error('错误详情:', errorText);
        continue;
      }

      const result = await response.json();
      console.log('📊 完整响应:');
      console.log(JSON.stringify(result, null, 2));

      console.log('\n📊 响应结果:');
      console.log('- 成功:', result.success);
      console.log('- 来源:', result.source);
      console.log('- 意图:', result.intent);

      if (result.data) {
        if (typeof result.data === 'string') {
          console.log('- 数据:', result.data.substring(0, 200) + '...');
        } else {
          console.log('- 数据类型:', typeof result.data);
          console.log('- 记录数:', result.resultCount || 'N/A');
        }
      }
      
      console.log('---');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testTianmaQuery();
