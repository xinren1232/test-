/**
 * 测试所有API端点
 */

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_PROXY_URL = 'http://localhost:5173';

// 测试端点列表
const endpoints = [
  { method: 'GET', path: '/health', description: '健康检查' },
  { method: 'GET', path: '/api/db-test', description: '数据库测试' },
  { method: 'GET', path: '/api/rules', description: '规则库查询' },
  { method: 'GET', path: '/api/material-code-mappings', description: '物料编码映射查询' },
  { 
    method: 'POST', 
    path: '/api/assistant/query', 
    description: '智能问答',
    body: { query: '查询库存状态' }
  },
  { 
    method: 'POST', 
    path: '/api/assistant/update-data', 
    description: '数据同步',
    body: { inventory: [], inspection: [], production: [], batches: [] }
  },
  { 
    method: 'POST', 
    path: '/api/assistant/verify-data', 
    description: '数据验证',
    body: {}
  }
];

async function testEndpoint(baseUrl, endpoint) {
  try {
    const url = `${baseUrl}${endpoint.path}`;
    const options = {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (endpoint.body && endpoint.method !== 'GET') {
      options.body = JSON.stringify(endpoint.body);
    }

    console.log(`🧪 测试: ${endpoint.method} ${endpoint.path}`);
    
    const response = await fetch(url, options);
    
    if (response.ok) {
      console.log(`   ✅ 成功 (${response.status})`);
      return true;
    } else {
      console.log(`   ❌ 失败 (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 异常: ${error.message}`);
    return false;
  }
}

async function testAllEndpoints() {
  console.log('🚀 开始测试所有API端点...\n');
  
  // 测试直接后端API
  console.log('📡 测试直接后端API');
  console.log('='.repeat(40));
  
  let backendSuccess = 0;
  for (const endpoint of endpoints) {
    const success = await testEndpoint(API_BASE_URL, endpoint);
    if (success) backendSuccess++;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 直接后端API: ${backendSuccess}/${endpoints.length} 成功\n`);
  
  // 测试前端代理API
  console.log('🔄 测试前端代理API');
  console.log('='.repeat(40));
  
  let proxySuccess = 0;
  const apiEndpoints = endpoints.filter(ep => ep.path.startsWith('/api'));
  
  for (const endpoint of apiEndpoints) {
    const success = await testEndpoint(FRONTEND_PROXY_URL, endpoint);
    if (success) proxySuccess++;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 前端代理API: ${proxySuccess}/${apiEndpoints.length} 成功`);
  
  if (backendSuccess === endpoints.length && proxySuccess === apiEndpoints.length) {
    console.log('\n🎉 所有API端点测试通过！');
  } else {
    console.log('\n⚠️  部分API端点测试失败，请检查日志');
  }
}

// 运行测试
testAllEndpoints().catch(console.error);
