// 测试物料编码映射API
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

async function testMaterialCodeAPI() {
  try {
    console.log('🧪 测试物料编码映射API...\n');
    
    // 1. 测试获取物料编码映射
    console.log('1. 测试获取物料编码映射:');
    try {
      const getResponse = await makeRequest('http://localhost:3001/api/material-code-mappings');
      console.log(`状态码: ${getResponse.status}`);
      if (getResponse.data && Array.isArray(getResponse.data)) {
        console.log(`✅ 获取成功: ${getResponse.data.length} 条映射记录`);
        
        if (getResponse.data.length > 0) {
          console.log('前3条映射记录:');
          for (let i = 0; i < Math.min(3, getResponse.data.length); i++) {
            const mapping = getResponse.data[i];
            console.log(`  ${i+1}. ${mapping.material_code}: ${mapping.material_name} (${mapping.supplier_name})`);
          }
        }
      } else {
        console.log(`❌ 获取失败: ${getResponse.data?.message || getResponse.error}`);
      }
    } catch (error) {
      console.log(`❌ 获取连接失败: ${error.message}`);
    }
    
    // 2. 测试保存物料编码映射
    console.log('\n2. 测试保存物料编码映射:');
    try {
      const newMapping = {
        material_code: 'TEST-X9999',
        material_name: '测试物料',
        supplier_name: '测试供应商',
        code_prefix: 'TEST',
        category: '测试类'
      };
      
      const postResponse = await makeRequest('http://localhost:3001/api/material-code-mappings', newMapping);
      console.log(`状态码: ${postResponse.status}`);
      if (postResponse.data && postResponse.data.success) {
        console.log(`✅ 保存成功: ${postResponse.data.message}`);
        console.log(`保存的映射: ${postResponse.data.data?.material_code}`);
      } else {
        console.log(`❌ 保存失败: ${postResponse.data?.message || postResponse.error}`);
      }
    } catch (error) {
      console.log(`❌ 保存连接失败: ${error.message}`);
    }
    
    console.log('\n🎉 物料编码映射API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testMaterialCodeAPI();
