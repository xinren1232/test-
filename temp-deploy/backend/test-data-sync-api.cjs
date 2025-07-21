// 测试数据同步API
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

async function testDataSyncAPI() {
  try {
    console.log('🧪 测试数据同步API...\n');
    
    // 准备测试数据
    const testData = {
      inventory: [
        { 物料名称: 'LCD显示屏', 供应商: '聚龙光电', 数量: '1500', 状态: '正常' },
        { 物料名称: 'OLED面板', 供应商: 'BOE科技', 数量: '800', 状态: '正常' }
      ],
      inspection: [
        { 测试编号: 'T001', 物料名称: 'LCD显示屏', 测试结果: '合格', 结论: '通过' },
        { 测试编号: 'T002', 物料名称: 'OLED面板', 测试结果: '合格', 结论: '通过' }
      ],
      production: [
        { 批次号: 'B001', 物料名称: 'LCD显示屏', 工厂: '深圳工厂', 缺陷率: '0.5%' },
        { 批次号: 'B002', 物料名称: 'OLED面板', 工厂: '上海工厂', 缺陷率: '0.3%' }
      ]
    };
    
    // 1. 测试数据同步API
    console.log('1. 测试数据同步API:');
    try {
      const syncResponse = await makeRequest('http://localhost:3001/api/assistant/update-data', testData);
      console.log(`状态码: ${syncResponse.status}`);
      if (syncResponse.data && syncResponse.data.success) {
        console.log(`✅ 数据同步成功: ${syncResponse.data.message}`);
        console.log(`同步结果: ${syncResponse.data.results?.join(', ')}`);
      } else {
        console.log(`❌ 数据同步失败: ${syncResponse.data?.message || syncResponse.error}`);
      }
    } catch (error) {
      console.log(`❌ 数据同步连接失败: ${error.message}`);
    }
    
    // 2. 测试批量数据同步API
    console.log('\n2. 测试批量数据同步API:');
    try {
      const batchData = {
        type: 'inventory',
        data: [
          { 物料名称: '触控芯片', 供应商: '天马微电子', 数量: '2000', 状态: '正常' }
        ]
      };
      
      const batchResponse = await makeRequest('http://localhost:3001/api/assistant/update-data-batch', batchData);
      console.log(`状态码: ${batchResponse.status}`);
      if (batchResponse.data && batchResponse.data.success) {
        console.log(`✅ 批量同步成功: ${batchResponse.data.message}`);
        console.log(`新增: ${batchResponse.data.added} 条，总计: ${batchResponse.data.total} 条`);
      } else {
        console.log(`❌ 批量同步失败: ${batchResponse.data?.message || batchResponse.error}`);
      }
    } catch (error) {
      console.log(`❌ 批量同步连接失败: ${error.message}`);
    }
    
    // 3. 测试查询API验证数据
    console.log('\n3. 测试查询API验证数据:');
    try {
      const queryResponse = await makeRequest('http://localhost:3001/api/assistant/query', { 
        query: '库存查询' 
      });
      console.log(`状态码: ${queryResponse.status}`);
      if (queryResponse.data && queryResponse.data.success) {
        console.log(`✅ 查询成功: 匹配规则 "${queryResponse.data.matchedRule}"`);
        
        const tableData = queryResponse.data.data?.tableData;
        console.log(`查询到数据: ${tableData ? tableData.length : 0} 条`);
        
        if (tableData && tableData.length > 0) {
          console.log('前3条数据:');
          for (let i = 0; i < Math.min(3, tableData.length); i++) {
            const item = tableData[i];
            console.log(`  ${i+1}. ${Object.values(item).join(' | ')}`);
          }
        }
      } else {
        console.log(`❌ 查询失败: ${queryResponse.data?.message || queryResponse.error}`);
      }
    } catch (error) {
      console.log(`❌ 查询连接失败: ${error.message}`);
    }
    
    console.log('\n🎉 数据同步API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDataSyncAPI();
