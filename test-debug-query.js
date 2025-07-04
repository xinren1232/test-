/**
 * 测试查询调试
 */

import fetch from 'node-fetch';

async function testDebugQuery() {
  console.log('🔍 测试查询调试...\n');
  
  const testQuery = "查询测试供应商A的物料";
  
  try {
    console.log(`🎯 查询: "${testQuery}"`);
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: testQuery })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 查询成功');
      console.log('📋 回复内容:', result.reply);
    } else {
      console.log('❌ 查询失败:', response.status);
    }
    
  } catch (error) {
    console.log('❌ 查询出错:', error.message);
  }
}

// 运行测试
testDebugQuery().catch(console.error);
