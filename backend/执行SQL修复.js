import mysql from 'mysql2/promise';

async function executeSQLFix() {
  let connection;
  
  try {
    console.log('🔧 开始执行SQL修复...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 更新库存场景规则 - 物料查询
    console.log('\n📦 修复库存场景规则...');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, category = '库存场景'
      WHERE intent_name = '物料库存信息查询_优化'
    `, [`SELECT 
  COALESCE(factory, '未指定') as 工厂,
  COALESCE(warehouse, '未指定') as 仓库,
  COALESCE(materialCode, material_code, '') as 物料编码,
  COALESCE(materialName, material_name, '') as 物料名称,
  COALESCE(supplier, supplier_name, '') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, '正常') as 状态,
  DATE_FORMAT(COALESCE(inboundTime, inbound_time, created_at), '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(COALESCE(expiryTime, expiry_time, updated_at), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE materialName LIKE CONCAT('%', ?, '%') OR material_name LIKE CONCAT('%', ?, '%')
ORDER BY id DESC
LIMIT 10`]);
    console.log('✅ 修复物料库存查询规则');
    
    // 2. 更新库存场景规则 - 供应商查询
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, category = '库存场景'
      WHERE intent_name = '供应商库存查询_优化'
    `, [`SELECT 
  COALESCE(factory, '未指定') as 工厂,
  COALESCE(warehouse, '未指定') as 仓库,
  COALESCE(materialCode, material_code, '') as 物料编码,
  COALESCE(materialName, material_name, '') as 物料名称,
  COALESCE(supplier, supplier_name, '') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, '正常') as 状态,
  DATE_FORMAT(COALESCE(inboundTime, inbound_time, created_at), '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(COALESCE(expiryTime, expiry_time, updated_at), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE supplier LIKE CONCAT('%', ?, '%') OR supplier_name LIKE CONCAT('%', ?, '%')
ORDER BY id DESC
LIMIT 10`]);
    console.log('✅ 修复供应商库存查询规则');
    
    // 3. 更新数据探索规则 - 供应商列表
    console.log('\n🔍 修复数据探索规则...');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '查看所有供应商'
    `, [`SELECT DISTINCT 
  COALESCE(supplier, supplier_name, '未知供应商') as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE COALESCE(supplier, supplier_name) IS NOT NULL 
  AND COALESCE(supplier, supplier_name) != ''
GROUP BY COALESCE(supplier, supplier_name)
ORDER BY 记录数量 DESC`]);
    console.log('✅ 修复供应商探索规则');
    
    // 4. 更新数据探索规则 - 物料列表
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '查看所有物料'
    `, [`SELECT DISTINCT 
  COALESCE(materialName, material_name, '未知物料') as 物料名称,
  COALESCE(materialCode, material_code, '') as 物料编码,
  COUNT(*) as 记录数量
FROM inventory 
WHERE COALESCE(materialName, material_name) IS NOT NULL 
  AND COALESCE(materialName, material_name) != ''
GROUP BY COALESCE(materialName, material_name), COALESCE(materialCode, material_code)
ORDER BY 记录数量 DESC`]);
    console.log('✅ 修复物料探索规则');
    
    // 5. 更新数据探索规则 - 工厂列表
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '查看所有工厂'
    `, [`SELECT DISTINCT 
  COALESCE(factory, '未知工厂') as 工厂,
  COUNT(*) as 记录数量
FROM inventory 
WHERE factory IS NOT NULL AND factory != ''
GROUP BY factory
ORDER BY 记录数量 DESC`]);
    console.log('✅ 修复工厂探索规则');
    
    // 6. 更新数据探索规则 - 仓库列表
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '查看所有仓库'
    `, [`SELECT DISTINCT 
  COALESCE(warehouse, '未知仓库') as 仓库,
  COUNT(*) as 记录数量
FROM inventory 
WHERE warehouse IS NOT NULL AND warehouse != ''
GROUP BY warehouse
ORDER BY 记录数量 DESC`]);
    console.log('✅ 修复仓库探索规则');
    
    // 7. 更新库存状态分布规则
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '查看库存状态分布'
    `, [`SELECT 
  COALESCE(status, '未知状态') as 状态, 
  COUNT(*) as 数量,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
FROM inventory 
WHERE status IS NOT NULL AND status != ''
GROUP BY status 
ORDER BY 数量 DESC`]);
    console.log('✅ 修复状态分布规则');
    
    // 8. 确保所有重要规则都是活跃状态
    console.log('\n✅ 确保规则状态正确...');
    
    const importantRules = [
      '查看所有物料', '查看所有供应商', '查看所有工厂', '查看所有仓库',
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
    
    // 9. 测试修复后的查询
    console.log('\n🧪 测试修复后的查询...');
    
    try {
      const [testResult] = await connection.execute(`
        SELECT DISTINCT 
          COALESCE(supplier, supplier_name, '未知供应商') as 供应商,
          COUNT(*) as 记录数量
        FROM inventory 
        WHERE COALESCE(supplier, supplier_name) IS NOT NULL 
          AND COALESCE(supplier, supplier_name) != ''
        GROUP BY COALESCE(supplier, supplier_name)
        ORDER BY 记录数量 DESC
        LIMIT 5
      `);
      
      console.log('✅ 供应商查询测试成功');
      console.log('  供应商列表:');
      testResult.forEach(row => {
        console.log(`    ${row.供应商}: ${row.记录数量}条记录`);
      });
    } catch (error) {
      console.log('❌ 供应商查询测试失败:', error.message);
    }
    
    try {
      const [testResult2] = await connection.execute(`
        SELECT DISTINCT 
          COALESCE(materialName, material_name, '未知物料') as 物料名称,
          COUNT(*) as 记录数量
        FROM inventory 
        WHERE COALESCE(materialName, material_name) IS NOT NULL 
          AND COALESCE(materialName, material_name) != ''
        GROUP BY COALESCE(materialName, material_name)
        ORDER BY 记录数量 DESC
        LIMIT 5
      `);
      
      console.log('✅ 物料查询测试成功');
      console.log('  物料列表:');
      testResult2.forEach(row => {
        console.log(`    ${row.物料名称}: ${row.记录数量}条记录`);
      });
    } catch (error) {
      console.log('❌ 物料查询测试失败:', error.message);
    }
    
    // 10. 统计最终结果
    console.log('\n📊 统计修复结果...');
    
    const [totalRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    const [explorationRules] = await connection.execute(`
      SELECT 
        intent_name as 规则名称,
        JSON_LENGTH(trigger_words) as 触发词数量
      FROM nlp_intent_rules 
      WHERE category = '数据探索' AND status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`📈 总活跃规则: ${totalRules[0].total}条`);
    console.log('🔍 数据探索规则:');
    explorationRules.forEach(rule => {
      console.log(`   ${rule.规则名称}: ${rule.触发词数量}个触发词`);
    });
    
    console.log('\n🎉 SQL修复完成！');
    console.log('✅ 数据库字段映射已修复');
    console.log('✅ 数据探索规则已优化');
    console.log('✅ 库存场景规则已更新');
    console.log('✅ 所有规则状态已确认');
    
  } catch (error) {
    console.error('❌ SQL修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

executeSQLFix().catch(console.error);
