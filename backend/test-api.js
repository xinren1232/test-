/**
 * API测试脚本
 * 测试后端API端点的功能
 */

async function testAPI() {
  console.log('🔍 开始测试API端点...');
  
  try {
    // 1. 测试健康检查端点
    console.log('\n1️⃣ 测试健康检查端点...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ 健康检查:', healthData);

    // 2. 测试API根端点
    console.log('\n2️⃣ 测试API根端点...');
    const apiResponse = await fetch('http://localhost:3001/api');
    const apiData = await apiResponse.json();
    console.log('✅ API信息:', apiData);

    // 3. 测试问答端点
    console.log('\n3️⃣ 测试问答端点...');
    const queries = [
      '查询高风险库存',
      '查询不良品',
      '查询BATCH001的测试结果',
      '查询M12345的库存',
      'BATCH001在哪条产线用了'
    ];

    for (const query of queries) {
      console.log(`\n🤖 测试查询: "${query}"`);
      
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (queryResponse.ok) {
        const queryData = await queryResponse.json();
        console.log('✅ 查询成功:', queryData.reply);
      } else {
        const errorData = await queryResponse.text();
        console.log('❌ 查询失败:', queryResponse.status, errorData);
      }
    }

    console.log('\n🎉 API测试完成！');

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

testAPI();
