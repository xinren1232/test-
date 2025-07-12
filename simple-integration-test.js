import fetch from 'node-fetch';

async function testSimpleIntegration() {
  console.log('🧪 测试前端后端集成...\n');
  
  // 测试用例
  const testCases = [
    {
      name: '深圳工厂库存查询',
      query: '深圳工厂的库存情况',
      expectedFields: ['工厂', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间']
    },
    {
      name: 'BOE供应商查询',
      query: 'BOE供应商的物料',
      expectedFields: ['工厂', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间']
    },
    {
      name: '一般库存查询',
      query: '查询库存情况',
      expectedFields: ['工厂', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间']
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 测试: ${testCase.name}`);
    console.log(`📝 查询: ${testCase.query}`);
    
    try {
      // 调用后端API
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query
        })
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP错误: ${response.status}`);
        continue;
      }
      
      const result = await response.json();
      
      // 检查响应格式
      console.log(`📊 响应状态: ${result.success ? '成功' : '失败'}`);
      console.log(`📈 数据源: ${result.source || 'unknown'}`);
      
      if (result.success && result.data && result.data.tableData) {
        const tableData = result.data.tableData;
        console.log(`✅ 数据记录数: ${tableData.length}`);
        
        // 检查字段
        if (tableData.length > 0) {
          const actualFields = Object.keys(tableData[0]);
          console.log(`🔧 实际字段: ${actualFields.join(', ')}`);
          
          const missingFields = testCase.expectedFields.filter(field => !actualFields.includes(field));
          const extraFields = actualFields.filter(field => !testCase.expectedFields.includes(field));
          
          if (missingFields.length === 0 && extraFields.length === 0) {
            console.log('✅ 字段匹配完美');
          } else {
            if (missingFields.length > 0) {
              console.log(`⚠️ 缺少字段: ${missingFields.join(', ')}`);
            }
            if (extraFields.length > 0) {
              console.log(`ℹ️ 额外字段: ${extraFields.join(', ')}`);
            }
          }
          
          // 显示数据样例
          console.log('📋 数据样例:');
          console.table(tableData.slice(0, 3));
        }
        
        // 检查关键指标
        if (result.data.keyMetrics) {
          console.log('📊 关键指标:');
          result.data.keyMetrics.forEach(metric => {
            console.log(`  - ${metric.label}: ${metric.value} (${metric.trend})`);
          });
        }
        
      } else {
        console.log('❌ 无有效数据');
        console.log('🔍 响应结构:', JSON.stringify(result, null, 2));
      }
      
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
    }
  }
  
  console.log('\n🎯 集成测试完成');
}

testSimpleIntegration();
