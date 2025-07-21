// 测试更新后的字段映射
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

async function testUpdatedFields() {
  console.log('🔍 测试更新后的字段映射...\n');
  
  try {
    // 测试库存场景
    console.log('📊 测试库存场景:');
    const inventoryResponse = await makeRequest('http://localhost:3001/api/assistant/query', { 
      query: '库存基础查询' 
    });
    
    if (inventoryResponse.data && inventoryResponse.data.success && inventoryResponse.data.tableData) {
      const data = inventoryResponse.data.tableData;
      console.log(`✅ 成功获取 ${data.length} 条库存数据`);
      
      if (data.length > 0) {
        const fields = Object.keys(data[0]);
        console.log(`字段列表: ${fields.join(', ')}`);
        
        // 检查期望的新字段
        const expectedFields = ['工厂', '仓库', '物料编码', '物料名称', '物料类型', '供应商', '批次号', '数量', '状态', '入库时间', '到期时间', '备注'];
        const hasNewFields = expectedFields.some(field => fields.includes(field));
        
        if (hasNewFields) {
          console.log('✅ 新字段映射已生效！');
          
          // 显示第一条数据
          console.log('\n第一条库存数据:');
          Object.entries(data[0]).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
          });
        } else {
          console.log('❌ 字段映射未更新，仍为旧字段');
        }
      }
    } else {
      console.log('❌ 库存查询失败');
    }
    
    // 测试检验场景
    console.log('\n📊 测试检验场景:');
    const inspectionResponse = await makeRequest('http://localhost:3001/api/assistant/query', { 
      query: '检验数据基础查询' 
    });
    
    if (inspectionResponse.data && inspectionResponse.data.success && inspectionResponse.data.tableData) {
      const data = inspectionResponse.data.tableData;
      console.log(`✅ 成功获取 ${data.length} 条检验数据`);
      
      if (data.length > 0) {
        const fields = Object.keys(data[0]);
        console.log(`字段列表: ${fields.join(', ')}`);
        
        // 检查期望的新字段
        const expectedFields = ['测试编号', '日期', '项目', '基线', '物料编码', '物料名称', '物料类型', '供应商', '批次号', '数量', '测试结果', '不合格描述', '结论', '备注'];
        const hasNewFields = expectedFields.some(field => fields.includes(field));
        
        if (hasNewFields) {
          console.log('✅ 新字段映射已生效！');
        } else {
          console.log('❌ 字段映射未更新，仍为旧字段');
        }
      }
    } else {
      console.log('❌ 检验查询失败');
    }
    
    // 测试生产场景
    console.log('\n📊 测试生产场景:');
    const productionResponse = await makeRequest('http://localhost:3001/api/assistant/query', { 
      query: '生产数据基础查询' 
    });
    
    if (productionResponse.data && productionResponse.data.success && productionResponse.data.tableData) {
      const data = productionResponse.data.tableData;
      console.log(`✅ 成功获取 ${data.length} 条生产数据`);
      
      if (data.length > 0) {
        const fields = Object.keys(data[0]);
        console.log(`字段列表: ${fields.join(', ')}`);
        
        // 检查期望的新字段
        const expectedFields = ['工厂', '基线', '项目', '物料编码', '物料名称', '物料类型', '供应商', '批次号', '产线', '车间', '不良率', '本周异常', '检验日期', '使用时间', '备注'];
        const hasNewFields = expectedFields.some(field => fields.includes(field));
        
        if (hasNewFields) {
          console.log('✅ 新字段映射已生效！');
        } else {
          console.log('❌ 字段映射未更新，仍为旧字段');
        }
      }
    } else {
      console.log('❌ 生产查询失败');
    }
    
    console.log('\n🎉 字段映射测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testUpdatedFields();
