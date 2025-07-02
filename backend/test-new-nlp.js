/**
 * 测试新的NLP规则
 */
import fetch from 'node-fetch';

async function testNlpRules() {
  console.log('🧪 测试新的NLP规则...');
  
  const testQueries = [
    // 库存查询测试
    '查询物料 M12345 的库存',
    '查库存 M12345',
    '物料M12345库存情况',
    
    // 批次查询测试
    '查询批次 BATCH001 的库存',
    '批次BATCH001信息',
    '批号001的情况',
    
    // 风险查询测试
    '目前有哪些高风险库存？',
    '高风险物料',
    '查询风险库存',
    
    // 供应商查询测试
    '查询欣旺达的库存',
    '欣旺达供应商库存',
    '比亚迪的物料',
    
    // 测试结果查询
    '查询批次 BATCH001 的测试结果',
    'BATCH001测试情况',
    '物料M12345的测试结果',
    
    // 上线跟踪查询
    '查询批次 BATCH001 的上线情况',
    '深圳工厂的使用情况',
    '产线使用情况',
    
    // 异常查询
    '目前有哪些异常情况？',
    '问题物料',
    '查询异常'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 测试查询: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 响应成功:');
        console.log(result.response.substring(0, 200) + (result.response.length > 200 ? '...' : ''));
      } else {
        console.log('❌ 响应失败:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('错误详情:', errorText);
      }
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
    
    // 添加延迟避免过快请求
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎉 测试完成！');
}

testNlpRules();
