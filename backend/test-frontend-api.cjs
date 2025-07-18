// 测试前端API连接问题
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
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, error: 'Invalid JSON', raw: responseData });
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

async function testFrontendAPI() {
  console.log('🔍 测试前端API连接问题...\n');
  
  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查:');
    const healthResponse = await makeRequest('http://localhost:3001/api/health');
    console.log(`状态码: ${healthResponse.status}`);
    console.log(`响应: ${JSON.stringify(healthResponse.data, null, 2)}\n`);
    
    // 2. 测试规则API
    console.log('2. 测试规则API:');
    const rulesResponse = await makeRequest('http://localhost:3001/api/rules');
    console.log(`状态码: ${rulesResponse.status}`);
    if (rulesResponse.data && rulesResponse.data.success) {
      console.log(`✅ 获取到 ${rulesResponse.data.data.length} 条规则`);
      
      // 显示前3条规则
      rulesResponse.data.data.slice(0, 3).forEach((rule, index) => {
        console.log(`规则 ${index + 1}: ${rule.intent_name}`);
        console.log(`  触发词: ${rule.trigger_words || '无'}`);
        console.log(`  示例: ${rule.example_query || '无'}`);
      });
    } else {
      console.log('❌ 获取规则失败');
      console.log(`错误: ${JSON.stringify(rulesResponse, null, 2)}`);
    }
    
    // 3. 测试智能查询API - 基础查询
    console.log('\n3. 测试智能查询API:');
    
    const testQueries = [
      '库存基础查询',
      '查询库存信息',
      '库存',
      '库存数据',
      '显示库存',
      'inventory'
    ];
    
    for (const query of testQueries) {
      console.log(`\n测试查询: "${query}"`);
      
      try {
        const response = await makeRequest('http://localhost:3001/api/assistant/query', { query });
        
        console.log(`  状态码: ${response.status}`);
        
        if (response.data) {
          console.log(`  成功: ${response.data.success}`);
          console.log(`  消息: ${response.data.message}`);
          
          if (response.data.data && Array.isArray(response.data.data)) {
            console.log(`  数据条数: ${response.data.data.length}`);
            
            if (response.data.data.length > 0) {
              console.log(`  字段: ${Object.keys(response.data.data[0]).join(', ')}`);
              
              // 显示第一条数据
              const firstItem = response.data.data[0];
              console.log('  第一条数据:');
              Object.entries(firstItem).slice(0, 3).forEach(([key, value]) => {
                console.log(`    ${key}: ${value}`);
              });
            }
          } else {
            console.log(`  数据类型: ${typeof response.data.data}`);
            console.log(`  数据内容: ${JSON.stringify(response.data.data)}`);
          }
        } else {
          console.log(`  错误: ${response.error}`);
          console.log(`  原始响应: ${response.raw}`);
        }
        
      } catch (error) {
        console.log(`  连接错误: ${error.message}`);
      }
    }
    
    // 4. 测试特定场景查询
    console.log('\n\n4. 测试特定场景查询:');
    
    const scenarioQueries = [
      { query: '聚龙供应商的库存', description: '供应商筛选' },
      { query: '电池盖库存', description: '物料筛选' },
      { query: '检验数据', description: '检验场景' },
      { query: '生产数据', description: '生产场景' },
      { query: '系统概览', description: '统计场景' }
    ];
    
    for (const test of scenarioQueries) {
      console.log(`\n${test.description}: "${test.query}"`);
      
      const response = await makeRequest('http://localhost:3001/api/assistant/query', { query: test.query });
      
      if (response.data && response.data.success) {
        const dataCount = response.data.data ? response.data.data.length : 0;
        console.log(`  ✅ 成功: ${dataCount} 条数据`);
        
        if (dataCount > 0 && response.data.data[0]) {
          console.log(`  字段: ${Object.keys(response.data.data[0]).join(', ')}`);
        }
      } else {
        console.log(`  ❌ 失败: ${response.data ? response.data.message : '无响应'}`);
      }
    }
    
    // 5. 测试前端期望的查询格式
    console.log('\n\n5. 测试前端期望的查询格式:');
    
    // 模拟前端可能发送的查询
    const frontendQueries = [
      { query: '', description: '空查询' },
      { query: '测试', description: '简单测试' },
      { query: '全测试', description: '全测试' },
      { query: '库存基础查询', description: '精确规则名' }
    ];
    
    for (const test of frontendQueries) {
      console.log(`\n${test.description}: "${test.query}"`);
      
      if (test.query === '') {
        console.log('  跳过空查询');
        continue;
      }
      
      const response = await makeRequest('http://localhost:3001/api/assistant/query', { query: test.query });
      
      if (response.data) {
        console.log(`  状态: ${response.data.success ? '成功' : '失败'}`);
        console.log(`  消息: ${response.data.message}`);
        
        if (response.data.data) {
          const dataCount = Array.isArray(response.data.data) ? response.data.data.length : 1;
          console.log(`  数据: ${dataCount} 条`);
        }
      }
    }
    
    console.log('\n🎉 前端API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFrontendAPI();
