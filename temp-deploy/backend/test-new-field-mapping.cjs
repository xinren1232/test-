// 测试新的字段映射
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

async function testNewFieldMapping() {
  console.log('🔍 测试新的字段映射...\n');
  
  try {
    // 测试不同场景的字段映射
    const testCases = [
      {
        name: '库存场景',
        query: '库存基础查询',
        expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '物料类型', '供应商', '批次号', '数量', '状态', '入库时间', '到期时间', '备注']
      },
      {
        name: '检验场景',
        query: '检验数据基础查询',
        expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '物料名称', '物料类型', '供应商', '批次号', '数量', '测试结果', '不合格描述', '结论', '备注']
      },
      {
        name: '生产场景',
        query: '生产数据基础查询',
        expectedFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '物料类型', '供应商', '批次号', '产线', '车间', '不良率', '本周异常', '检验日期', '使用时间', '备注']
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 测试 ${testCase.name}:`);
      console.log(`查询: "${testCase.query}"`);
      
      try {
        const response = await makeRequest('http://localhost:3001/api/assistant/query', { query: testCase.query });
        
        if (response.data && response.data.success && response.data.tableData) {
          const data = response.data.tableData;
          console.log(`✅ 成功获取 ${data.length} 条数据`);
          
          if (data.length > 0) {
            const actualFields = Object.keys(data[0]);
            console.log(`实际字段: ${actualFields.join(', ')}`);
            
            // 检查期望字段是否存在
            const missingFields = testCase.expectedFields.filter(field => !actualFields.includes(field));
            const extraFields = actualFields.filter(field => !testCase.expectedFields.includes(field));
            
            if (missingFields.length === 0 && extraFields.length === 0) {
              console.log('✅ 字段映射完全正确');
            } else {
              if (missingFields.length > 0) {
                console.log(`⚠️ 缺少字段: ${missingFields.join(', ')}`);
              }
              if (extraFields.length > 0) {
                console.log(`⚠️ 多余字段: ${extraFields.join(', ')}`);
              }
            }
            
            // 显示第一条数据示例
            console.log('\n第一条数据示例:');
            Object.entries(data[0]).forEach(([key, value]) => {
              console.log(`  ${key}: ${value}`);
            });
            
            // 检查数据质量
            console.log('\n数据质量检查:');
            const qualityChecks = {
              '有效物料名称': data.filter(item => item.物料名称 && item.物料名称 !== '未知物料').length,
              '有效供应商': data.filter(item => item.供应商 && item.供应商 !== '未知供应商').length,
              '有效编码': data.filter(item => item.物料编码 && item.物料编码 !== 'N/A').length
            };
            
            Object.entries(qualityChecks).forEach(([check, count]) => {
              const percentage = Math.round((count / data.length) * 100);
              console.log(`  ${check}: ${count}/${data.length} (${percentage}%)`);
            });
            
          } else {
            console.log('⚠️ 无数据返回');
          }
        } else {
          console.log(`❌ 查询失败: ${response.data ? response.data.message : '无响应'}`);
        }
        
      } catch (error) {
        console.log(`❌ 连接错误: ${error.message}`);
      }
    }
    
    console.log('\n🎉 字段映射测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testNewFieldMapping();
