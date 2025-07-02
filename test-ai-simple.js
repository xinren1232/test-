/**
 * 简化的AI功能测试
 */

import fetch from 'node-fetch';

async function testAI() {
  console.log('🔍 测试AI功能...\n');

  try {
    // 1. 测试健康状态
    console.log('1. 测试后端健康状态...');
    const healthResponse = await fetch('http://localhost:3002/health');
    if (healthResponse.ok) {
      console.log('✅ 后端服务正常');
    } else {
      console.log('❌ 后端服务异常');
      return;
    }

    // 2. 测试传统问答
    console.log('\n2. 测试传统问答...');
    const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '你好' })
    });

    if (queryResponse.ok) {
      const result = await queryResponse.json();
      console.log('✅ 传统问答正常');
      console.log('回复:', typeof result.reply === 'string' ?
        result.reply.substring(0, 100) + '...' :
        JSON.stringify(result.reply).substring(0, 100) + '...');
    } else {
      console.log('❌ 传统问答失败');
    }

    // 3. 测试AI增强问答（非流式）
    console.log('\n3. 测试AI增强问答...');
    const aiResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '你好，请介绍一下你的功能' })
    });

    if (aiResponse.ok) {
      const result = await aiResponse.json();
      console.log('✅ AI增强问答正常');
      console.log('回复:', result.reply);
      console.log('来源:', result.source);
    } else {
      console.log('❌ AI增强问答失败');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAI();
