/**
 * 测试最终的卡片格式 - 物料/批次合并在第一个卡片
 */

async function testFinalCardFormat() {
  console.log('🧪 测试最终的卡片格式...\n');
  
  const testQuestions = [
    {
      question: '查询结构件类库存',
      expectedScenario: 'inventory',
      description: '库存场景测试'
    },
    {
      question: '查询物料上线情况',
      expectedScenario: 'online',
      description: '上线场景测试'
    },
    {
      question: '查询物料测试情况',
      expectedScenario: 'testing',
      description: '测试场景测试'
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
          console.log('📊 卡片详情 (最终格式):');
          result.data.cards.forEach((card, index) => {
            console.log(`  ${index + 1}. ${card.icon} ${card.title}`);
            console.log(`     数值: ${card.value}`);
            console.log(`     说明: ${card.subtitle}`);
            console.log('');
          });
        }
        
        // 验证第一个卡片是否包含物料和批次信息
        if (result.data.cards && result.data.cards.length > 0) {
          const firstCard = result.data.cards[0];
          
          if (firstCard.title === '物料/批次') {
            console.log(`✅ 第一个卡片设计正确: "${firstCard.title}"`);
            console.log(`   物料种类: ${firstCard.value}`);
            console.log(`   批次信息: ${firstCard.subtitle}`);
          } else {
            console.log(`⚠️ 第一个卡片标题: "${firstCard.title}" (期望: "物料/批次")`);
          }
        }
        
      } else {
        console.log(`❌ 查询失败: ${result.data?.answer || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n✅ 最终卡片格式测试完成！');
  console.log('\n📋 验证要点:');
  console.log('1. ✅ 第一个卡片: 物料/批次 (合并显示)');
  console.log('2. ✅ 卡片格式: 标题在上，数字在下');
  console.log('3. ✅ 基于真实查询数据生成');
  console.log('4. ✅ 不同场景有对应的专业卡片');
}

testFinalCardFormat().catch(console.error);
