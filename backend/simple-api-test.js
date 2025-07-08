import fetch from 'node-fetch';

async function simpleAPITest() {
  console.log('🌐 简单API连接测试...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // 测试健康检查
    console.log('=== 测试1：健康检查 ===');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthResult = await healthResponse.json();
    console.log('健康检查结果:', healthResult);
    
    // 测试API根路径
    console.log('\n=== 测试2：API根路径 ===');
    const apiResponse = await fetch(`${baseURL}/api`);
    const apiResult = await apiResponse.json();
    console.log('API根路径结果:', apiResult);
    
    // 测试助手查询
    console.log('\n=== 测试3：助手查询 ===');
    const queryResponse = await fetch(`${baseURL}/api/assistant/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '查询库存信息'
      })
    });
    
    console.log('查询响应状态:', queryResponse.status);
    const queryResult = await queryResponse.json();
    console.log('查询结果结构:', JSON.stringify(queryResult, null, 2));
    
    if (queryResult.success) {
      console.log('✅ API查询成功');
      
      // 检查数据结构
      if (queryResult.data && Array.isArray(queryResult.data)) {
        console.log(`📊 返回记录数: ${queryResult.data.length}`);
        if (queryResult.data.length > 0) {
          console.log('📋 第一条记录字段:', Object.keys(queryResult.data[0]).join(', '));
          console.log('📋 第一条记录示例:', queryResult.data[0]);
        }
      } else {
        console.log('📊 数据结构:', typeof queryResult.data);
      }
    } else {
      console.log('❌ API查询失败:', queryResult.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

simpleAPITest().catch(console.error);
