// 测试后端重启后的服务状态
const http = require('http');

async function testBackendRestart() {
  console.log('🧪 测试后端重启后的服务状态...\n');
  
  // 测试健康检查
  console.log('1. 测试健康检查接口:');
  try {
    const healthResponse = await fetch('http://localhost:3002/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ 健康检查成功:', healthData);
  } catch (error) {
    console.log('❌ 健康检查失败:', error.message);
  }
  
  // 测试查询接口
  console.log('\n2. 测试查询接口:');
  try {
    const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '全测试'
      })
    });
    
    const queryData = await queryResponse.json();
    console.log('✅ 查询接口响应:', {
      success: queryData.success,
      dataCount: queryData.data ? queryData.data.length : 0,
      hasData: queryData.hasData,
      message: queryData.message
    });
    
    if (queryData.data && queryData.data.length > 0) {
      console.log('   第一条数据字段:', Object.keys(queryData.data[0]));
    }
  } catch (error) {
    console.log('❌ 查询接口失败:', error.message);
  }
  
  // 测试规则接口
  console.log('\n3. 测试规则接口:');
  try {
    const rulesResponse = await fetch('http://localhost:3002/api/rules');
    const rulesData = await rulesResponse.json();
    console.log('✅ 规则接口成功:', {
      rulesCount: rulesData.length,
      firstRule: rulesData[0] ? rulesData[0].intent_name : 'N/A'
    });
  } catch (error) {
    console.log('❌ 规则接口失败:', error.message);
  }
  
  console.log('\n🎉 后端服务测试完成！');
}

testBackendRestart().catch(console.error);
