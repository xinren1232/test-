import http from 'http';

async function testRulesAPI() {
  try {
    console.log('🔍 测试规则库API...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/assistant/rules',
      method: 'GET'
    };
    
    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error('解析响应失败: ' + error.message));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
    
    console.log('✅ 规则库API响应成功');
    console.log('📊 规则数量:', result.data ? result.data.length : 0);
    
    if (result.data && result.data.length > 0) {
      console.log('\n📋 前10个规则的示例查询:');
      result.data.slice(0, 10).forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name}: "${rule.example_query}"`);
      });
      
      // 检查是否有重复的示例查询
      const exampleQueries = result.data.map(rule => rule.example_query);
      const duplicates = exampleQueries.filter((query, index) => exampleQueries.indexOf(query) !== index);
      
      if (duplicates.length > 0) {
        console.log('\n⚠️ 发现重复的示例查询:');
        [...new Set(duplicates)].forEach(query => {
          console.log(`  "${query}"`);
        });
      } else {
        console.log('\n✅ 所有示例查询都是唯一的');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRulesAPI();
