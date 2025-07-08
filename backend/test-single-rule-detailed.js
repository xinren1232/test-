/**
 * 详细测试单个规则功能
 */

import fetch from 'node-fetch';

async function testSingleRuleDetailed() {
  console.log('🧪 详细测试单个规则功能...\n');
  
  try {
    // 1. 获取第一条规则
    const rulesResponse = await fetch('http://localhost:3001/api/assistant/rules');
    const rulesResult = await rulesResponse.json();
    
    if (!rulesResult.success || !rulesResult.rules || rulesResult.rules.length === 0) {
      console.log('❌ 无法获取规则列表');
      return;
    }
    
    const testRule = rulesResult.rules[0];
    console.log(`📋 测试规则: ${testRule.intent_name}`);
    console.log(`📝 示例查询: ${testRule.example_query}`);
    console.log(`🔧 动作类型: ${testRule.action_type}`);
    console.log(`📊 参数: ${testRule.parameters}\n`);
    
    // 2. 测试规则功能
    console.log('🔍 发送查询请求...');
    
    const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        query: testRule.example_query 
      })
    });
    
    console.log(`📡 响应状态: ${queryResponse.status}`);
    console.log(`📡 响应头: ${JSON.stringify(Object.fromEntries(queryResponse.headers))}`);
    
    const responseText = await queryResponse.text();
    console.log(`📄 原始响应: ${responseText.substring(0, 500)}...`);
    
    // 3. 尝试解析JSON响应
    let queryResult;
    try {
      queryResult = JSON.parse(responseText);
      console.log(`✅ JSON解析成功`);
      console.log(`📊 响应结构: ${JSON.stringify(Object.keys(queryResult))}`);
      
      if (queryResult.success) {
        console.log(`✅ 查询成功`);
        if (queryResult.data) {
          console.log(`📊 数据条数: ${Array.isArray(queryResult.data) ? queryResult.data.length : '非数组'}`);
          if (Array.isArray(queryResult.data) && queryResult.data.length > 0) {
            console.log(`📋 样本数据: ${JSON.stringify(queryResult.data[0])}`);
          }
        } else {
          console.log(`⚠️ 响应中无data字段`);
        }
      } else {
        console.log(`❌ 查询失败: ${queryResult.message || '未知错误'}`);
        if (queryResult.error) {
          console.log(`🔍 错误详情: ${queryResult.error}`);
        }
      }
    } catch (parseError) {
      console.log(`❌ JSON解析失败: ${parseError.message}`);
      console.log(`📄 响应内容: ${responseText}`);
    }
    
    // 4. 测试其他几个查询
    console.log('\n🔍 测试其他查询...');
    
    const testQueries = [
      '深圳工厂的库存情况',
      '查询测试结果',
      '库存统计'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🧪 测试查询: "${query}"`);
      
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log(`  ✅ 成功 - 返回 ${Array.isArray(result.data) ? result.data.length : '非数组'} 条数据`);
        } else {
          console.log(`  ❌ 失败 - ${result.message || '未知错误'}`);
        }
      } catch (error) {
        console.log(`  ❌ 异常 - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ 测试过程出错:', error.message);
  }
}

// 执行测试
testSingleRuleDetailed();
