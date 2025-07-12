import fetch from 'node-fetch';

async function testFixedFrontendFormat() {
  console.log('🔧 测试修复后的前端请求格式...\n');
  
  const baseURL = 'http://localhost:3001';
  
  // 测试修复后的前端请求格式
  const testQueries = [
    {
      name: '修复后的前端格式1',
      payload: {
        query: '查询电池库存',
        question: '查询电池库存',
        intent: 'general_query'
      }
    },
    {
      name: '修复后的前端格式2', 
      payload: {
        query: '重庆工厂有什么物料',
        question: '重庆工厂有什么物料',
        intent: 'factory_query'
      }
    },
    {
      name: '修复后的前端格式3',
      payload: {
        query: '查询BOE供应商的物料',
        question: '查询BOE供应商的物料',
        intent: 'supplier_query'
      }
    }
  ];

  for (const test of testQueries) {
    console.log(`📋 ${test.name}`);
    console.log(`查询: "${test.payload.query}"`);
    
    try {
      const response = await fetch(`${baseURL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      });

      console.log(`  状态码: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`  ❌ 错误响应: ${errorText}`);
        continue;
      }

      const result = await response.json();
      console.log(`  ✅ 响应成功`);
      console.log(`  响应结构:`);
      console.log(`    - success: ${result.success}`);
      console.log(`    - data: ${result.data ? `${result.data.length} 条记录` : '无'}`);
      console.log(`    - reply: ${result.reply ? '有' : '无'}`);
      console.log(`    - source: ${result.source || '未知'}`);
      
      if (result.data && result.data.length > 0) {
        console.log(`  📊 数据示例 (前3条):`);
        result.data.slice(0, 3).forEach((item, index) => {
          const keys = Object.keys(item);
          const summary = keys.slice(0, 3).map(key => `${key}: ${item[key]}`).join(', ');
          console.log(`    ${index + 1}. ${summary}`);
        });
        
        // 检查数据结构
        const firstItem = result.data[0];
        const columns = Object.keys(firstItem);
        console.log(`  📋 数据字段: ${columns.join(', ')}`);
        
        // 验证前端能否正确处理这个数据格式
        console.log(`  🔍 前端兼容性检查:`);
        console.log(`    - 是否有中文字段名: ${columns.some(col => /[\u4e00-\u9fa5]/.test(col)) ? '是' : '否'}`);
        console.log(`    - 字段数量: ${columns.length}`);
        console.log(`    - 数据类型: ${typeof firstItem[columns[0]]}`);
      }
      
      if (result.reply) {
        console.log(`  📝 回复内容: ${result.reply.substring(0, 100)}...`);
      }

    } catch (error) {
      console.log(`  ❌ 请求失败: ${error.message}`);
    }
    
    console.log('');
  }

  // 测试特定的电池查询
  console.log('🔋 专项测试：电池查询修复效果');
  
  const batteryTests = [
    '查询电池',
    '电池库存',
    '查询电池库存情况'
  ];

  for (const query of batteryTests) {
    console.log(`\n📋 测试查询: "${query}"`);
    
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
        
        if (result.data && result.data.length > 0) {
          // 检查是否只返回电池，不包含电池盖
          const materials = [...new Set(result.data.map(item => 
            item.物料名称 || item.material_name || '未知'
          ))];
          
          console.log(`  📊 返回物料类型: ${materials.join(', ')}`);
          
          const hasBattery = materials.includes('电池');
          const hasBatteryCover = materials.includes('电池盖');
          
          if (hasBattery && !hasBatteryCover) {
            console.log(`  ✅ 精确匹配成功：只包含电池`);
          } else if (hasBattery && hasBatteryCover) {
            console.log(`  ⚠️ 仍有混淆：同时包含电池和电池盖`);
          } else if (!hasBattery) {
            console.log(`  ❌ 匹配失败：没有找到电池`);
          }
        } else {
          console.log(`  ⚠️ 没有返回数据`);
        }
      }
    } catch (error) {
      console.log(`  ❌ 查询失败: ${error.message}`);
    }
  }

  console.log('\n✅ 前端请求格式修复测试完成！');
}

// 执行测试
testFixedFrontendFormat();
