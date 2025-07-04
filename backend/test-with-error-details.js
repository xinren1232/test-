/**
 * 测试参数提取并显示详细错误信息
 */

import fetch from 'node-fetch';

async function testWithErrorDetails() {
  console.log('🧪 测试参数提取并显示详细错误信息\n');
  
  // 1. 检查服务器是否运行
  console.log('🔍 检查服务器状态...');
  try {
    const healthResponse = await fetch('http://localhost:3001/health');
    if (healthResponse.ok) {
      console.log('✅ 服务器正在运行');
    } else {
      console.log('❌ 服务器响应异常:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ 无法连接到服务器:', error.message);
    console.log('请确保后端服务正在运行 (npm start)');
    return;
  }
  
  // 2. 推送测试数据
  console.log('\n📤 推送测试数据...');
  const testData = {
    inventory: [
      {
        id: 'test-001',
        materialName: '电池盖',
        supplier: '聚龙',
        factory: '深圳工厂',
        storage_location: '深圳工厂',
        status: '正常',
        quantity: 100,
        batchNo: 'JL2024001'
      }
    ],
    inspection: [],
    production: []
  };
  
  try {
    const updateResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const updateResult = await updateResponse.json();
    console.log('数据推送结果:', updateResult);
  } catch (error) {
    console.log('❌ 数据推送失败:', error.message);
    return;
  }
  
  // 3. 测试查询并显示详细信息
  console.log('\n🔍 测试查询...');
  const testQuery = '查询深圳工厂库存';
  
  try {
    const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: testQuery,
        scenario: 'inventory_management',
        analysisMode: 'intelligent'
      })
    });
    
    console.log('响应状态:', queryResponse.status);
    console.log('响应头:', Object.fromEntries(queryResponse.headers.entries()));
    
    const queryResult = await queryResponse.json();
    console.log('完整响应:', JSON.stringify(queryResult, null, 2));
    
    if (queryResult.success) {
      console.log('✅ 查询成功');
      if (queryResult.intentResult) {
        console.log('意图结果:', queryResult.intentResult);
        console.log('提取的参数:', queryResult.intentResult.params);
        console.log('查询结果数量:', queryResult.intentResult.results?.length || 0);
      }
    } else {
      console.log('❌ 查询失败');
      console.log('错误信息:', queryResult.error);
      console.log('错误详情:', queryResult.details);
    }
    
  } catch (error) {
    console.log('❌ 查询请求失败:', error.message);
    console.log('错误堆栈:', error.stack);
  }
  
  console.log('\n🎯 测试完成');
}

testWithErrorDetails().catch(console.error);
