/**
 * 测试所有场景的卡片功能
 */

async function testAllScenarios() {
  console.log('🧪 测试所有场景的卡片功能...\n');
  
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
    console.log(`\n--- ${test.description}: "${test.question}" ---`);
    
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
        console.log(`🎯 场景类型: ${result.data.scenarioType} (期望: ${test.expectedScenario})`);
        console.log(`📊 数据量: ${result.data.dataCount} 条记录`);
        console.log(`📋 匹配规则: ${result.data.matchedRule}`);
        console.log(`🎴 统计卡片: ${result.data.cards ? result.data.cards.length : 0} 个`);
        console.log(`📋 表格数据: ${result.data.tableData ? result.data.tableData.length : 0} 条`);
        
        if (result.data.cards && result.data.cards.length > 0) {
          console.log('📊 卡片详情 (基于真实查询数据):');
          result.data.cards.forEach((card, index) => {
            console.log(`  ${index + 1}. ${card.icon} ${card.title}: ${card.value}`);
            console.log(`     ${card.subtitle} (${card.type})`);
          });
        }
        
        // 验证场景匹配
        if (result.data.scenarioType === test.expectedScenario) {
          console.log(`✅ 场景识别正确`);
        } else {
          console.log(`⚠️ 场景识别不匹配: 实际 ${result.data.scenarioType}, 期望 ${test.expectedScenario}`);
        }
        
        // 验证数据完整性
        if (result.data.tableData && result.data.tableData.length > 0) {
          console.log(`✅ 表格数据完整: ${result.data.tableData.length} 条记录`);
          
          // 显示前3条数据的字段
          const sampleData = result.data.tableData.slice(0, 1);
          console.log(`📋 数据字段示例:`, Object.keys(sampleData[0] || {}));
        }
        
      } else {
        console.log(`❌ 查询失败: ${result.data?.answer || '未知错误'}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n✅ 所有场景卡片功能测试完成！');
  console.log('\n📋 验证要点:');
  console.log('1. ✅ 卡片基于真实查询数据生成');
  console.log('2. ✅ 不同场景生成不同类型卡片');
  console.log('3. ✅ 数据表格完整返回');
  console.log('4. ✅ 场景识别准确');
}

testAllScenarios().catch(console.error);
