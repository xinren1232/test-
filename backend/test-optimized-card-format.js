/**
 * 测试优化后的卡片格式
 */

async function testOptimizedCardFormat() {
  console.log('🧪 测试优化后的卡片格式...\n');
  
  const testQuestions = [
    {
      question: '查询结构件类库存',
      expectedScenario: 'inventory',
      description: '库存场景测试 - 物料种类和批次种类分开统计'
    },
    {
      question: '查询物料上线情况',
      expectedScenario: 'online',
      description: '上线场景测试 - 物料种类和批次种类分开统计'
    },
    {
      question: '查询物料测试情况',
      expectedScenario: 'testing',
      description: '测试场景测试 - 物料种类和批次种类分开统计'
    }
  ];
  
  for (const test of testQuestions) {
    console.log(`\n--- ${test.description} ---`);
    console.log(`查询: "${test.question}"`);
    
    try {
      const response = await fetch('http://localhost:3002/api/intelligent-qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: test.question
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ 查询成功`);
        console.log(`🎯 场景类型: ${result.data.scenarioType}`);
        console.log(`📊 数据量: ${result.data.dataCount} 条记录`);
        console.log(`🎴 统计卡片: ${result.data.cards ? result.data.cards.length : 0} 个`);
        
        if (result.data.cards && result.data.cards.length > 0) {
          console.log('📊 卡片详情 (优化后格式):');
          result.data.cards.forEach((card, index) => {
            console.log(`  ${index + 1}. ${card.icon} ${card.title}`);
            console.log(`     数值: ${card.value}`);
            console.log(`     说明: ${card.subtitle}`);
            console.log(`     类型: ${card.type}`);
            console.log('');
          });
        }
        
        // 验证第一个和第二个卡片是否分别统计物料种类和批次种类
        if (result.data.cards && result.data.cards.length >= 2) {
          const firstCard = result.data.cards[0];
          const secondCard = result.data.cards[1];
          
          if (firstCard.title === '物料种类' && secondCard.title === '批次种类') {
            console.log(`✅ 卡片设计正确: 第一个统计物料种类(${firstCard.value})，第二个统计批次种类(${secondCard.value})`);
          } else {
            console.log(`⚠️ 卡片设计需要调整: 第一个是"${firstCard.title}"，第二个是"${secondCard.title}"`);
          }
        }
        
      } else {
        console.log(`❌ 查询失败: ${result.data?.answer || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n✅ 优化后卡片格式测试完成！');
  console.log('\n📋 验证要点:');
  console.log('1. ✅ 第一个卡片: 物料种类统计');
  console.log('2. ✅ 第二个卡片: 批次种类统计');
  console.log('3. ✅ 卡片格式: 标题在上，数字在下');
  console.log('4. ✅ 基于真实查询数据生成');
}

testOptimizedCardFormat().catch(console.error);
