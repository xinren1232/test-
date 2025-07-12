/**
 * 测试新的智能问答系统
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

/**
 * 测试规则库API
 */
async function testRulesAPI() {
  console.log('🔍 测试规则库API...\n');
  
  try {
    const response = await fetch(`${API_BASE}/api/assistant/rules`);
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`✅ 规则库API正常，返回 ${result.data.length} 条规则`);
      
      // 按分类统计
      const categories = {};
      result.data.forEach(rule => {
        const category = rule.category || '未分类';
        if (!categories[category]) categories[category] = 0;
        categories[category]++;
      });
      
      console.log('📊 分类统计:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} 条`);
      });
      
    } else {
      console.log('❌ 规则库API返回异常:', result.message);
    }
  } catch (error) {
    console.error('❌ 规则库API调用失败:', error.message);
  }
}

/**
 * 测试智能问答API
 */
async function testQueryAPI() {
  console.log('🤖 测试智能问答API...\n');
  
  const testQueries = [
    '查询BOE供应商库存',
    '查询结构件类物料测试情况',
    '查询风险状态的物料'
  ];
  
  for (const query of testQueries) {
    console.log(`测试查询: "${query}"`);
    
    try {
      const response = await fetch(`${API_BASE}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: query,
          scenario: 'basic'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ 查询成功`);
        if (result.data) {
          console.log(`  - 回答: ${result.data.answer ? result.data.answer.substring(0, 100) + '...' : '无回答'}`);
          console.log(`  - 数据: ${result.data.tableData ? result.data.tableData.length + ' 行' : '无'}`);
        }
      } else {
        console.log(`❌ 查询失败: ${result.message}`);
      }
    } catch (error) {
      console.error(`❌ API调用失败: ${error.message}`);
    }
    
    console.log('');
  }
}

/**
 * 运行测试
 */
async function runTests() {
  console.log('🚀 开始测试新的智能问答系统...\n');
  
  await testRulesAPI();
  console.log('=' .repeat(50));
  
  await testQueryAPI();
  console.log('=' .repeat(50));
  
  console.log('\n🎉 测试完成！');
  console.log('🔗 访问地址: http://localhost:5173/assistant');
}

runTests().catch(console.error);
