/**
 * 测试优化后的系统
 * 验证所有组件是否正常工作
 */

async function testOptimizedSystem() {
  console.log('🧪 测试优化后的系统...\n');
  
  const testQueries = [
    {
      query: '查询电池库存',
      expectedMode: 'structured_data',
      description: '简单数据查询，应该返回结构化数据'
    },
    {
      query: '分析物料质量趋势',
      expectedMode: 'ai_analysis',
      description: '复杂分析查询，应该使用AI增强处理'
    },
    {
      query: '显示库存统计图表',
      expectedMode: 'chart_visualization',
      description: '图表查询，应该返回图表数据'
    },
    {
      query: '查询聚龙供应商库存',
      expectedMode: 'structured_data',
      description: '供应商查询，应该返回过滤后的数据'
    }
  ];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];
    console.log(`📋 [${i + 1}/${testQueries.length}] 测试: ${test.query}`);
    console.log(`   期望模式: ${test.expectedMode}`);
    console.log(`   描述: ${test.description}`);
    
    try {
      const { default: fetch } = await import('node-fetch');
      
      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: test.query,
          analysisMode: 'auto'
        })
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log(`   ✅ 响应时间: ${responseTime}ms`);
      console.log(`   📊 处理模式: ${result.processingMode || '未知'}`);
      console.log(`   🔍 数据源: ${result.source || '未知'}`);
      console.log(`   🤖 AI增强: ${result.aiEnhanced ? '是' : '否'}`);
      
      // 验证响应格式
      if (!result.success) {
        console.log(`   ❌ 查询失败: ${result.error?.message || '未知错误'}`);
        failureCount++;
        continue;
      }
      
      // 验证处理模式
      if (test.expectedMode && result.processingMode !== test.expectedMode) {
        console.log(`   ⚠️  处理模式不匹配，期望: ${test.expectedMode}, 实际: ${result.processingMode}`);
      }
      
      // 验证数据内容
      if (result.data && Array.isArray(result.data)) {
        console.log(`   📊 返回数据: ${result.data.length} 条记录`);
        if (result.data.length > 0) {
          const fields = Object.keys(result.data[0]);
          console.log(`   🏷️  字段: ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`);
        }
      } else if (result.reply) {
        console.log(`   💬 AI回复: ${result.reply.substring(0, 100)}...`);
      }
      
      // 性能检查
      if (responseTime > 5000) {
        console.log(`   ⚠️  响应时间较长: ${responseTime}ms`);
      } else if (responseTime < 1000) {
        console.log(`   ⚡ 响应快速: ${responseTime}ms`);
      }
      
      successCount++;
      
    } catch (error) {
      console.log(`   ❌ 测试失败: ${error.message}`);
      failureCount++;
    }
    
    console.log('');
  }
  
  // 测试总结
  console.log('📊 测试总结:');
  console.log(`   ✅ 成功: ${successCount} 个查询`);
  console.log(`   ❌ 失败: ${failureCount} 个查询`);
  console.log(`   📈 成功率: ${((successCount / testQueries.length) * 100).toFixed(1)}%`);
  
  // 系统健康检查
  console.log('\n🏥 系统健康检查:');
  
  try {
    // 检查规则端点
    const { default: fetch } = await import('node-fetch');
    
    const rulesResponse = await fetch('http://localhost:3001/api/assistant/rules');
    const rulesData = await rulesResponse.json();
    
    if (rulesData.success) {
      console.log(`   ✅ 规则服务: 正常 (${rulesData.rules?.length || 0} 条规则)`);
    } else {
      console.log(`   ❌ 规则服务: 异常`);
    }
    
    // 检查测试端点
    const testResponse = await fetch('http://localhost:3001/api/assistant/test');
    const testData = await testResponse.json();
    
    if (testResponse.ok) {
      console.log(`   ✅ 基础服务: 正常`);
      console.log(`   🤖 AI服务状态: ${testData.aiServiceEnabled ? '启用' : '禁用'}`);
    } else {
      console.log(`   ❌ 基础服务: 异常`);
    }
    
  } catch (error) {
    console.log(`   ❌ 健康检查失败: ${error.message}`);
  }
  
  // 性能建议
  console.log('\n💡 性能建议:');
  if (successCount === testQueries.length) {
    console.log('   🎉 系统运行良好，所有测试通过！');
  } else if (successCount > testQueries.length * 0.8) {
    console.log('   ✅ 系统基本正常，少数查询需要优化');
  } else if (successCount > testQueries.length * 0.5) {
    console.log('   ⚠️  系统部分功能异常，需要检查配置');
  } else {
    console.log('   ❌ 系统存在严重问题，需要全面检查');
  }
  
  console.log('\n🔧 优化建议:');
  console.log('   1. 定期清理数据库连接池');
  console.log('   2. 监控内存使用情况');
  console.log('   3. 优化SQL查询性能');
  console.log('   4. 配置适当的缓存策略');
  console.log('   5. 设置查询超时限制');
}

// 执行测试
testOptimizedSystem().catch(error => {
  console.error('❌ 系统测试失败:', error);
  process.exit(1);
});
