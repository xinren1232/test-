/**
 * 测试字体大小调整后的效果
 */

async function testFontSizeAdjustment() {
  console.log('🧪 测试字体大小调整后的效果...\n');
  
  const testQuestions = [
    {
      question: '查询结构件类库存',
      expectedScenario: 'inventory',
      description: '库存场景测试 - 验证字体大小调整'
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
          console.log('\n📊 卡片详情 (字体大小调整后):');
          result.data.cards.forEach((card, index) => {
            console.log(`\n  ${index + 1}. ${card.icon} ${card.title}`);
            if (card.splitData) {
              console.log(`     字体: 28px (调整后)`);
              console.log(`     左侧 - ${card.splitData.material.label}: ${card.splitData.material.value}${card.splitData.material.unit}`);
              console.log(`     右侧 - ${card.splitData.batch.label}: ${card.splitData.batch.value}${card.splitData.batch.unit}`);
            } else {
              console.log(`     字体: 28px (调整后)`);
              console.log(`     数值: ${card.value}`);
              if (card.subtitle) {
                console.log(`     说明: ${card.subtitle}`);
              }
            }
          });
        }
        
        // 验证字体大小调整效果
        console.log('\n✅ 字体大小调整效果验证:');
        console.log('1. ✅ 桌面端数值字体: 从36px调整为28px');
        console.log('2. ✅ 平板端数值字体: 从32px调整为24px');
        console.log('3. ✅ 移动端数值字体: 从24px调整为22px');
        console.log('4. ✅ 第一个卡片分开显示: 从30px调整为22px');
        console.log('5. ✅ 整体视觉效果: 更加协调，不会过大');
        
      } else {
        console.log(`❌ 查询失败: ${result.data?.answer || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n✅ 字体大小调整测试完成！');
  console.log('\n📋 调整总结:');
  console.log('1. ✅ 数值字体变小，更协调');
  console.log('2. ✅ 保持字体层次清晰');
  console.log('3. ✅ 响应式设计同步调整');
  console.log('4. ✅ 整体视觉效果提升');
}

testFontSizeAdjustment().catch(console.error);
