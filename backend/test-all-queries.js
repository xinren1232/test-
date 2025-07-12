/**
 * 测试所有查询类型
 */

async function testAllQueries() {
  console.log('🧪 测试所有查询类型...\n');
  
  const queries = [
    '查询电池库存',
    '查询BOE供应商库存',
    '查询测试失败(NG)的记录',
    '查询风险状态的库存'
  ];
  
  for (const query of queries) {
    console.log(`🔍 测试: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: query
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功');
        console.log(`   模板: ${result.data.template}`);
        console.log(`   意图: ${result.data.analysis?.intent}`);
        console.log(`   实体: ${JSON.stringify(result.data.analysis?.entities)}`);
        
        // 显示回复的前100个字符
        const answer = result.data.response || result.data.answer || '';
        const preview = answer.length > 100 ? answer.substring(0, 100) + '...' : answer;
        console.log(`   回复预览: ${preview.replace(/\n/g, ' ')}`);
        
      } else {
        console.log(`❌ 查询失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ 请求异常: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🏁 所有测试完成');
}

testAllQueries();
