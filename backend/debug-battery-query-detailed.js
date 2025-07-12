import fetch from 'node-fetch';

async function debugBatteryQueryDetailed() {
  console.log('🔋 详细调试电池查询问题...\n');
  
  const baseURL = 'http://localhost:3001';
  
  // 测试不同的电池查询方式
  const batteryQueries = [
    '查询电池',
    '电池库存',
    '查询电池库存',
    '电池库存情况',
    '查询电池库存情况',
    '电池',
    '电池 库存',
    '查询 电池',
    '电池 查询'
  ];

  for (const query of batteryQueries) {
    console.log(`📋 测试查询: "${query}"`);
    
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
        
        console.log(`  状态: ${response.status}`);
        console.log(`  成功: ${result.success}`);
        console.log(`  数据源: ${result.source}`);
        console.log(`  处理模式: ${result.processingMode}`);
        console.log(`  AI增强: ${result.aiEnhanced}`);
        
        if (result.queryInfo) {
          console.log(`  查询信息:`);
          console.log(`    - 意图: ${result.queryInfo.intent || '未识别'}`);
          console.log(`    - 参数: ${JSON.stringify(result.queryInfo.parameters || {})}`);
          console.log(`    - 匹配规则: ${result.queryInfo.matchedRule || '无'}`);
        }
        
        if (result.data && result.data.length > 0) {
          console.log(`  📊 返回数据: ${result.data.length} 条记录`);
          
          // 检查物料类型
          const materials = [...new Set(result.data.map(item => 
            item.物料名称 || item.material_name || '未知'
          ))];
          
          console.log(`  物料类型: ${materials.join(', ')}`);
          
          const hasBattery = materials.includes('电池');
          const hasBatteryCover = materials.includes('电池盖');
          
          if (hasBattery && !hasBatteryCover) {
            console.log(`  ✅ 精确匹配成功：只包含电池`);
          } else if (hasBattery && hasBatteryCover) {
            console.log(`  ⚠️ 仍有混淆：同时包含电池和电池盖`);
          } else if (!hasBattery && hasBatteryCover) {
            console.log(`  ❌ 错误匹配：只有电池盖，没有电池`);
          } else if (!hasBattery && !hasBatteryCover) {
            console.log(`  ❌ 完全错误：既没有电池也没有电池盖`);
          }
          
          // 显示前3条数据
          console.log(`  📋 数据示例:`);
          result.data.slice(0, 3).forEach((item, index) => {
            const material = item.物料名称 || item.material_name || '未知';
            const supplier = item.供应商 || item.supplier_name || item.supplier || '未知';
            const quantity = item.数量 || item.quantity || '未知';
            console.log(`    ${index + 1}. ${material} | ${supplier} | ${quantity}`);
          });
        } else {
          console.log(`  ⚠️ 没有返回数据`);
        }
        
        if (result.reply) {
          console.log(`  📝 回复: ${result.reply.substring(0, 100)}...`);
        }

      } else {
        const errorText = await response.text();
        console.log(`  ❌ 请求失败 (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.log(`  ❌ 请求异常: ${error.message}`);
    }
    
    console.log('');
  }

  // 测试直接的数据库查询
  console.log('🗄️ 测试直接数据库查询:');
  
  try {
    const directQuery = `
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态
      FROM inventory 
      WHERE material_name = '电池'
      LIMIT 5
    `;

    const response = await fetch(`${baseURL}/api/assistant/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: directQuery,
        question: directQuery
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`  直接SQL查询结果: ${result.data ? result.data.length : 0} 条记录`);
      
      if (result.data && result.data.length > 0) {
        result.data.forEach((item, index) => {
          console.log(`    ${index + 1}. ${item.物料名称} | ${item.供应商} | ${item.数量} | ${item.状态} | ${item.工厂}`);
        });
      }
    }
  } catch (error) {
    console.log(`  ❌ 直接查询失败: ${error.message}`);
  }

  // 测试意图识别服务
  console.log('\n🧠 测试意图识别服务:');
  
  try {
    const intentResponse = await fetch(`${baseURL}/api/assistant/debug-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '查询电池库存'
      })
    });

    if (intentResponse.ok) {
      const intentResult = await intentResponse.json();
      console.log(`  意图识别结果:`);
      console.log(`    - 识别的意图: ${intentResult.intent || '未识别'}`);
      console.log(`    - 提取的参数: ${JSON.stringify(intentResult.parameters || {})}`);
      console.log(`    - 匹配的规则: ${intentResult.matchedRule || '无'}`);
      console.log(`    - 生成的SQL: ${intentResult.sql ? intentResult.sql.substring(0, 100) + '...' : '无'}`);
    } else {
      console.log(`  ❌ 意图识别服务不可用`);
    }
  } catch (error) {
    console.log(`  ❌ 意图识别测试失败: ${error.message}`);
  }

  console.log('\n✅ 电池查询详细调试完成！');
}

// 执行调试
debugBatteryQueryDetailed();
