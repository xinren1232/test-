/**
 * 调试失败的查询
 */
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function debugQuery(query) {
  console.log(`\n🔍 调试查询: "${query}"`);
  
  try {
    const response = await fetch(`${API_BASE}/api/assistant/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query
      })
    });

    if (!response.ok) {
      console.log(`❌ HTTP错误: ${response.status} ${response.statusText}`);
      return;
    }

    const result = await response.json();
    
    console.log('📋 完整响应:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
  }
}

async function debugFailedQueries() {
  console.log('🐛 调试失败的查询\n');

  const failedQueries = [
    '查询风险状态的库存',
    '查询冻结状态的库存', 
    '分析欣冠供应商的物料情况'
  ];

  for (const query of failedQueries) {
    await debugQuery(query);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 运行调试
debugFailedQueries();
