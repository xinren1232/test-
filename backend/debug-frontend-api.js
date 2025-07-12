import fetch from 'node-fetch';

async function debugFrontendAPI() {
  console.log('🔍 调试前端API数据调取问题...\n');
  
  const baseURL = 'http://localhost:3001';
  
  // 测试前端实际发送的请求格式
  const testQueries = [
    {
      name: '前端格式测试1',
      payload: {
        question: '查询电池库存',
        intent: 'general_query'
      }
    },
    {
      name: '前端格式测试2', 
      payload: {
        question: '重庆工厂有什么物料',
        intent: 'factory_query'
      }
    },
    {
      name: '后端格式测试',
      payload: {
        query: '查询电池库存'
      }
    }
  ];

  for (const test of testQueries) {
    console.log(`📋 ${test.name}`);
    console.log(`请求体: ${JSON.stringify(test.payload, null, 2)}`);
    
    try {
      const response = await fetch(`${baseURL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      });

      console.log(`  状态码: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`  ❌ 错误响应: ${errorText}`);
        continue;
      }

      const result = await response.json();
      console.log(`  ✅ 响应成功`);
      console.log(`  响应结构:`);
      console.log(`    - success: ${result.success}`);
      console.log(`    - data: ${result.data ? `${result.data.length} 条记录` : '无'}`);
      console.log(`    - reply: ${result.reply ? '有' : '无'}`);
      console.log(`    - message: ${result.message ? '有' : '无'}`);
      
      if (result.data && result.data.length > 0) {
        console.log(`  📊 数据示例:`);
        console.log(`    ${JSON.stringify(result.data[0], null, 4)}`);
      }
      
      if (result.reply) {
        console.log(`  📝 回复内容: ${result.reply.substring(0, 100)}...`);
      }

    } catch (error) {
      console.log(`  ❌ 请求失败: ${error.message}`);
    }
    
    console.log('');
  }

  // 测试不同的API端点
  console.log('🔍 测试其他API端点:');
  
  const endpoints = [
    '/api/assistant/query',
    '/api/assistant/ai-query', 
    '/api/assistant/ai-enhance'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📋 测试端点: ${endpoint}`);
    
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: '查询电池库存',
          query: '查询电池库存'
        })
      });

      console.log(`  状态码: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`  ✅ 端点可用`);
        console.log(`  响应字段: ${Object.keys(result).join(', ')}`);
      } else {
        console.log(`  ❌ 端点不可用或错误`);
      }

    } catch (error) {
      console.log(`  ❌ 端点测试失败: ${error.message}`);
    }
  }

  // 检查后端服务状态
  console.log('\n🏥 检查后端服务状态:');
  try {
    const healthResponse = await fetch(`${baseURL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('  ✅ 后端服务健康');
      console.log(`  服务信息: ${JSON.stringify(healthData, null, 2)}`);
    }
  } catch (error) {
    console.log(`  ❌ 健康检查失败: ${error.message}`);
  }

  // 检查数据库连接
  console.log('\n💾 检查数据库连接:');
  try {
    const dbResponse = await fetch(`${baseURL}/api/assistant/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'SELECT COUNT(*) as total FROM inventory'
      })
    });

    if (dbResponse.ok) {
      const dbResult = await dbResponse.json();
      console.log('  ✅ 数据库连接正常');
      console.log(`  数据库响应: ${JSON.stringify(dbResult, null, 2)}`);
    }
  } catch (error) {
    console.log(`  ❌ 数据库连接测试失败: ${error.message}`);
  }
}

// 执行调试
debugFrontendAPI();
