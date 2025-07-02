/**
 * 测试代理修复是否生效
 */
import fetch from 'node-fetch';

async function testProxyFix() {
  console.log('🔧 测试代理修复是否生效...\n');
  
  try {
    const testData = {
      inventory: [
        {
          id: 'TEST_001',
          materialName: '测试物料',
          materialCode: 'TEST-001',
          supplier: '测试供应商',
          quantity: 100,
          status: '正常',
          factory: '测试工厂'
        }
      ],
      inspection: [],
      production: []
    };
    
    console.log('📊 测试数据:', testData);
    
    // 1. 测试直接后端API
    console.log('\n🔄 步骤1: 测试直接后端API...');
    const backendResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📋 后端响应状态:', backendResponse.status);
    if (backendResponse.ok) {
      const backendResult = await backendResponse.json();
      console.log('✅ 后端推送成功:', backendResult);
    } else {
      const backendError = await backendResponse.text();
      console.log('❌ 后端推送失败:', backendError);
      return;
    }
    
    // 2. 测试前端代理
    console.log('\n🔄 步骤2: 测试前端代理...');
    const proxyResponse = await fetch('http://localhost:5173/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📋 代理响应状态:', proxyResponse.status);
    if (proxyResponse.ok) {
      const proxyResult = await proxyResponse.json();
      console.log('✅ 前端代理推送成功:', proxyResult);
    } else {
      const proxyError = await proxyResponse.text();
      console.log('❌ 前端代理推送失败:', proxyError);
      return;
    }
    
    // 3. 测试查询功能
    console.log('\n🔄 步骤3: 测试查询功能...');
    const queryResponse = await fetch('http://localhost:5173/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '查询测试物料' })
    });
    
    console.log('📋 查询响应状态:', queryResponse.status);
    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 查询成功:');
      console.log(queryResult.reply);
    } else {
      const queryError = await queryResponse.text();
      console.log('❌ 查询失败:', queryError);
    }
    
    console.log('\n🎉 代理修复测试完成！');
    console.log('💡 现在可以在浏览器中正常使用数据推送功能了');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

testProxyFix().catch(console.error);
