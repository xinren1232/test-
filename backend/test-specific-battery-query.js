import fetch from 'node-fetch';

async function testSpecificBatteryQuery() {
  console.log('🔋 测试具体的电池查询问题...\n');
  
  const baseURL = 'http://localhost:3001';
  
  // 测试不同的查询方式
  const queries = [
    {
      name: '供应商查询测试',
      query: '查询BOE供应商的物料',
      expected: '应该返回BOE供应商的物料'
    },
    {
      name: '电池精确查询测试',
      query: '查询电池库存',
      expected: '应该只返回电池，不包含电池盖'
    },
    {
      name: '电池盖查询测试',
      query: '查询电池盖库存',
      expected: '应该只返回电池盖'
    }
  ];

  for (const test of queries) {
    console.log(`📋 ${test.name}: "${test.query}"`);
    console.log(`   期望: ${test.expected}`);
    
    try {
      const response = await fetch(`${baseURL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: test.query,
          question: test.query
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        console.log(`   状态: ${response.status} ✅`);
        console.log(`   成功: ${result.success}`);
        console.log(`   数据源: ${result.source}`);
        console.log(`   意图: ${result.queryInfo?.intent || '未识别'}`);
        console.log(`   匹配规则: ${result.queryInfo?.matchedRule || '无'}`);
        console.log(`   数据条数: ${result.data ? result.data.length : 0}`);
        
        if (result.data && result.data.length > 0) {
          // 分析返回的物料类型
          const materials = [...new Set(result.data.map(item => 
            item.物料名称 || item.material_name || '未知'
          ))];
          
          console.log(`   返回物料类型: ${materials.join(', ')}`);
          
          // 分析供应商
          const suppliers = [...new Set(result.data.map(item => 
            item.供应商 || item.supplier_name || item.supplier || '未知'
          ))];
          
          console.log(`   涉及供应商: ${suppliers.join(', ')}`);
          
          // 检查结果是否符合预期
          if (test.query.includes('BOE')) {
            const hasBOE = suppliers.includes('BOE');
            console.log(`   BOE供应商查询结果: ${hasBOE ? '✅ 正确' : '❌ 错误'}`);
          }
          
          if (test.query.includes('电池库存') && !test.query.includes('电池盖')) {
            const hasBattery = materials.includes('电池');
            const hasBatteryCover = materials.includes('电池盖');
            
            if (hasBattery && !hasBatteryCover) {
              console.log(`   电池精确查询结果: ✅ 正确 - 只包含电池`);
            } else if (hasBattery && hasBatteryCover) {
              console.log(`   电池精确查询结果: ⚠️ 部分正确 - 包含电池但也有电池盖`);
            } else if (!hasBattery) {
              console.log(`   电池精确查询结果: ❌ 错误 - 没有电池数据`);
            }
          }
          
          if (test.query.includes('电池盖')) {
            const hasBatteryCover = materials.includes('电池盖');
            const hasBattery = materials.includes('电池');
            
            if (hasBatteryCover && !hasBattery) {
              console.log(`   电池盖查询结果: ✅ 正确 - 只包含电池盖`);
            } else if (hasBatteryCover && hasBattery) {
              console.log(`   电池盖查询结果: ⚠️ 部分正确 - 包含电池盖但也有电池`);
            } else if (!hasBatteryCover) {
              console.log(`   电池盖查询结果: ❌ 错误 - 没有电池盖数据`);
            }
          }
          
          // 显示前3条数据示例
          console.log(`   数据示例:`);
          result.data.slice(0, 3).forEach((item, index) => {
            const material = item.物料名称 || item.material_name || '未知';
            const supplier = item.供应商 || item.supplier_name || item.supplier || '未知';
            const quantity = item.数量 || item.quantity || '未知';
            const factory = item.工厂 || item.factory || item.storage_location || '未知';
            console.log(`     ${index + 1}. ${material} | ${supplier} | ${quantity} | ${factory}`);
          });
        } else {
          console.log(`   ⚠️ 没有返回数据`);
        }
        
        if (result.reply) {
          console.log(`   回复: ${result.reply.substring(0, 100)}...`);
        }

      } else {
        const errorText = await response.text();
        console.log(`   ❌ 请求失败 (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求异常: ${error.message}`);
    }
    
    console.log('');
  }

  // 测试其他规则
  console.log('🔍 测试其他规则:');
  
  const otherTests = [
    '深圳工厂库存情况',
    '查询风险库存',
    '测试不合格的记录',
    '工厂数据汇总'
  ];

  for (const query of otherTests) {
    console.log(`\n📋 测试: "${query}"`);
    
    try {
      const response = await fetch(`${baseURL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          question: query
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        console.log(`   状态: ${response.status} ✅`);
        console.log(`   成功: ${result.success}`);
        console.log(`   数据源: ${result.source}`);
        console.log(`   意图: ${result.queryInfo?.intent || '未识别'}`);
        console.log(`   数据条数: ${result.data ? result.data.length : 0}`);
        
        if (result.data && result.data.length > 0) {
          console.log(`   ✅ 有数据返回`);
        } else if (result.reply) {
          console.log(`   📝 文本回复: ${result.reply.substring(0, 80)}...`);
        } else {
          console.log(`   ⚠️ 没有数据或回复`);
        }
      }
    } catch (error) {
      console.log(`   ❌ 测试失败: ${error.message}`);
    }
  }

  console.log('\n✅ 具体查询测试完成！');
}

// 执行测试
testSpecificBatteryQuery();
