/**
 * 测试AI服务健康状态
 */

import fetch from 'node-fetch';

async function testAIServiceHealth() {
  console.log('🔍 测试AI服务健康状态\n');
  
  // 1. 检查AI健康状态
  console.log('🏥 检查AI服务健康状态...');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/assistant/ai-health');
    
    if (!healthResponse.ok) {
      console.log(`❌ AI健康检查失败: ${healthResponse.status}`);
      return;
    }
    
    const healthResult = await healthResponse.json();
    console.log('✅ AI健康检查结果:');
    console.log(JSON.stringify(healthResult, null, 2));
    
  } catch (error) {
    console.error('❌ AI健康检查异常:', error.message);
    return;
  }
  
  // 2. 测试简单AI查询（非流式）
  console.log('\n🤖 测试简单AI查询...');
  try {
    const simpleQuery = {
      query: '请简单分析一下当前的库存情况',
      scenario: 'inventory_management',
      analysisMode: 'ai_enhanced'
    };
    
    console.log('发送查询:', simpleQuery.query);
    
    const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simpleQuery)
    });

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text();
      console.log(`❌ AI查询失败: ${queryResponse.status}`);
      console.log(`错误详情: ${errorText}`);
      return;
    }

    const queryResult = await queryResponse.json();
    console.log('✅ AI查询成功');
    
    if (queryResult.reply || queryResult.response) {
      const responseText = queryResult.reply || queryResult.response;
      console.log(`📋 响应长度: ${responseText.length}字符`);
      console.log(`📋 响应摘要: ${responseText.substring(0, 200)}...`);
      
      // 检查是否是AI增强响应
      if (responseText.length > 100 && (responseText.includes('分析') || responseText.includes('建议'))) {
        console.log('✅ 检测到AI增强分析特征');
      } else {
        console.log('⚠️ 可能是基础查询响应');
      }
    } else {
      console.log('❌ 无响应内容');
    }
    
  } catch (error) {
    console.error('❌ AI查询异常:', error.message);
  }
  
  // 3. 检查可用的API端点
  console.log('\n🔗 检查可用的API端点...');
  const endpoints = [
    '/api/assistant/query',
    '/api/assistant/ai-query',
    '/api/assistant/ai-health',
    '/api/assistant/update-data'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const testResponse = await fetch(`http://localhost:3001${endpoint}`, {
        method: endpoint.includes('health') ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.includes('health') ? undefined : JSON.stringify({ test: true })
      });
      
      console.log(`${endpoint}: ${testResponse.status} ${testResponse.statusText}`);
      
    } catch (error) {
      console.log(`${endpoint}: ❌ ${error.message}`);
    }
  }
  
  console.log('\n🎯 AI服务健康检查完成');
}

testAIServiceHealth().catch(console.error);
