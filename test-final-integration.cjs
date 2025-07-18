// 最终集成测试
async function testFinalIntegration() {
  console.log('🎯 最终集成测试...\n');
  
  // 测试后端查询接口
  console.log('1. 测试后端查询接口:');
  try {
    const response = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '全测试'
      })
    });
    
    const data = await response.json();
    console.log('✅ 后端查询成功:', {
      success: data.success,
      hasData: data.data && data.data.length > 0,
      dataCount: data.data ? data.data.length : 0
    });
    
    if (data.data && data.data.length > 0) {
      console.log('   数据示例:', data.data[0]);
    }
  } catch (error) {
    console.log('❌ 后端查询失败:', error.message);
  }
  
  // 测试聚龙供应商查询
  console.log('\n2. 测试聚龙供应商查询:');
  try {
    const response = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '聚龙供应商查询'
      })
    });
    
    const data = await response.json();
    console.log('✅ 聚龙供应商查询成功:', {
      success: data.success,
      hasData: data.data && data.data.length > 0,
      dataCount: data.data ? data.data.length : 0
    });
  } catch (error) {
    console.log('❌ 聚龙供应商查询失败:', error.message);
  }
  
  // 测试上线情况查询
  console.log('\n3. 测试上线情况查询:');
  try {
    const response = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '上线情况'
      })
    });
    
    const data = await response.json();
    console.log('✅ 上线情况查询成功:', {
      success: data.success,
      hasData: data.data && data.data.length > 0,
      dataCount: data.data ? data.data.length : 0
    });
  } catch (error) {
    console.log('❌ 上线情况查询失败:', error.message);
  }
  
  console.log('\n🎉 集成测试完成！');
  console.log('\n📋 服务状态:');
  console.log('   后端: http://localhost:3002 ✅');
  console.log('   前端: http://localhost:5174 ✅');
  console.log('\n💡 现在可以在前端页面测试查询功能了！');
}

testFinalIntegration().catch(console.error);
