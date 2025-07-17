const mysql = require('mysql2/promise');

async function quickFixRules() {
  let connection;
  
  try {
    console.log('🔧 开始快速修复规则问题...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查数据库表结构
    console.log('\n📋 检查数据库表结构...');
    
    const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
    console.log('inventory表字段:', inventoryColumns.map(col => col.Field).join(', '));
    
    const [labTestColumns] = await connection.execute('DESCRIBE lab_tests');
    console.log('lab_tests表字段:', labTestColumns.map(col => col.Field).join(', '));
    
    // 2. 修复数据探索规则的触发词
    console.log('\n🔍 修复数据探索规则触发词...');
    
    const explorationUpdates = [
      {
        name: '查看所有供应商',
        triggers: JSON.stringify(['供应商列表', '所有供应商', '有哪些供应商', '系统里有哪些供应商', '供应商都有什么'])
      },
      {
        name: '查看所有工厂', 
        triggers: JSON.stringify(['工厂列表', '所有工厂', '有哪些工厂', '系统里有哪些工厂', '工厂都有什么'])
      },
      {
        name: '查看所有仓库',
        triggers: JSON.stringify(['仓库列表', '所有仓库', '有哪些仓库', '系统里有哪些仓库', '仓库都有什么'])
      }
    ];
    
    for (const update of explorationUpdates) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET trigger_words = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [update.triggers, update.name]);
      console.log(`✅ 更新触发词: ${update.name}`);
    }
    
    // 3. 修复测试场景规则的SQL - 基于实际表结构
    console.log('\n🧪 修复测试场景规则SQL...');
    
    const testScenarioSQL = `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COALESCE(quantity, 1) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests`;
    
    const testRules = [
      { name: '物料测试情况查询', where: 'WHERE material_name LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '供应商测试情况查询', where: 'WHERE supplier_name LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: 'NG测试结果查询_优化', where: 'WHERE test_result IN (\'FAIL\', \'NG\', \'不合格\')' },
      { name: '项目测试情况查询', where: 'WHERE project_id LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '基线测试情况查询', where: 'WHERE baseline_id LIKE CONCAT(\'%\', ?, \'%\')' }
    ];
    
    for (const rule of testRules) {
      const fullSQL = `${testScenarioSQL}\n${rule.where}\nORDER BY test_date DESC\nLIMIT 10`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, category = '测试场景', updated_at = NOW()
        WHERE intent_name = ?
      `, [fullSQL, rule.name]);
      console.log(`✅ 修复测试规则: ${rule.name}`);
    }
    
    // 4. 修复库存场景规则的SQL
    console.log('\n📦 修复库存场景规则SQL...');
    
    const inventoryScenarioSQL = `SELECT 
  factory as 工厂,
  warehouse as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(expiry_time, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory`;
    
    const inventoryRules = [
      { name: '物料库存信息查询_优化', where: 'WHERE material_name LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '供应商库存查询_优化', where: 'WHERE supplier_name LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '库存状态查询', where: 'WHERE status LIKE CONCAT(\'%\', ?, \'%\')' }
    ];
    
    for (const rule of inventoryRules) {
      const fullSQL = `${inventoryScenarioSQL}\n${rule.where}\nORDER BY inbound_time DESC\nLIMIT 10`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, category = '库存场景', updated_at = NOW()
        WHERE intent_name = ?
      `, [fullSQL, rule.name]);
      console.log(`✅ 修复库存规则: ${rule.name}`);
    }
    
    // 5. 添加状态分布探索规则
    console.log('\n➕ 添加状态分布探索规则...');
    
    const statusDistributionSQL = `SELECT 
  status as 状态, 
  COUNT(*) as 数量,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
FROM inventory 
WHERE status IS NOT NULL
GROUP BY status 
ORDER BY 数量 DESC`;
    
    await connection.execute(`
      INSERT INTO nlp_intent_rules 
      (intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, created_at, updated_at)
      VALUES (?, ?, 'SQL_QUERY', ?, ?, ?, ?, 50, 'active', NOW(), NOW())
      ON DUPLICATE KEY UPDATE
      action_target = VALUES(action_target),
      trigger_words = VALUES(trigger_words),
      updated_at = NOW()
    `, [
      '查看库存状态分布',
      '显示库存中各种状态的分布情况',
      statusDistributionSQL,
      JSON.stringify(['状态分布', '库存状态', '有哪些状态', '状态统计', '库存状态都有哪些']),
      '库存状态都有哪些？',
      '数据探索'
    ]);
    console.log('✅ 添加库存状态分布规则');
    
    // 6. 统计最终结果
    console.log('\n📊 统计修复结果...');
    
    const [totalRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    const [explorationRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE category = "数据探索" AND status = "active"'
    );
    
    const [testRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE category = "测试场景" AND status = "active"'
    );
    
    const [inventoryRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE category = "库存场景" AND status = "active"'
    );
    
    console.log('\n🎉 快速修复完成！');
    console.log('📈 规则统计:');
    console.log(`   总活跃规则: ${totalRules[0].total}条`);
    console.log(`   数据探索规则: ${explorationRules[0].total}条`);
    console.log(`   测试场景规则: ${testRules[0].total}条`);
    console.log(`   库存场景规则: ${inventoryRules[0].total}条`);
    
    // 7. 测试几个关键规则
    console.log('\n🧪 测试关键规则...');
    
    const testQueries = [
      { name: '查看所有供应商', sql: 'SELECT DISTINCT supplier_name as 供应商 FROM inventory ORDER BY supplier_name' },
      { name: '查看库存状态分布', sql: statusDistributionSQL },
      { name: '测试场景字段', sql: testScenarioSQL + '\nLIMIT 1' }
    ];
    
    for (const test of testQueries) {
      try {
        const [results] = await connection.execute(test.sql);
        console.log(`✅ ${test.name}: ${results.length}条记录`);
        if (results.length > 0) {
          console.log(`   字段: ${Object.keys(results[0]).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

quickFixRules().catch(console.error);
