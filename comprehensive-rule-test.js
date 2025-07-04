/**
 * 全面测试优化后的智能问答规则
 */

const comprehensiveRuleTest = async () => {
  console.log('🧪 全面测试优化后的智能问答规则...');
  
  // 定义测试用例 - 基于您的真实数据
  const testCases = [
    // 工厂库存查询
    {
      category: '工厂库存查询',
      queries: [
        { query: '查询深圳工厂库存', expect: ['深圳工厂'] },
        { query: '重庆工厂的库存情况', expect: ['重庆工厂'] },
        { query: '南昌工厂风险库存', expect: ['南昌工厂', '风险'] },
        { query: '宜宾工厂正常状态库存', expect: ['宜宾工厂', '正常'] }
      ]
    },
    
    // 供应商物料查询
    {
      category: '供应商物料查询',
      queries: [
        { query: '查询聚龙供应商的物料', expect: ['聚龙'] },
        { query: '欣冠供应商电池盖库存', expect: ['欣冠', '电池盖'] },
        { query: 'BOE供应商OLED显示屏', expect: ['BOE', 'OLED显示屏'] },
        { query: '广正供应商风险物料', expect: ['广正', '风险'] }
      ]
    },
    
    // 物料库存查询
    {
      category: '物料库存查询',
      queries: [
        { query: '查询电池盖库存', expect: ['电池盖'] },
        { query: 'OLED显示屏库存情况', expect: ['OLED显示屏'] },
        { query: '电容器深圳工厂库存', expect: ['电容器', '深圳工厂'] },
        { query: '芯片风险库存', expect: ['芯片', '风险'] }
      ]
    },
    
    // 状态库存查询
    {
      category: '状态库存查询',
      queries: [
        { query: '查询风险库存', expect: ['风险'] },
        { query: '冻结状态库存', expect: ['冻结'] },
        { query: '正常库存统计', expect: ['正常'] },
        { query: '异常物料查询', expect: ['风险'] } // 异常 -> 风险
      ]
    },
    
    // 综合查询
    {
      category: '综合查询',
      queries: [
        { query: '查询深圳工厂聚龙供应商的电池盖', expect: ['深圳工厂', '聚龙', '电池盖'] },
        { query: '重庆工厂风险状态OLED显示屏', expect: ['重庆工厂', '风险', 'OLED显示屏'] },
        { query: '欣冠供应商冻结状态物料', expect: ['欣冠', '冻结'] },
        { query: '南昌工厂BOE供应商电容器', expect: ['南昌工厂', 'BOE', '电容器'] }
      ]
    },
    
    // 同义词测试
    {
      category: '同义词测试',
      queries: [
        { query: '查询显示屏库存', expect: ['OLED显示屏'] },
        { query: '危险物料查询', expect: ['风险'] },
        { query: '锁定状态库存', expect: ['冻结'] },
        { query: '合格物料统计', expect: ['正常'] }
      ]
    }
  ];
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const testCategory of testCases) {
    console.log(`\n📋 测试类别: ${testCategory.category}`);
    console.log('='.repeat(60));
    
    for (const testCase of testCategory.queries) {
      totalTests++;
      console.log(`\n🔍 测试查询: "${testCase.query}"`);
      console.log(`📝 期望包含: ${testCase.expect.join(', ')}`);
      
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: testCase.query,
            scenario: 'basic',
            analysisMode: 'rule'
          })
        });
        
        if (!response.ok) {
          console.log(`❌ HTTP错误: ${response.status}`);
          continue;
        }
        
        const result = await response.json();
        
        // 检查是否返回了数据
        const hasData = result.reply.includes('**查询结果**') && result.reply.includes('条记录');
        
        if (!hasData) {
          console.log(`❌ 未返回数据: ${result.reply.substring(0, 100)}...`);
          continue;
        }
        
        // 检查期望的关键词是否都包含在结果中
        const allExpectedFound = testCase.expect.every(keyword => 
          result.reply.includes(keyword)
        );
        
        // 提取记录数量
        const recordMatch = result.reply.match(/共 (\d+) 条记录/);
        const recordCount = recordMatch ? parseInt(recordMatch[1]) : 0;
        
        if (allExpectedFound && recordCount > 0) {
          console.log(`✅ 测试通过 - 找到 ${recordCount} 条记录`);
          passedTests++;
          
          // 显示前2条结果作为验证
          const lines = result.reply.split('\n').filter(line => line.includes('**') && line.includes('|'));
          if (lines.length > 0) {
            console.log(`📊 结果样本: ${lines[0].substring(0, 80)}...`);
          }
        } else {
          console.log(`❌ 测试失败:`);
          if (!allExpectedFound) {
            const missing = testCase.expect.filter(keyword => !result.reply.includes(keyword));
            console.log(`   缺失关键词: ${missing.join(', ')}`);
          }
          if (recordCount === 0) {
            console.log(`   记录数量为0`);
          }
        }
        
      } catch (error) {
        console.log(`❌ 请求异常: ${error.message}`);
      }
      
      // 添加小延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // 测试总结
  console.log('\n' + '='.repeat(80));
  console.log('🎯 测试总结');
  console.log('='.repeat(80));
  console.log(`📊 总测试数: ${totalTests}`);
  console.log(`✅ 通过测试: ${passedTests}`);
  console.log(`❌ 失败测试: ${totalTests - passedTests}`);
  console.log(`📈 通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！智能问答规则工作正常！');
  } else {
    console.log('\n⚠️ 部分测试失败，需要进一步优化规则');
  }
};

// 运行全面测试
comprehensiveRuleTest();
