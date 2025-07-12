import fetch from 'node-fetch';

async function testAssistantAPI() {
  console.log('🧪 测试问答界面API...\n');
  
  const baseURL = 'http://localhost:3001';
  const testQueries = [
    {
      name: '电池库存查询',
      query: '查询电池库存',
      expectedKeywords: ['电池', '库存', '数量']
    },
    {
      name: '重庆工厂查询',
      query: '重庆工厂有什么物料',
      expectedKeywords: ['重庆工厂', '物料', '工厂']
    },
    {
      name: 'BOE供应商查询',
      query: '查询BOE供应商的物料',
      expectedKeywords: ['BOE', '供应商', '物料']
    },
    {
      name: '测试记录查询',
      query: '查询测试记录',
      expectedKeywords: ['测试', '记录']
    }
  ];

  for (const test of testQueries) {
    console.log(`📋 测试: ${test.name}`);
    console.log(`查询: "${test.query}"`);
    
    try {
      const response = await fetch(`${baseURL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: test.query,
          query: test.query
        })
      });

      if (!response.ok) {
        console.log(`  ❌ HTTP错误: ${response.status} ${response.statusText}`);
        continue;
      }

      const result = await response.json();
      console.log(`  ✅ 响应状态: ${response.status}`);
      
      if (result.reply) {
        console.log(`  📝 回复内容: ${result.reply.substring(0, 100)}...`);
        
        // 检查是否包含预期关键词
        const hasExpectedKeywords = test.expectedKeywords.some(keyword => 
          result.reply.includes(keyword)
        );
        
        if (hasExpectedKeywords) {
          console.log(`  ✅ 包含预期关键词`);
        } else {
          console.log(`  ⚠️ 未包含预期关键词: ${test.expectedKeywords.join(', ')}`);
        }
      } else if (result.data) {
        console.log(`  📊 返回数据: ${Array.isArray(result.data) ? result.data.length : 'N/A'} 条记录`);
        
        if (Array.isArray(result.data) && result.data.length > 0) {
          console.log(`  📋 示例数据: ${JSON.stringify(result.data[0])}`);
        }
      } else {
        console.log(`  ⚠️ 响应格式异常: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`  ❌ 连接被拒绝: 后端服务可能未启动 (端口 3001)`);
      } else {
        console.log(`  ❌ 请求失败: ${error.message}`);
      }
    }
    
    console.log('');
  }

  // 测试健康检查
  console.log('🏥 测试健康检查:');
  try {
    const healthResponse = await fetch(`${baseURL}/health`);
    if (healthResponse.ok) {
      console.log('  ✅ 后端服务正常运行');
    } else {
      console.log(`  ⚠️ 健康检查失败: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log(`  ❌ 无法连接到后端服务: ${error.message}`);
    console.log('  💡 请确保后端服务已启动: npm run dev (在backend目录)');
  }
}

// 执行测试
testAssistantAPI();
