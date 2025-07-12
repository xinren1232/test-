/**
 * 测试问答功能的脚本
 * 验证真实数据调取情况
 */

const testQueries = [
  // 基础查询测试
  {
    category: '基础查询',
    query: '查询电池库存',
    expectedDataTypes: ['inventory'],
    description: '测试物料库存查询功能'
  },
  {
    category: '基础查询',
    query: '查询BOE供应商库存',
    expectedDataTypes: ['inventory'],
    description: '测试供应商库存查询功能'
  },
  {
    category: '基础查询',
    query: '查询测试失败(NG)的记录',
    expectedDataTypes: ['inspection'],
    description: '测试NG测试结果查询功能'
  },
  {
    category: '基础查询',
    query: '查询风险状态的库存',
    expectedDataTypes: ['inventory'],
    description: '测试风险库存查询功能'
  },
  {
    category: '基础查询',
    query: '查询LCD显示屏测试情况',
    expectedDataTypes: ['inspection'],
    description: '测试物料测试情况查询功能'
  },

  // 高级分析测试
  {
    category: '高级分析',
    query: '对比聚龙和天马供应商表现',
    expectedDataTypes: ['inventory', 'inspection'],
    description: '测试供应商对比分析功能'
  },
  {
    category: '高级分析',
    query: '查询Top缺陷排行',
    expectedDataTypes: ['inspection'],
    description: '测试Top缺陷排行查询功能'
  },
  {
    category: '高级分析',
    query: '查询批次的综合信息（库存+测试+上线）',
    expectedDataTypes: ['inventory', 'inspection', 'production'],
    description: '测试批次综合信息查询功能'
  },

  // 图表工具测试
  {
    category: '图表工具',
    query: '生成LCD显示屏缺陷趋势图表',
    expectedDataTypes: ['inspection'],
    description: '测试物料缺陷趋势图表生成功能'
  },
  {
    category: '图表工具',
    query: '生成BOE和天马供应商质量对比图表',
    expectedDataTypes: ['inspection'],
    description: '测试供应商质量对比图表功能'
  }
];

async function testQAFunctionality() {
  console.log('🚀 开始测试问答功能...\n');
  
  const results = [];
  
  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];
    console.log(`📋 测试 ${i + 1}/${testQueries.length}: ${test.description}`);
    console.log(`❓ 查询: ${test.query}`);
    
    try {
      // 发送请求到问答API
      const response = await fetch('http://localhost:3000/api/intelligent-qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: test.query })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 查询成功');
        console.log(`📊 返回数据类型: ${typeof result.data}`);
        
        // 检查返回的数据结构
        if (result.data && result.data.answer) {
          console.log(`📝 答案长度: ${result.data.answer.length} 字符`);
          
          // 检查是否包含表格数据
          const hasTable = result.data.answer.includes('|') || result.data.answer.includes('表格');
          console.log(`📋 包含表格: ${hasTable ? '是' : '否'}`);
          
          // 检查是否包含图表数据
          const hasChart = result.data.charts && result.data.charts.length > 0;
          console.log(`📈 包含图表: ${hasChart ? '是' : '否'}`);
          
          results.push({
            query: test.query,
            category: test.category,
            success: true,
            hasData: result.data.answer.length > 50,
            hasTable: hasTable,
            hasChart: hasChart,
            responseLength: result.data.answer.length
          });
        } else {
          console.log('⚠️ 返回数据格式异常');
          results.push({
            query: test.query,
            category: test.category,
            success: false,
            error: '返回数据格式异常'
          });
        }
      } else {
        console.log('❌ 查询失败');
        console.log(`错误信息: ${result.message || '未知错误'}`);
        results.push({
          query: test.query,
          category: test.category,
          success: false,
          error: result.message || '未知错误'
        });
      }
    } catch (error) {
      console.log('❌ 请求失败');
      console.log(`错误信息: ${error.message}`);
      results.push({
        query: test.query,
        category: test.category,
        success: false,
        error: error.message
      });
    }
    
    console.log('---\n');
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 输出测试总结
  console.log('📊 测试总结:');
  console.log(`总测试数: ${results.length}`);
  console.log(`成功数: ${results.filter(r => r.success).length}`);
  console.log(`失败数: ${results.filter(r => !r.success).length}`);
  
  // 按分类统计
  const categoryStats = {};
  results.forEach(result => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = { total: 0, success: 0 };
    }
    categoryStats[result.category].total++;
    if (result.success) {
      categoryStats[result.category].success++;
    }
  });
  
  console.log('\n📋 分类统计:');
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category];
    console.log(`${category}: ${stats.success}/${stats.total} 成功`);
  });
  
  // 输出失败的测试
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n❌ 失败的测试:');
    failedTests.forEach(test => {
      console.log(`- ${test.query}: ${test.error}`);
    });
  }
  
  return results;
}

// 如果直接运行此脚本
if (typeof window === 'undefined') {
  testQAFunctionality().then(results => {
    console.log('\n🎉 测试完成!');
    process.exit(0);
  }).catch(error => {
    console.error('测试过程中出现错误:', error);
    process.exit(1);
  });
}

export { testQAFunctionality, testQueries };
