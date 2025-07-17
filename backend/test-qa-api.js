import fetch from 'node-fetch';

async function testQAAPI() {
  const baseURL = 'http://localhost:3001';
  
  console.log('🧪 测试智能问答API...\n');

  // 测试问题列表
  const testQuestions = [
    '天马供应商的物料',
    '查询天马供应商库存',
    'BOE供应商物料情况',
    '聚龙供应商库存查询',
    '查询库存信息',
    '供应商物料查询'
  ];

  for (const question of testQuestions) {
    try {
      console.log(`🔍 测试问题: "${question}"`);
      
      const response = await fetch(`${baseURL}/api/intelligent-qa/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        console.log(`❌ HTTP错误: ${response.status}`);
        continue;
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ 查询成功`);
        console.log(`   意图: ${result.data?.analysis?.intent || '未识别'}`);
        console.log(`   数据条数: ${result.data?.data?.length || 0}`);
        
        if (result.data?.data?.length > 0) {
          console.log(`   字段: ${Object.keys(result.data.data[0]).join(', ')}`);
          console.log(`   示例数据: ${JSON.stringify(result.data.data[0], null, 2).substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ 查询失败: ${result.error || '未知错误'}`);
      }
      
      console.log(''); // 空行分隔
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
      console.log('');
    }
  }

  console.log('🎉 API测试完成！');
}

testQAAPI();
