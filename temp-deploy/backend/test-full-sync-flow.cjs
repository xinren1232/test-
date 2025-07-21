// 测试完整的数据同步流程
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

async function testFullSyncFlow() {
  console.log('🧪 测试完整数据同步流程...\n');
  
  try {
    // 1. 模拟数据同步
    console.log('1. 执行数据同步:');
    const syncData = {
      inventory: [
        { 物料名称: '测试物料1', 供应商: '测试供应商1', 数量: '100', 状态: '正常' },
        { 物料名称: '测试物料2', 供应商: '测试供应商2', 数量: '200', 状态: '正常' }
      ],
      inspection: [],
      production: []
    };
    
    const syncResponse = await makeRequest('http://localhost:3001/api/assistant/update-data', syncData);
    console.log(`   状态码: ${syncResponse.status}`);
    if (syncResponse.data && syncResponse.data.success) {
      console.log(`   ✅ 同步成功: ${syncResponse.data.message}`);
    } else {
      console.log(`   ❌ 同步失败: ${syncResponse.data?.message || syncResponse.error}`);
      return;
    }
    
    // 2. 执行数据验证
    console.log('\n2. 执行数据验证:');
    const verifyData = {
      expectedCounts: {
        inventory: 2,
        inspection: 0,
        production: 0
      }
    };
    
    const verifyResponse = await makeRequest('http://localhost:3001/api/assistant/verify-data', verifyData);
    console.log(`   状态码: ${verifyResponse.status}`);
    if (verifyResponse.data && verifyResponse.data.verified) {
      console.log(`   ✅ 验证成功: ${verifyResponse.data.message}`);
      console.log(`   验证状态: verified=${verifyResponse.data.verified}`);
      
      if (verifyResponse.data.details) {
        const details = verifyResponse.data.details;
        console.log(`   库存数据: ${details.inventory.total} 条 (有效: ${details.inventory.valid}, 无效: ${details.inventory.invalid})`);
        console.log(`   检验数据: ${details.inspection.total} 条`);
        console.log(`   生产数据: ${details.production.total} 条`);
      }
    } else {
      console.log(`   ❌ 验证失败: ${verifyResponse.data?.message || verifyResponse.error}`);
      return;
    }
    
    // 3. 测试查询功能
    console.log('\n3. 测试查询功能:');
    const queryData = { query: '库存查询' };
    
    const queryResponse = await makeRequest('http://localhost:3001/api/assistant/query', queryData);
    console.log(`   状态码: ${queryResponse.status}`);
    if (queryResponse.data && queryResponse.data.success) {
      console.log(`   ✅ 查询成功: ${queryResponse.data.message}`);
      console.log(`   查询结果: ${queryResponse.data.data?.length || 0} 条记录`);
    } else {
      console.log(`   ❌ 查询失败: ${queryResponse.data?.message || queryResponse.error}`);
    }
    
    console.log('\n🎉 完整数据同步流程测试完成！');
    console.log('✅ 数据同步 -> ✅ 数据验证 -> ✅ 数据查询');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFullSyncFlow();
