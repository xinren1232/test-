/**
 * 测试前端到后端的API调用
 */

async function testFrontendAPI() {
  console.log('🔍 测试前端到后端的API调用...');
  
  try {
    // 1. 测试直接调用后端API
    console.log('\n1️⃣ 直接调用后端API...');
    const directResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: '查询高风险库存' })
    });

    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log('✅ 直接调用成功:', directData.reply.substring(0, 100) + '...');
    } else {
      console.log('❌ 直接调用失败:', directResponse.status);
    }

    // 2. 测试通过前端代理调用
    console.log('\n2️⃣ 通过前端代理调用...');
    const proxyResponse = await fetch('http://localhost:5173/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: '查询高风险库存' })
    });

    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      console.log('✅ 代理调用成功:', proxyData.reply.substring(0, 100) + '...');
    } else {
      console.log('❌ 代理调用失败:', proxyResponse.status);
      const errorText = await proxyResponse.text();
      console.log('错误信息:', errorText);
    }

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

testFrontendAPI();
