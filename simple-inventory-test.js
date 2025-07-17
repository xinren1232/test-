/**
 * 简单的库存查询测试
 */

const API_BASE_URL = 'http://localhost:3001';

async function simpleTest() {
  try {
    console.log('🧪 简单库存查询测试...\n');
    
    const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '查询库存信息'
      })
    });
    
    const result = await response.json();
    
    console.log('📊 完整响应结构:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

simpleTest();
