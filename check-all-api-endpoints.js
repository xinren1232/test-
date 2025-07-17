/**
 * 检查所有API端点是否正常工作
 * 用于排查404错误
 */

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_PROXY_URL = 'http://localhost:5173';

// 需要检查的API端点列表
const API_ENDPOINTS = [
  // 基础健康检查
  { method: 'GET', path: '/health', description: '健康检查' },
  
  // 助手相关API
  { method: 'POST', path: '/api/assistant/query', description: '智能问答', body: { query: '测试查询' } },
  { method: 'POST', path: '/api/assistant/update-data', description: '数据同步', body: { inventory: [], inspection: [], production: [] } },
  { method: 'POST', path: '/api/assistant/update-data-batch', description: '批量数据同步', body: { type: 'inventory', data: [] } },
  { method: 'POST', path: '/api/assistant/verify-data', description: '数据验证', body: {} },
  { method: 'POST', path: '/api/assistant/generate-real-data', description: '数据生成', body: {} },
  
  // 规则相关API
  { method: 'GET', path: '/api/rules', description: '规则库查询' },
  
  // 物料编码映射API
  { method: 'GET', path: '/api/material-code-mappings', description: '物料编码映射查询' },
  { method: 'POST', path: '/api/material-code-mappings', description: '物料编码映射保存', body: { material_code: 'TEST001', material_name: '测试物料', supplier_name: '测试供应商' } },
  
  // 数据库测试API
  { method: 'GET', path: '/api/db-test', description: '数据库测试' },
];

/**
 * 测试单个API端点
 */
async function testEndpoint(baseUrl, endpoint) {
  try {
    const url = `${baseUrl}${endpoint.path}`;
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (endpoint.body && endpoint.method !== 'GET') {
      options.body = JSON.stringify(endpoint.body);
    }

    console.log(`🧪 测试: ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
    
    const response = await fetch(url, options);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = await response.text();
      }
      
      console.log(`   ✅ 成功 (${response.status})`);
      return { success: true, status: response.status, data: result };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ 失败 (${response.status}): ${errorText.substring(0, 100)}`);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.log(`   ❌ 异常: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 测试所有API端点
 */
async function testAllEndpoints() {
  console.log('🚀 开始检查所有API端点...\n');
  
  // 1. 测试直接后端API
  console.log('📡 测试直接后端API (http://localhost:3001)');
  console.log('='.repeat(60));
  
  const backendResults = [];
  for (const endpoint of API_ENDPOINTS) {
    const result = await testEndpoint(API_BASE_URL, endpoint);
    backendResults.push({ endpoint, result });
    await new Promise(resolve => setTimeout(resolve, 100)); // 短暂延迟
  }
  
  console.log('\n');
  
  // 2. 测试前端代理API
  console.log('🔄 测试前端代理API (http://localhost:5173)');
  console.log('='.repeat(60));
  
  const proxyResults = [];
  for (const endpoint of API_ENDPOINTS.filter(ep => ep.path.startsWith('/api'))) {
    const result = await testEndpoint(FRONTEND_PROXY_URL, endpoint);
    proxyResults.push({ endpoint, result });
    await new Promise(resolve => setTimeout(resolve, 100)); // 短暂延迟
  }
  
  console.log('\n');
  
  // 3. 生成测试报告
  console.log('📊 测试报告');
  console.log('='.repeat(60));
  
  const backendSuccess = backendResults.filter(r => r.result.success).length;
  const backendTotal = backendResults.length;
  const proxySuccess = proxyResults.filter(r => r.result.success).length;
  const proxyTotal = proxyResults.length;
  
  console.log(`🎯 直接后端API: ${backendSuccess}/${backendTotal} 成功`);
  console.log(`🔄 前端代理API: ${proxySuccess}/${proxyTotal} 成功`);
  
  // 4. 列出失败的端点
  const backendFailures = backendResults.filter(r => !r.result.success);
  const proxyFailures = proxyResults.filter(r => !r.result.success);
  
  if (backendFailures.length > 0) {
    console.log('\n❌ 直接后端API失败列表:');
    backendFailures.forEach(f => {
      console.log(`   ${f.endpoint.method} ${f.endpoint.path} - ${f.result.status || 'ERROR'}`);
    });
  }
  
  if (proxyFailures.length > 0) {
    console.log('\n❌ 前端代理API失败列表:');
    proxyFailures.forEach(f => {
      console.log(`   ${f.endpoint.method} ${f.endpoint.path} - ${f.result.status || 'ERROR'}`);
    });
  }
  
  if (backendFailures.length === 0 && proxyFailures.length === 0) {
    console.log('\n🎉 所有API端点测试通过！');
  }
  
  return {
    backend: { success: backendSuccess, total: backendTotal, failures: backendFailures },
    proxy: { success: proxySuccess, total: proxyTotal, failures: proxyFailures }
  };
}

// 运行测试
testAllEndpoints().catch(console.error);
