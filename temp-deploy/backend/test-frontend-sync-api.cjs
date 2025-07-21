// 测试前端数据同步API
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 测试前端数据同步API...\n');
    
    // 测试库存查询
    console.log('📦 测试库存查询...');
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '查询库存信息'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 查询成功');
      console.log('📊 结果:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ 查询失败:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('错误详情:', errorText);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPI();
