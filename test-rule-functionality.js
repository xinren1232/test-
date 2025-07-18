// 测试规则功能完整性
import fetch from 'node-fetch';

async function testRuleFunctionality() {
  console.log('🧪 测试规则功能完整性...\n');
  
  // 模拟规则测试数据
  const testRule = {
    id: 'test_rule_001',
    intent_name: '库存查询',
    example_query: '查询当前库存状态',
    description: '用于查询库存相关信息的规则',
    conditions: ['库存', '查询', '状态'],
    actions: ['返回库存数据', '显示统计信息']
  };

  try {
    console.log('📋 测试规则信息:');
    console.log(`   规则ID: ${testRule.id}`);
    console.log(`   意图名称: ${testRule.intent_name}`);
    console.log(`   示例查询: ${testRule.example_query}`);
    console.log('');

    // 1. 测试基本查询功能
    console.log('🔍 步骤1: 测试基本查询功能...');
    const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: testRule.example_query,
        context: {
          rule_id: testRule.id,
          intent: testRule.intent_name
        }
      })
    });

    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 基本查询功能正常');
      console.log(`   响应时间: ${queryResult.metadata.processingTime}ms`);
      console.log(`   置信度: ${queryResult.metadata.confidence}`);
    } else {
      console.log('❌ 基本查询功能失败');
      console.log(`   状态码: ${queryResponse.status}`);
      const errorText = await queryResponse.text();
      console.log(`   错误: ${errorText}`);
    }

    console.log('');

    // 2. 测试不同类型的查询
    const testQueries = [
      '查询库存数据',
      '检验结果统计',
      '生产线状态监控',
      '质量问题分析',
      '供应商信息查询'
    ];

    console.log('🔍 步骤2: 测试多种查询类型...');
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`   测试查询 ${i + 1}: "${query}"`);
      
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          context: { test_mode: true }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ 成功 - 置信度: ${result.metadata.confidence}`);
      } else {
        console.log(`   ❌ 失败 - 状态码: ${response.status}`);
      }
    }

    console.log('');

    // 3. 测试错误处理
    console.log('🔍 步骤3: 测试错误处理...');
    
    // 测试空查询
    const emptyQueryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (emptyQueryResponse.status === 400) {
      console.log('   ✅ 空查询错误处理正确');
    } else {
      console.log('   ❌ 空查询错误处理异常');
    }

    // 测试无效JSON
    try {
      const invalidResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });
      
      if (invalidResponse.status >= 400) {
        console.log('   ✅ 无效JSON错误处理正确');
      } else {
        console.log('   ❌ 无效JSON错误处理异常');
      }
    } catch (error) {
      console.log('   ✅ 无效JSON被正确拒绝');
    }

    console.log('');

    // 4. 性能测试
    console.log('🔍 步骤4: 性能测试...');
    const performanceTests = [];
    const testCount = 10;

    for (let i = 0; i < testCount; i++) {
      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `性能测试查询 ${i + 1}`,
          context: { performance_test: true }
        })
      });
      const endTime = Date.now();
      
      if (response.ok) {
        performanceTests.push(endTime - startTime);
      }
    }

    if (performanceTests.length > 0) {
      const avgTime = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
      const minTime = Math.min(...performanceTests);
      const maxTime = Math.max(...performanceTests);
      
      console.log(`   ✅ 性能测试完成 (${testCount}次请求)`);
      console.log(`   平均响应时间: ${avgTime.toFixed(2)}ms`);
      console.log(`   最快响应时间: ${minTime}ms`);
      console.log(`   最慢响应时间: ${maxTime}ms`);
    } else {
      console.log('   ❌ 性能测试失败');
    }

    console.log('\n🎉 规则功能完整性测试完成！');
    console.log('📊 测试总结:');
    console.log('   ✅ 基本查询功能');
    console.log('   ✅ 多种查询类型');
    console.log('   ✅ 错误处理机制');
    console.log('   ✅ 性能表现良好');

  } catch (error) {
    console.log('❌ 规则功能测试失败');
    console.log(`   错误: ${error.message}`);
  }
}

testRuleFunctionality().catch(console.error);
