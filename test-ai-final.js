/**
 * 最终AI功能测试
 */

import fetch from 'node-fetch';

async function testAIFinal() {
  console.log('🎯 最终AI功能测试...\n');

  try {
    // 1. 测试AI健康状态
    console.log('1. 测试AI健康状态...');
    const healthResponse = await fetch('http://localhost:3002/api/assistant/ai-health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ AI健康状态:', health.status);
      console.log('   DeepSeek状态:', health.deepSeek.status);
    } else {
      console.log('❌ AI健康检查失败');
      return;
    }

    // 2. 测试AI调试端点
    console.log('\n2. 测试AI调试端点...');
    const debugResponse = await fetch('http://localhost:3002/api/assistant/debug-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '你好，请介绍一下你的功能' })
    });

    if (debugResponse.ok) {
      const debugResult = await debugResponse.json();
      console.log('✅ AI调试成功');
      console.log('   查询:', debugResult.query);
      console.log('   AI响应:', debugResult.aiResponse);
    } else {
      console.log('❌ AI调试失败');
    }

    // 3. 测试正常查询端点
    console.log('\n3. 测试正常查询端点...');
    const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '你好，请介绍一下你的功能' })
    });

    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 查询成功');
      console.log('   回复:', queryResult.reply);
      console.log('   来源:', queryResult.source);
    } else {
      console.log('❌ 查询失败');
    }

    // 4. 测试简单问候
    console.log('\n4. 测试简单问候...');
    const helloResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '你好' })
    });

    if (helloResponse.ok) {
      const helloResult = await helloResponse.json();
      console.log('✅ 问候成功');
      console.log('   回复:', helloResult.reply.substring(0, 100) + '...');
      console.log('   来源:', helloResult.source);
    } else {
      console.log('❌ 问候失败');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }

  console.log('\n🎯 测试完成！');
}

testAIFinal();
