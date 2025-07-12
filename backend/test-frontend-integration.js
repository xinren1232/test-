/**
 * 测试前端集成效果
 */

async function testFrontendIntegration() {
  console.log('🧪 测试前端集成效果...\n');
  
  const testQuery = '查询电池库存';
  
  try {
    console.log(`🔍 发送查询: "${testQuery}"`);
    
    const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: testQuery
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 查询成功');
      
      // 检查前端需要的关键字段
      console.log('\n📊 前端集成检查:');
      console.log(`   success: ${result.success}`);
      console.log(`   data存在: ${!!result.data}`);
      
      if (result.data) {
        console.log(`   answer: ${!!result.data.answer} (${result.data.answer ? '有内容' : '无内容'})`);
        console.log(`   tableData: ${!!result.data.tableData} (${result.data.tableData ? result.data.tableData.length + '条' : '无'})`);
        console.log(`   keyMetrics: ${!!result.data.keyMetrics} (${result.data.keyMetrics ? result.data.keyMetrics.length + '个' : '无'})`);
        console.log(`   summary: ${!!result.data.summary} (${result.data.summary || '无'})`);
        console.log(`   analysis: ${!!result.data.analysis} (${result.data.analysis ? '有' : '无'})`);
        
        // 检查前端类型判断逻辑
        const hasTableData = result.data.tableData && Array.isArray(result.data.tableData) && result.data.tableData.length > 0;
        const messageType = hasTableData ? 'table' : 'analysis';
        console.log(`   前端消息类型: ${messageType}`);
        
        if (hasTableData) {
          console.log('\n📋 表格数据预览:');
          const firstRow = result.data.tableData[0];
          console.log(`   列名: ${Object.keys(firstRow).join(', ')}`);
          console.log(`   首行数据: ${JSON.stringify(firstRow)}`);
        }
        
        if (result.data.keyMetrics && result.data.keyMetrics.length > 0) {
          console.log('\n📈 关键指标预览:');
          result.data.keyMetrics.slice(0, 3).forEach(metric => {
            console.log(`   ${metric.name}: ${metric.value}${metric.unit} (${metric.trend})`);
          });
        }
      }
      
      console.log('\n🎯 前端应该显示:');
      console.log('   ✅ 信息总结部分 (summary-section)');
      console.log('   ✅ 关键指标卡片 (metrics-grid)');
      console.log('   ✅ 数据可视化部分 (visualization-section)');
      console.log('   ✅ 数据表格 (data-table)');
      console.log('   ✅ 操作按钮 (导出数据、生成图表)');
      
    } else {
      console.log(`❌ 查询失败: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 请求异常: ${error.message}`);
  }
}

testFrontendIntegration();
