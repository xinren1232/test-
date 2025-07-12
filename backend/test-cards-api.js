/**
 * 测试卡片功能的API调用
 */

async function testCardsAPI() {
  console.log('🧪 测试增强卡片功能...\n');
  
  const testQuestions = [
    '查询结构件类库存',
    '查询充电类库存',
    '查询风险状态的物料'
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
        console.log(`🎴 统计卡片: ${result.data.cards ? result.data.cards.length : 0} 个`);
        
        if (result.data.cards && result.data.cards.length > 0) {
          console.log('📊 卡片详情:');
          result.data.cards.forEach((card, index) => {
            console.log(`  ${index + 1}. ${card.icon} ${card.title}: ${card.value}`);
            console.log(`     ${card.subtitle} (${card.type})`);
          });
        }
        
        // 检查数据限制
        if (result.data.dataCount > 20) {
          console.log(`✅ 数据限制已移除: 返回${result.data.dataCount}条记录 (超过20条)`);
        } else {
          console.log(`ℹ️ 数据量: ${result.data.dataCount}条记录`);
        }
        
      } else {
        console.log(`❌ 查询失败: ${result.data?.answer || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n✅ 卡片功能测试完成！');
}

testCardsAPI().catch(console.error);
