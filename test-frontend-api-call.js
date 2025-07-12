import fetch from 'node-fetch';

async function testFrontendAPICall() {
  console.log('🧪 测试前端API调用模拟...\n');
  
  // 模拟前端的API调用
  const testQuery = '深圳工厂的库存情况';
  
  try {
    console.log(`📝 发送查询: ${testQuery}`);
    
    // 模拟前端通过代理调用API
    const response = await fetch('http://localhost:5173/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery
      })
    });
    
    console.log(`📡 响应状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ HTTP错误: ${response.status} - ${errorText}`);
      return;
    }
    
    const result = await response.json();
    console.log('✅ API调用成功');
    console.log(`📊 响应格式检查:`);
    console.log(`  - success: ${result.success}`);
    console.log(`  - data存在: ${!!result.data}`);
    console.log(`  - tableData存在: ${!!(result.data && result.data.tableData)}`);
    console.log(`  - 数据记录数: ${result.data && result.data.tableData ? result.data.tableData.length : 0}`);
    
    if (result.success && result.data && result.data.tableData && result.data.tableData.length > 0) {
      console.log('\n📋 数据样例:');
      console.table(result.data.tableData.slice(0, 3));
      
      console.log('\n📊 关键指标:');
      if (result.data.keyMetrics) {
        result.data.keyMetrics.forEach(metric => {
          console.log(`  - ${metric.label}: ${metric.value} (${metric.trend})`);
        });
      }
      
      console.log('\n✅ 前端应该能正确显示这些真实数据');
    } else {
      console.log('\n❌ 数据格式不正确，前端可能无法正确显示');
    }
    
  } catch (error) {
    console.log(`❌ API调用失败: ${error.message}`);
    
    // 尝试直接调用后端API
    console.log('\n🔄 尝试直接调用后端API...');
    try {
      const directResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testQuery
        })
      });
      
      if (directResponse.ok) {
        const directResult = await directResponse.json();
        console.log('✅ 直接调用后端API成功');
        console.log(`📊 数据记录数: ${directResult.data?.tableData?.length || 0}`);
        console.log('💡 问题可能在于前端代理配置');
      } else {
        console.log(`❌ 直接调用后端API也失败: ${directResponse.status}`);
      }
    } catch (directError) {
      console.log(`❌ 直接调用后端API失败: ${directError.message}`);
    }
  }
}

testFrontendAPICall();
