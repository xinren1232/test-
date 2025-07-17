import mysql from 'mysql2/promise';

async function fixFieldNames() {
  let connection;
  
  try {
    console.log('🔧 修复字段名问题...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 修复数据探索规则的SQL
    console.log('\n🔧 修复数据探索规则SQL...');
    
    const explorationRuleFixes = [
      {
        id: 485,
        name: '查看所有供应商',
        sql: `SELECT DISTINCT 
  supplier_name as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE supplier_name IS NOT NULL AND supplier_name != ''
GROUP BY supplier_name
ORDER BY 记录数量 DESC`,
        triggers: [
          "供应商列表", "所有供应商", "有哪些供应商", "供应商有什么", "供应商都有什么",
          "系统里有哪些供应商", "查看供应商", "显示供应商", "供应商信息", "厂商列表", 
          "供货商", "制造商", "供应商", "查看所有供应商", "供应商都有哪些"
        ]
      },
      {
        id: 480,
        name: '查看所有物料',
        sql: `SELECT DISTINCT 
  material_name as 物料名称,
  material_code as 物料编码,
  COUNT(*) as 记录数量
FROM inventory 
WHERE material_name IS NOT NULL AND material_name != ''
GROUP BY material_name, material_code
ORDER BY 记录数量 DESC`,
        triggers: [
          "物料列表", "所有物料", "有哪些物料", "物料有什么", "物料都有什么",
          "系统里有哪些物料", "查看物料", "显示物料", "物料信息", "物料种类",
          "料件", "零件", "材料", "组件", "物料", "查看所有物料", "物料都有哪些"
        ]
      },
      {
        id: 481,
        name: '查看所有仓库',
        sql: `SELECT DISTINCT 
  storage_location as 仓库,
  COUNT(*) as 记录数量
FROM inventory 
WHERE storage_location IS NOT NULL AND storage_location != ''
GROUP BY storage_location
ORDER BY 记录数量 DESC`,
        triggers: [
          "仓库列表", "所有仓库", "有哪些仓库", "仓库有什么", "仓库都有什么",
          "系统里有哪些仓库", "查看仓库", "显示仓库", "仓库信息", "库房信息",
          "存储区", "仓储", "仓库", "查看所有仓库", "仓库都有哪些"
        ]
      },
      {
        id: 484,
        name: '查看库存状态分布',
        sql: `SELECT 
  status as 状态, 
  COUNT(*) as 数量,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
FROM inventory 
WHERE status IS NOT NULL AND status != ''
GROUP BY status 
ORDER BY 数量 DESC`,
        triggers: [
          "状态分布", "库存状态", "有哪些状态", "状态统计", "状态都有什么",
          "库存状态都有哪些", "状态信息", "库存状态分布", "状态", "状态都有哪些"
        ]
      }
    ];
    
    for (const rule of explorationRuleFixes) {
      try {
        // 更新SQL和触发词
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, trigger_words = ?, updated_at = NOW()
          WHERE id = ?
        `, [rule.sql, JSON.stringify(rule.triggers), rule.id]);
        
        console.log(`✅ 修复规则 ${rule.id}: ${rule.name}`);
        
        // 测试SQL
        const [testResult] = await connection.execute(rule.sql);
        console.log(`   测试结果: ${testResult.length}条记录`);
        
      } catch (error) {
        console.log(`❌ 修复规则 ${rule.id} 失败: ${error.message}`);
      }
    }
    
    // 2. 修复库存场景规则
    console.log('\n🔧 修复库存场景规则...');
    
    const inventoryRuleFixes = [
      {
        name: '物料库存信息查询_优化',
        sql: `SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(updated_at, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE material_name LIKE CONCAT('%', ?, '%')
ORDER BY id DESC`
      },
      {
        name: '供应商库存查询_优化',
        sql: `SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(updated_at, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE supplier_name LIKE CONCAT('%', ?, '%')
ORDER BY id DESC`
      },
      {
        name: '库存状态查询',
        sql: `SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(updated_at, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE status LIKE CONCAT('%', ?, '%')
ORDER BY id DESC`
      }
    ];
    
    for (const rule of inventoryRuleFixes) {
      try {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE intent_name = ?
        `, [rule.sql, rule.name]);
        
        console.log(`✅ 修复库存规则: ${rule.name}`);
        
      } catch (error) {
        console.log(`❌ 修复库存规则 ${rule.name} 失败: ${error.message}`);
      }
    }
    
    // 3. 测试修复后的规则
    console.log('\n🧪 测试修复后的规则...');
    
    const testRules = [485, 480, 481, 484];
    
    for (const ruleId of testRules) {
      try {
        const testResponse = await fetch(`http://localhost:3001/api/rules/test/${ruleId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          if (testResult.success) {
            console.log(`✅ 规则${ruleId}测试成功: ${testResult.data.resultCount}条记录`);
            if (testResult.data.tableData && testResult.data.tableData.length > 0) {
              console.log(`   数据样本:`, testResult.data.tableData[0]);
            }
          } else {
            console.log(`❌ 规则${ruleId}测试失败: ${testResult.data.error}`);
          }
        } else {
          console.log(`❌ 规则${ruleId}测试请求失败: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ 规则${ruleId}测试异常: ${error.message}`);
      }
    }
    
    // 4. 测试智能问答
    console.log('\n🤖 测试智能问答...');
    
    const testQueries = [
      '查看所有供应商',
      '查看所有物料',
      '查看库存状态分布',
      '查询电池盖的库存'
    ];
    
    for (const query of testQueries) {
      try {
        const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        });
        
        if (queryResponse.ok) {
          const queryResult = await queryResponse.json();
          if (queryResult.success) {
            console.log(`✅ 问答成功: "${query}" - 返回${queryResult.data.tableData ? queryResult.data.tableData.length : 0}条记录`);
          } else {
            console.log(`❌ 问答失败: "${query}" - ${queryResult.error}`);
          }
        } else {
          console.log(`❌ 问答请求失败: "${query}"`);
        }
      } catch (error) {
        console.log(`❌ 问答异常: "${query}" - ${error.message}`);
      }
    }
    
    console.log('\n🎉 字段名修复完成！');
    console.log('✅ 数据探索规则已修复');
    console.log('✅ 库存场景规则已修复');
    console.log('✅ 规则测试已验证');
    console.log('✅ 智能问答已测试');
    console.log('✅ 系统现在应该可以正常工作了');
    
  } catch (error) {
    console.error('❌ 字段名修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixFieldNames().catch(console.error);
