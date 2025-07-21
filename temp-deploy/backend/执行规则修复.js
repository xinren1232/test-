import mysql from 'mysql2/promise';

async function executeRuleFixes() {
  let connection;
  
  try {
    console.log('🔧 开始执行规则修复...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 修复数据探索规则的触发词
    console.log('\n🔍 修复数据探索规则触发词...');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET trigger_words = ?
      WHERE intent_name = '查看所有供应商'
    `, [JSON.stringify(["供应商列表", "所有供应商", "有哪些供应商", "系统里有哪些供应商", "供应商都有什么", "查看供应商"])]);
    console.log('✅ 修复供应商探索规则');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET trigger_words = ?
      WHERE intent_name = '查看所有工厂'
    `, [JSON.stringify(["工厂列表", "所有工厂", "有哪些工厂", "系统里有哪些工厂", "工厂都有什么", "查看工厂"])]);
    console.log('✅ 修复工厂探索规则');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET trigger_words = ?
      WHERE intent_name = '查看所有仓库'
    `, [JSON.stringify(["仓库列表", "所有仓库", "有哪些仓库", "系统里有哪些仓库", "仓库都有什么", "查看仓库"])]);
    console.log('✅ 修复仓库探索规则');
    
    // 2. 修复测试场景规则的SQL
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
    
    // 物料测试情况查询
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, category = '测试场景'
      WHERE intent_name = '物料测试情况查询'
    `, [`${testScenarioSQL}\nWHERE material_name LIKE CONCAT('%', ?, '%')\nORDER BY test_date DESC\nLIMIT 10`]);
    console.log('✅ 修复物料测试查询规则');
    
    // 供应商测试情况查询
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, category = '测试场景'
      WHERE intent_name = '供应商测试情况查询'
    `, [`${testScenarioSQL}\nWHERE supplier_name LIKE CONCAT('%', ?, '%')\nORDER BY test_date DESC\nLIMIT 10`]);
    console.log('✅ 修复供应商测试查询规则');
    
    // NG测试结果查询
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, category = '测试场景'
      WHERE intent_name = 'NG测试结果查询_优化'
    `, [`${testScenarioSQL}\nWHERE test_result IN ('FAIL', 'NG', '不合格')\nORDER BY test_date DESC\nLIMIT 10`]);
    console.log('✅ 修复NG测试查询规则');
    
    // 3. 修复库存场景规则的SQL
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
    
    // 物料库存信息查询
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, category = '库存场景'
      WHERE intent_name = '物料库存信息查询_优化'
    `, [`${inventoryScenarioSQL}\nWHERE material_name LIKE CONCAT('%', ?, '%')\nORDER BY inbound_time DESC\nLIMIT 10`]);
    console.log('✅ 修复物料库存查询规则');
    
    // 供应商库存查询
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, category = '库存场景'
      WHERE intent_name = '供应商库存查询_优化'
    `, [`${inventoryScenarioSQL}\nWHERE supplier_name LIKE CONCAT('%', ?, '%')\nORDER BY inbound_time DESC\nLIMIT 10`]);
    console.log('✅ 修复供应商库存查询规则');
    
    // 4. 添加库存状态分布探索规则
    console.log('\n➕ 添加库存状态分布探索规则...');
    
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
      `SELECT 
        status as 状态, 
        COUNT(*) as 数量,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
      FROM inventory 
      WHERE status IS NOT NULL
      GROUP BY status 
      ORDER BY 数量 DESC`,
      JSON.stringify(["状态分布", "库存状态", "有哪些状态", "状态统计", "库存状态都有哪些", "状态都有什么"]),
      '库存状态都有哪些？',
      '数据探索'
    ]);
    console.log('✅ 添加库存状态分布规则');
    
    // 5. 修复测试结果查询规则的触发词
    console.log('\n🔧 修复测试结果查询触发词...');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET trigger_words = ?
      WHERE intent_name LIKE '%测试结果查询%'
    `, [JSON.stringify(["测试结果", "查询测试结果", "测试情况", "检测结果", "测试记录"])]);
    console.log('✅ 修复测试结果查询触发词');
    
    // 6. 确保所有规则都有正确的状态
    console.log('\n✅ 确保规则状态正确...');
    
    const importantRules = [
      '查看所有物料', '查看所有供应商', '查看所有工厂', '查看所有仓库',
      '物料测试情况查询', '供应商测试情况查询', 'NG测试结果查询_优化',
      '物料库存信息查询_优化', '供应商库存查询_优化', '查看库存状态分布'
    ];
    
    for (const ruleName of importantRules) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET status = 'active', updated_at = NOW()
        WHERE intent_name = ?
      `, [ruleName]);
    }
    console.log('✅ 规则状态更新完成');
    
    // 7. 统计修复结果
    console.log('\n📊 统计修复结果...');
    
    const [categoryStats] = await connection.execute(`
      SELECT 
        category,
        COUNT(*) as 规则数量,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as 活跃规则
      FROM nlp_intent_rules 
      WHERE category IN ('数据探索', '测试场景', '库存场景')
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('📈 分类统计:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.活跃规则}/${stat.规则数量} 条活跃`);
    });
    
    const [totalStats] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    
    console.log(`\n🎉 修复完成！总活跃规则: ${totalStats[0].total}条`);
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

executeRuleFixes().catch(console.error);
