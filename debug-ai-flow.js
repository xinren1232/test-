/**
 * 调试AI处理流程
 */

import fetch from 'node-fetch';

async function debugAIFlow() {
  console.log('🔍 调试AI处理流程...\n');

  try {
    // 测试简单问候
    console.log('=== 测试1: 简单问候 ===');
    const response1 = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '你好' })
    });

    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ 响应成功');
      console.log('类型:', typeof result1.reply);
      console.log('来源:', result1.source);
      
      if (typeof result1.reply === 'string') {
        console.log('回复内容:', result1.reply.substring(0, 200) + '...');
      } else {
        console.log('回复对象:', result1.reply);
        if (result1.reply && result1.reply.choices) {
          console.log('实际内容:', result1.reply.choices[0].message.content);
        }
      }
    }

    console.log('\n=== 测试2: 功能介绍 ===');
    const response2 = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '请介绍一下你的功能' })
    });

    if (response2.ok) {
      const result2 = await response2.json();
      console.log('✅ 响应成功');
      console.log('类型:', typeof result2.reply);
      console.log('来源:', result2.source);
      
      if (typeof result2.reply === 'string') {
        console.log('回复内容:', result2.reply.substring(0, 200) + '...');
      } else {
        console.log('回复对象:', result2.reply);
        if (result2.reply && result2.reply.choices) {
          console.log('实际内容:', result2.reply.choices[0].message.content);
        }
      }
    }

    console.log('\n=== 测试3: 流式AI查询 ===');
    const response3 = await fetch('http://localhost:3002/api/assistant/ai-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '你好，请介绍一下你的功能' })
    });

    console.log('流式响应状态:', response3.status);
    console.log('内容类型:', response3.headers.get('content-type'));

    if (response3.ok) {
      const text = await response3.text();
      console.log('流式响应内容:');
      console.log(text.substring(0, 500) + '...');
    }

  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugAIFlow();
