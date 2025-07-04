/**
 * 测试意图匹配
 */
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testIntentMatching() {
  console.log('🧪 测试意图匹配\n');

  const testQueries = [
    '风险',
    '查询风险',
    '风险状态',
    '查询风险状态',
    '查询风险状态的库存',
    '冻结',
    '查询冻结',
    '冻结状态',
    '查询冻结状态的库存'
  ];

  for (const query of testQueries) {
    console.log(`\n🔍 测试: "${query}"`);
    
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
        console.log(`❌ HTTP错误: ${response.status}`);
        continue;
      }

      const result = await response.json();
      
      console.log(`📊 数据源: ${result.source}`);
      console.log(`📝 回复长度: ${result.reply ? result.reply.length : 0} 字符`);
      
      if (result.source === 'intelligent-intent') {
        console.log('✅ 匹配到智能意图！');
      } else {
        console.log('⚠️ 未匹配智能意图');
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 运行测试
testIntentMatching();
