/**
 * 测试增强的智能问答API
 */

async function testAPI() {
  console.log('🧪 测试增强智能问答API...\n');
  
  const testQuestions = [
    '查询结构件类库存',
    '查询NG测试结果',
    '查询聚龙供应商'
  ];
  
  for (const question of testQuestions) {
    console.log(`\n--- 测试问题: "${question}" ---`);
    
    try {
      const response = await fetch('http://localhost:3002/api/intelligent-qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ 查询成功`);
        console.log(`📊 数据量: ${result.data.dataCount} 条记录`);
        console.log(`🎯 场景类型: ${result.data.scenarioType}`);
        console.log(`📋 匹配规则: ${result.data.matchedRule}`);
        console.log(`🎴 统计卡片: ${result.data.cards.length} 个`);
        
        if (result.data.cards.length > 0) {
          console.log('卡片详情:');
          result.data.cards.forEach((card, index) => {
            console.log(`  ${index + 1}. ${card.icon} ${card.title}: ${card.value} (${card.subtitle})`);
          });
        }
      } else {
        console.log(`❌ 查询失败: ${result.data.answer}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n✅ API测试完成！');
}

testAPI().catch(console.error);
