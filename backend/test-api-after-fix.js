/**
 * 测试修复后的API功能
 */

async function testAPIAfterFix() {
  console.log('🧪 测试修复后的API功能...\n');
  
  const testQueries = [
    {
      query: '查询电池库存',
      expected: '应该返回电池相关的库存数据，不超过20条'
    },
    {
      query: '查询聚龙供应商库存',
      expected: '应该返回聚龙供应商的库存数据'
    },
    {
      query: '查询在线跟踪',
      expected: '应该返回在线跟踪数据'
    },
    {
      query: '查询测试结果',
      expected: '应该返回测试结果数据'
    },
    {
      query: '分析物料大类别质量对比',
      expected: '应该返回物料大类别的质量对比分析'
    }
  ];
  
  // 简单的HTTP请求函数
  async function makeRequest(query) {
    try {
      const { default: fetch } = await import('node-fetch');
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];
    console.log(`📋 [${i + 1}/${testQueries.length}] 测试查询: "${test.query}"`);
    console.log(`   期望: ${test.expected}`);
    
    const result = await makeRequest(test.query);
    
    if (result.success) {
      console.log(`   ✅ 成功: 匹配意图 "${result.intent || result.matchedRule || '未知'}"`);
      
      if (result.data && Array.isArray(result.data)) {
        console.log(`   📊 返回数据: ${result.data.length} 条记录`);
        
        // 检查数据量是否合理
        if (result.data.length > 50) {
          console.log(`   ⚠️  数据量较大，可能需要优化过滤条件`);
        } else if (result.data.length === 0) {
          console.log(`   ⚠️  返回数据为空，可能需要检查查询条件`);
        } else {
          console.log(`   ✅ 数据量合理`);
        }
        
        if (result.data.length > 0) {
          const fields = Object.keys(result.data[0]);
          console.log(`   🏷️  字段: ${fields.join(', ')}`);
          
          // 显示第一条记录示例
          const sample = result.data[0];
          const sampleStr = JSON.stringify(sample);
          console.log(`   📝 示例: ${sampleStr.length > 100 ? sampleStr.substring(0, 100) + '...' : sampleStr}`);
        }
        
        successCount++;
        
      } else if (result.reply) {
        console.log(`   💬 AI回复: ${result.reply.substring(0, 100)}...`);
        successCount++;
        
      } else {
        console.log(`   ⚠️  返回格式异常: 既没有data也没有reply`);
        failureCount++;
      }
      
    } else {
      console.log(`   ❌ 失败: ${result.error?.message || '未知错误'}`);
      failureCount++;
    }
    
    console.log('');
  }
  
  // 测试总结
  console.log('📊 测试总结:');
  console.log(`   ✅ 成功: ${successCount} 个查询`);
  console.log(`   ❌ 失败: ${failureCount} 个查询`);
  console.log(`   📈 成功率: ${((successCount / testQueries.length) * 100).toFixed(1)}%`);
  
  if (successCount === testQueries.length) {
    console.log('\n🎉 所有测试通过！规则修复成功！');
  } else if (successCount > 0) {
    console.log('\n✅ 部分测试通过，系统基本可用');
  } else {
    console.log('\n❌ 所有测试失败，需要进一步检查');
  }
}

// 执行测试
testAPIAfterFix();
