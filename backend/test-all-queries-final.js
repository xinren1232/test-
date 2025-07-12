/**
 * 最终测试所有查询类型
 */

async function testAllQueries() {
  console.log('🧪 最终测试所有查询类型...\n');
  
  const queries = [
    '查询电池库存',
    '查询BOE供应商库存',
    '查询测试失败(NG)的记录',
    '查询风险状态的库存'
  ];
  
  for (const query of queries) {
    console.log(`🔍 测试: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: query
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ 查询成功');
        console.log(`   模板: ${result.data.template}`);
        console.log(`   意图: ${result.data.analysis?.intent}`);
        console.log(`   实体: ${JSON.stringify(result.data.analysis?.entities)}`);
        
        // 检查表格数据
        if (result.data.tableData && Array.isArray(result.data.tableData)) {
          console.log(`   📊 表格数据: ${result.data.tableData.length} 条记录`);
          if (result.data.tableData.length > 0) {
            const firstRecord = result.data.tableData[0];
            const columns = Object.keys(firstRecord);
            console.log(`   📋 列名: ${columns.join(', ')}`);
          }
        } else {
          console.log(`   ❌ 无表格数据`);
        }
        
        // 检查关键指标
        if (result.data.keyMetrics && Array.isArray(result.data.keyMetrics)) {
          console.log(`   📈 关键指标: ${result.data.keyMetrics.length} 个`);
          result.data.keyMetrics.forEach(metric => {
            console.log(`      - ${metric.name}: ${metric.value}${metric.unit} (${metric.trend})`);
          });
        } else {
          console.log(`   ❌ 无关键指标`);
        }
        
        // 检查汇总信息
        if (result.data.summary) {
          console.log(`   📝 汇总: ${result.data.summary}`);
        }
        
      } else {
        console.log(`❌ 查询失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ 请求异常: ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🏁 所有测试完成');
}

testAllQueries();
