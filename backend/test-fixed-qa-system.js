/**
 * 测试修复后的智能问答系统
 */

async function testQASystem() {
  console.log('🧪 开始测试修复后的智能问答系统...\n');
  
  const testQueries = [
    '查询电池库存',
    '查询BOE供应商库存',
    '查询测试失败(NG)的记录',
    '查询风险状态的库存',
    '对比聚龙和天马供应商表现',
    '查询LCD显示屏测试情况'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 测试查询: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: query })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ 查询成功`);
        console.log(`   模板: ${result.data?.template || '未知'}`);
        console.log(`   意图: ${result.data?.analysis?.intent || '未知'}`);
        console.log(`   实体: ${JSON.stringify(result.data?.analysis?.entities || {})}`);
        console.log(`   数据量: ${result.data?.data?.length || 0} 条`);
        
        if (result.data?.data?.length > 0) {
          console.log(`   首条数据: ${JSON.stringify(result.data.data[0])}`);
        }
      } else {
        console.log(`❌ 查询失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ 查询异常: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🏁 测试完成');
}

// 运行测试
testQASystem();
