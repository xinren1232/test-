// 简单的API连接测试
import fetch from 'node-fetch';

async function testAPIConnection() {
  console.log('🔍 测试API连接...\n');
  
  try {
    // 测试健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await fetch('http://localhost:3002/api/health');
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ 健康检查成功:', healthData);
    } else {
      console.log('❌ 健康检查失败:', healthResponse.status);
    }
    
    // 测试规则API
    console.log('\n2. 测试规则API...');
    const rulesResponse = await fetch('http://localhost:3001/api/rules');
    
    if (rulesResponse.ok) {
      const rulesData = await rulesResponse.json();
      console.log('✅ 规则API成功:', rulesData.success ? `获取到 ${rulesData.data?.length || 0} 条规则` : '失败');
    } else {
      console.log('❌ 规则API失败:', rulesResponse.status);
    }
    
    // 测试查询API
    console.log('\n3. 测试查询API...');
    const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '测试查询' })
    });
    
    if (queryResponse.ok) {
      const queryData = await queryResponse.json();
      console.log('✅ 查询API成功:', queryData.success ? `返回 ${queryData.data?.tableData?.length || 0} 条数据` : '失败');
      console.log('   数据源:', queryData.source);
      console.log('   匹配规则:', queryData.matchedRule);
    } else {
      console.log('❌ 查询API失败:', queryResponse.status);
      const errorText = await queryResponse.text();
      console.log('   错误信息:', errorText);
    }
    
  } catch (error) {
    console.log('❌ 连接失败:', error.message);
    console.log('提示: 请确保后端服务正在运行 (node simple-backend.js)');
  }
}

testAPIConnection().catch(console.error);
