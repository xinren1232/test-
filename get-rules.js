/**
 * 获取规则信息
 */

import fetch from 'node-fetch';

async function getRules() {
  try {
    const response = await fetch('http://localhost:3002/api/assistant/rules');
    const data = await response.json();
    
    console.log('规则总数:', data.rules.length);
    console.log('\n规则列表:');
    
    data.rules.forEach((rule, i) => {
      console.log(`${i+1}. ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   示例: ${rule.example_query}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('获取规则失败:', error.message);
  }
}

getRules();
