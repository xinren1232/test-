import fetch from 'node-fetch';

async function testBatteryQueryFix() {
  console.log('🔋 测试电池查询修复效果...\n');
  
  const baseURL = 'http://localhost:3001';
  
  const testQueries = [
    {
      name: '电池精确查询',
      query: '查询电池',
      description: '应该只返回电池，不包含电池盖'
    },
    {
      name: '电池库存查询',
      query: '查询电池库存',
      description: '应该返回电池库存信息'
    },
    {
      name: '电池盖查询',
      query: '查询电池盖',
      description: '应该只返回电池盖'
    },
    {
      name: '充电器查询',
      query: '查询充电器',
      description: '应该返回充电器信息'
    }
  ];

  for (const test of testQueries) {
    console.log(`📋 ${test.name}`);
    console.log(`查询: "${test.query}"`);
    console.log(`预期: ${test.description}`);
    
    try {
      const response = await fetch(`${baseURL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: test.query,
          query: test.query
        })
      });

      if (!response.ok) {
        console.log(`  ❌ HTTP错误: ${response.status} ${response.statusText}`);
        continue;
      }

      const result = await response.json();
      console.log(`  ✅ 响应状态: ${response.status}`);
      
      if (result.data && Array.isArray(result.data)) {
        console.log(`  📊 返回数据: ${result.data.length} 条记录`);
        
        if (result.data.length > 0) {
          console.log(`  📋 返回的物料:`);
          
          // 统计返回的物料类型
          const materialCounts = {};
          result.data.forEach(item => {
            const materialName = item.物料名称 || item.material_name || '未知';
            materialCounts[materialName] = (materialCounts[materialName] || 0) + 1;
          });
          
          Object.entries(materialCounts).forEach(([material, count]) => {
            console.log(`    - ${material}: ${count}条`);
          });
          
          // 验证查询结果
          if (test.query.includes('电池') && !test.query.includes('电池盖')) {
            const hasBattery = result.data.some(item => 
              (item.物料名称 === '电池' || item.material_name === '电池')
            );
            const hasBatteryCover = result.data.some(item => 
              (item.物料名称 === '电池盖' || item.material_name === '电池盖')
            );
            
            if (hasBattery && !hasBatteryCover) {
              console.log(`  ✅ 查询结果正确：只包含电池，不包含电池盖`);
            } else if (hasBattery && hasBatteryCover) {
              console.log(`  ⚠️ 查询结果有问题：同时包含电池和电池盖`);
            } else if (!hasBattery) {
              console.log(`  ❌ 查询结果错误：没有找到电池`);
            }
          }
          
          // 显示前3条详细数据
          console.log(`  📋 前3条详细数据:`);
          result.data.slice(0, 3).forEach((item, index) => {
            const materialName = item.物料名称 || item.material_name || '未知';
            const supplier = item.供应商 || item.supplier_name || '未知';
            const quantity = item.数量 || item.quantity || '未知';
            console.log(`    ${index + 1}. ${materialName} | ${supplier} | ${quantity}`);
          });
        }
      } else if (result.reply) {
        console.log(`  📝 回复内容: ${result.reply.substring(0, 200)}...`);
      } else {
        console.log(`  ⚠️ 响应格式异常: ${JSON.stringify(result).substring(0, 100)}...`);
      }

    } catch (error) {
      console.log(`  ❌ 请求失败: ${error.message}`);
    }
    
    console.log('');
  }

  // 额外测试：直接测试数据库查询
  console.log('🔍 直接测试数据库查询结果:');
  try {
    const directResponse = await fetch(`${baseURL}/api/assistant/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: '电池',
        query: '电池'
      })
    });

    if (directResponse.ok) {
      const directResult = await directResponse.json();
      console.log(`  📊 直接查询"电池"返回: ${directResult.data ? directResult.data.length : 0} 条记录`);
      
      if (directResult.data && directResult.data.length > 0) {
        const uniqueMaterials = [...new Set(directResult.data.map(item => 
          item.物料名称 || item.material_name
        ))];
        console.log(`  📋 包含的物料类型: ${uniqueMaterials.join(', ')}`);
      }
    }
  } catch (error) {
    console.log(`  ❌ 直接查询失败: ${error.message}`);
  }
}

// 执行测试
testBatteryQueryFix();
