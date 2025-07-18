// 直接测试API
const fetch = require('node-fetch');

async function testAPIDirectly() {
  try {
    console.log('🧪 直接测试API...\n');
    
    // 1. 测试健康检查
    console.log('1. 测试健康检查:');
    try {
      const healthResponse = await fetch('http://localhost:3002/api/health');
      const healthData = await healthResponse.json();
      console.log('✅ 健康检查成功:', healthData);
    } catch (error) {
      console.log('❌ 健康检查失败:', error.message);
    }
    
    // 2. 测试查询API
    console.log('\n2. 测试查询API:');
    const testQueries = ['全测试', '库存查询', '聚龙供应商'];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      try {
        const response = await fetch('http://localhost:3002/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ 查询成功: ${data.message}`);
          console.log(`   匹配规则: ${data.matchedRule || '未知'}`);
          console.log(`   数据条数: ${data.tableData ? data.tableData.length : 0}`);
          if (data.tableData && data.tableData.length > 0) {
            console.log(`   第一条数据:`, Object.keys(data.tableData[0]).join(', '));
          }
        } else {
          console.log(`❌ 查询失败: ${data.message}`);
        }
        
      } catch (error) {
        console.log(`❌ 请求失败: ${error.message}`);
      }
    }
    
    // 3. 测试规则列表API
    console.log('\n3. 测试规则列表API:');
    try {
      const rulesResponse = await fetch('http://localhost:3002/api/rules');
      const rulesData = await rulesResponse.json();
      
      if (rulesData.success) {
        console.log(`✅ 规则列表获取成功: ${rulesData.data.length} 条规则`);
        console.log(`   前3条规则:`);
        for (let i = 0; i < Math.min(3, rulesData.data.length); i++) {
          const rule = rulesData.data[i];
          console.log(`     ${i+1}. ${rule.intent_name} (ID: ${rule.id})`);
        }
      } else {
        console.log(`❌ 规则列表获取失败: ${rulesData.message}`);
      }
    } catch (error) {
      console.log(`❌ 规则列表请求失败: ${error.message}`);
    }
    
    console.log('\n🎉 API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPIDirectly();
