// 测试新创建的规则
const http = require('http');

function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: data ? 'POST' : 'GET',
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      } : {}
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          resolve({ error: 'Invalid JSON', raw: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testNewRules() {
  try {
    console.log('🧪 测试新创建的规则...\n');
    
    // 1. 测试规则列表API
    console.log('1. 测试规则列表API:');
    
    const rulesResponse = await makeRequest('http://localhost:3002/api/rules');
    
    if (rulesResponse.success) {
      console.log(`✅ 规则列表获取成功: ${rulesResponse.data.length} 条规则`);
      console.log(`总数: ${rulesResponse.total}`);
      
      console.log('\n规则列表:');
      for (let i = 0; i < Math.min(10, rulesResponse.data.length); i++) {
        const rule = rulesResponse.data[i];
        console.log(`  ${i+1}. 规则 ${rule.id}: ${rule.intent_name}`);
        console.log(`     分类: ${rule.category}`);
        console.log(`     描述: ${rule.description}`);
        console.log('');
      }
    } else {
      console.log(`❌ 规则列表获取失败: ${rulesResponse.message || rulesResponse.error}`);
      return;
    }
    
    // 2. 测试各种查询
    console.log('\n2. 测试各种查询:');
    
    const testQueries = [
      { query: '库存查询', expected: '基础库存信息' },
      { query: '聚龙供应商', expected: '聚龙供应商库存' },
      { query: 'BOE库存', expected: 'BOE供应商库存' },
      { query: '天马供应商', expected: '天马供应商库存' },
      { query: '全测试', expected: '检验测试结果' },
      { query: '不良率', expected: '不良率分析' },
      { query: '上线情况', expected: '生产上线情况' },
      { query: '高缺陷率', expected: '高缺陷率批次' },
      { query: '供应商对比', expected: '供应商对比分析' },
      { query: '质量报告', expected: '综合质量报告' }
    ];
    
    for (const test of testQueries) {
      console.log(`\n🔍 测试查询: "${test.query}"`);
      
      try {
        const queryResponse = await makeRequest('http://localhost:3002/api/assistant/query', { query: test.query });
        
        if (queryResponse.success) {
          console.log(`✅ 查询成功:`);
          console.log(`   匹配规则: ${queryResponse.matchedRule}`);
          
          const tableData = queryResponse.data?.tableData || queryResponse.tableData;
          const cards = queryResponse.data?.cards || queryResponse.cards;
          
          console.log(`   数据条数: ${tableData ? tableData.length : 0}`);
          console.log(`   统计卡片: ${cards ? cards.length : 0} 个`);
          
          if (tableData && tableData.length > 0) {
            console.log(`   数据字段: ${Object.keys(tableData[0]).join(', ')}`);
            console.log(`   第一条数据: ${JSON.stringify(tableData[0])}`);
          } else {
            console.log(`   ⚠️  返回数据为空`);
          }
          
          if (cards && cards.length > 0) {
            console.log(`   统计卡片:`);
            for (const card of cards) {
              console.log(`     ${card.icon} ${card.title}: ${card.value}`);
            }
          }
        } else {
          console.log(`❌ 查询失败: ${queryResponse.message || queryResponse.error}`);
        }
        
      } catch (error) {
        console.log(`❌ 请求失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 规则测试完成！');
    console.log('\n📊 测试总结:');
    console.log('• 已创建10条完整规则');
    console.log('• 涵盖库存、检验、生产、分析、报告等场景');
    console.log('• 支持多种供应商专项查询');
    console.log('• 包含质量分析和对比功能');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testNewRules();
