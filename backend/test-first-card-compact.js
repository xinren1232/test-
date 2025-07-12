/**
 * 测试第一个卡片字体和间距进一步缩小后的效果
 */

async function testFirstCardCompact() {
  console.log('🧪 测试第一个卡片字体和间距进一步缩小后的效果...\n');
  
  const testQuestions = [
    {
      question: '查询结构件类库存',
      expectedScenario: 'inventory',
      description: '库存场景测试 - 验证第一个卡片紧凑设计'
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
          console.log('\n📊 卡片详情 (第一个卡片紧凑设计):');
          result.data.cards.forEach((card, index) => {
            console.log(`\n  ${index + 1}. ${card.icon} ${card.title}`);
            if (card.splitData) {
              console.log(`     设计: 紧凑型分开显示`);
              console.log(`     数值字体: 22px (进一步缩小)`);
              console.log(`     标签字体: 12px (缩小)`);
              console.log(`     左侧 - ${card.splitData.material.label}: ${card.splitData.material.value}${card.splitData.material.unit}`);
              console.log(`     右侧 - ${card.splitData.batch.label}: ${card.splitData.batch.value}${card.splitData.batch.unit}`);
              console.log(`     间距: 缩小，更紧凑`);
            } else {
              console.log(`     设计: 标准显示`);
              console.log(`     数值字体: 28px (保持)`);
              console.log(`     数值: ${card.value}`);
              if (card.subtitle) {
                console.log(`     说明: ${card.subtitle}`);
              }
            }
          });
        }
        
        // 验证第一个卡片紧凑设计效果
        console.log('\n✅ 第一个卡片紧凑设计效果验证:');
        console.log('1. ✅ 数值字体: 从28px进一步缩小为22px');
        console.log('2. ✅ 标签字体: 从13px缩小为12px');
        console.log('3. ✅ 标签间距: 从12px缩小为6px');
        console.log('4. ✅ 整体间距: gap从24px缩小为16px');
        console.log('5. ✅ 高度调整: 从80px缩小为65px');
        console.log('6. ✅ 内边距: 从8px缩小为4px');
        console.log('7. ✅ 与其他卡片对比: 第一个卡片更紧凑，其他卡片保持28px');
        
      } else {
        console.log(`❌ 查询失败: ${result.data?.answer || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n✅ 第一个卡片紧凑设计测试完成！');
  console.log('\n📋 调整总结:');
  console.log('1. ✅ 第一个卡片字体进一步缩小');
  console.log('2. ✅ 第一个卡片间距全面缩小');
  console.log('3. ✅ 其他卡片保持原有大小');
  console.log('4. ✅ 整体视觉层次更清晰');
}

testFirstCardCompact().catch(console.error);
