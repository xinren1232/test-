// 综合测试所有API端点
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

async function testAllAPIs() {
  console.log('🧪 综合测试所有API端点...\n');
  
  const baseUrl = 'http://localhost:3001';
  let passedTests = 0;
  let totalTests = 0;
  
  // 测试用例列表
  const testCases = [
    {
      name: '健康检查',
      method: 'GET',
      path: '/api/health',
      expectedStatus: 200
    },
    {
      name: '规则列表',
      method: 'GET',
      path: '/api/rules',
      expectedStatus: 200
    },
    {
      name: '物料编码映射查询',
      method: 'GET',
      path: '/api/material-code-mappings',
      expectedStatus: 200
    },
    {
      name: '物料编码映射保存',
      method: 'POST',
      path: '/api/material-code-mappings',
      data: {
        material_code: 'TEST-A1001',
        material_name: '测试物料A',
        supplier_name: '测试供应商A',
        code_prefix: 'TEST',
        category: '测试类'
      },
      expectedStatus: 200
    },
    {
      name: '智能查询',
      method: 'POST',
      path: '/api/assistant/query',
      data: { query: '库存查询' },
      expectedStatus: 200
    },
    {
      name: '数据同步',
      method: 'POST',
      path: '/api/assistant/update-data',
      data: {
        inventory: [
          { 物料名称: '测试物料', 供应商: '测试供应商', 数量: '100', 状态: '正常' }
        ],
        inspection: [],
        production: []
      },
      expectedStatus: 200
    },
    {
      name: '批量数据同步',
      method: 'POST',
      path: '/api/assistant/update-data-batch',
      data: {
        type: 'inventory',
        data: [
          { 物料名称: '批量测试物料', 供应商: '批量测试供应商', 数量: '50', 状态: '正常' }
        ]
      },
      expectedStatus: 200
    },
    {
      name: '数据验证',
      method: 'POST',
      path: '/api/assistant/verify-data',
      data: {},
      expectedStatus: 200
    }
  ];
  
  // 执行测试
  for (const testCase of testCases) {
    totalTests++;
    console.log(`${totalTests}. 测试 ${testCase.name}:`);
    
    try {
      const url = `${baseUrl}${testCase.path}`;
      const response = await makeRequest(url, testCase.data);
      
      console.log(`   状态码: ${response.status}`);
      
      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ 测试通过`);
        passedTests++;
        
        // 显示响应摘要
        if (response.data) {
          if (response.data.success !== undefined) {
            console.log(`   响应: ${response.data.success ? '成功' : '失败'} - ${response.data.message || ''}`);
          } else if (Array.isArray(response.data)) {
            console.log(`   响应: 返回 ${response.data.length} 条记录`);
          } else if (response.data.status) {
            console.log(`   响应: ${response.data.status} - ${response.data.message || ''}`);
          }
        }
      } else {
        console.log(`   ❌ 测试失败: 期望状态码 ${testCase.expectedStatus}, 实际 ${response.status}`);
        if (response.data?.message) {
          console.log(`   错误信息: ${response.data.message}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ 测试失败: 连接错误 - ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
  
  // 测试结果汇总
  console.log('📊 测试结果汇总:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过测试: ${passedTests}`);
  console.log(`   失败测试: ${totalTests - passedTests}`);
  console.log(`   通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有API测试通过！后端服务运行正常。');
  } else {
    console.log('\n⚠️ 部分API测试失败，请检查后端服务配置。');
  }
}

testAllAPIs();
