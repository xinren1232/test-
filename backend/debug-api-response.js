/**
 * 调试API响应内容
 * 查看实际返回的内容是什么
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';

async function debugAPIResponse() {
  console.log('🔍 调试API响应内容...');

  try {
    const response = await fetch(`${BACKEND_URL}/api/assistant/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '查询测试结果'
      })
    });

    if (!response.ok) {
      console.log(`❌ HTTP错误: ${response.status}`);
      return;
    }

    const result = await response.json();
    
    console.log('📡 完整响应结构:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.reply) {
      console.log('\n💬 回复内容:');
      console.log(result.reply);
      
      console.log('\n📊 回复内容分析:');
      console.log(`- 长度: ${result.reply.length} 字符`);
      console.log(`- 包含"项目": ${result.reply.includes('项目')}`);
      console.log(`- 包含"基线": ${result.reply.includes('基线')}`);
      console.log(`- 包含"物料类型": ${result.reply.includes('物料类型')}`);
      console.log(`- 包含"数量": ${result.reply.includes('数量')}`);
      console.log(`- 包含"不合格描述": ${result.reply.includes('不合格描述')}`);
    }

  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

// 执行调试
debugAPIResponse().catch(console.error);
