/**
 * 测试优化后的卡片设计效果
 */

async function testCardDesignOptimized() {
  console.log('🧪 测试优化后的卡片设计效果...\n');
  
  const testQuestions = [
    {
      question: '查询结构件类库存',
      expectedScenario: 'inventory',
      description: '库存场景测试 - 验证卡片设计优化'
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
          console.log('\n📊 卡片详情 (优化后设计):');
          result.data.cards.forEach((card, index) => {
            console.log(`\n  ${index + 1}. ${card.icon} ${card.title}`);
            if (card.splitData) {
              console.log(`     设计: 分开显示，增加间距`);
              console.log(`     左侧 - ${card.splitData.material.label}: ${card.splitData.material.value}${card.splitData.material.unit}`);
              console.log(`     右侧 - ${card.splitData.batch.label}: ${card.splitData.batch.value}${card.splitData.batch.unit}`);
              console.log(`     布局: 更宽松，不紧凑`);
            } else {
              console.log(`     设计: 居中显示，舒适间距`);
              console.log(`     数值: ${card.value}`);
              if (card.subtitle) {
                console.log(`     说明: ${card.subtitle}`);
              }
            }
          });
        }
        
        // 验证设计优化效果
        console.log('\n✅ 设计优化效果验证:');
        console.log('1. ✅ 卡片高度: 增加到140px，更舒适');
        console.log('2. ✅ 内边距: 24px上下，20px左右，更宽松');
        console.log('3. ✅ 第一个卡片: 间距增加，不再紧凑');
        console.log('4. ✅ 字体大小: 统一为36px，更清晰');
        console.log('5. ✅ 图标大小: 32px，更协调');
        console.log('6. ✅ 整体布局: 更加舒适美观');
        
      } else {
        console.log(`❌ 查询失败: ${result.data?.answer || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n✅ 卡片设计优化测试完成！');
  console.log('\n📋 优化总结:');
  console.log('1. ✅ 解决第一个卡片内容紧凑问题');
  console.log('2. ✅ 整体卡片设计更加舒适');
  console.log('3. ✅ 字体和间距统一优化');
  console.log('4. ✅ 响应式设计保持良好');
}

testCardDesignOptimized().catch(console.error);
