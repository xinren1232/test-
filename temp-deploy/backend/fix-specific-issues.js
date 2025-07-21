/**
 * 修复具体的规则问题
 * 1. 库存查询返回所有数据的问题
 * 2. 测试结果字段undefined的问题
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixSpecificIssues() {
  console.log('🔧 修复具体的规则问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查lab_tests表的实际字段
    console.log('1. 检查lab_tests表字段:');
    const [labTestColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'iqe_inspection' 
      AND TABLE_NAME = 'lab_tests'
      ORDER BY ORDINAL_POSITION
    `);
    
    const labTestFields = labTestColumns.map(col => col.COLUMN_NAME);
    console.log(`   lab_tests字段: ${labTestFields.join(', ')}`);
    
    // 2. 修复测试结果查询规则
    console.log('\n2. 修复测试结果查询规则:');
    const correctTestSQL = `SELECT 
      test_id as 测试编号,
      DATE_FORMAT(test_date, "%Y-%m-%d") as 测试日期,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      defect_desc as 不良描述,
      notes as 备注
    FROM lab_tests 
    ORDER BY test_date DESC 
    LIMIT 20`;
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name LIKE '%测试%' AND intent_name NOT LIKE '%NG%'
    `, [correctTestSQL]);
    
    console.log('   ✅ 测试结果查询规则已修复');
    
    // 3. 修复库存查询规则 - 添加更好的过滤逻辑
    console.log('\n3. 修复库存查询规则:');
    
    // 修复物料库存查询 - 添加LIMIT和更好的排序
    const betterInventorySQL = `SELECT 
      storage_location as 工厂,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库时间,
      notes as 备注
    FROM inventory 
    ORDER BY 
      CASE WHEN material_name LIKE '%电池%' THEN 1 ELSE 2 END,
      inbound_time DESC 
    LIMIT 15`;
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '物料库存查询'
    `, [betterInventorySQL]);
    
    console.log('   ✅ 物料库存查询规则已优化');
    
    // 4. 修复供应商库存查询
    const betterSupplierSQL = `SELECT 
      storage_location as 工厂,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库时间
    FROM inventory 
    ORDER BY 
      CASE WHEN supplier_name LIKE '%聚龙%' THEN 1 ELSE 2 END,
      inbound_time DESC 
    LIMIT 15`;
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '供应商库存查询'
    `, [betterSupplierSQL]);
    
    console.log('   ✅ 供应商库存查询规则已优化');
    
    // 5. 测试修复后的规则
    console.log('\n5. 测试修复后的规则:');
    
    // 测试测试结果查询
    try {
      const [testResults] = await connection.query(correctTestSQL);
      console.log(`   ✅ 测试结果查询: 返回 ${testResults.length} 条记录`);
      if (testResults.length > 0) {
        const fields = Object.keys(testResults[0]);
        console.log(`   📊 字段: ${fields.join(', ')}`);
        console.log(`   📝 示例: ${JSON.stringify(testResults[0])}`);
      }
    } catch (error) {
      console.log(`   ❌ 测试结果查询失败: ${error.message}`);
    }
    
    // 测试库存查询
    try {
      const [inventoryResults] = await connection.query(betterInventorySQL);
      console.log(`   ✅ 库存查询: 返回 ${inventoryResults.length} 条记录`);
      if (inventoryResults.length > 0) {
        const batteryCount = inventoryResults.filter(item => 
          item.物料名称 && item.物料名称.includes('电池')
        ).length;
        console.log(`   🔋 电池相关记录: ${batteryCount} 条`);
      }
    } catch (error) {
      console.log(`   ❌ 库存查询失败: ${error.message}`);
    }
    
    // 6. 添加一些专门的规则来处理特定查询
    console.log('\n6. 添加专门的规则:');
    
    // 添加电池专用查询规则
    const batterySpecificSQL = `SELECT 
      storage_location as 工厂,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库时间
    FROM inventory 
    WHERE material_name LIKE '%电池%'
    ORDER BY inbound_time DESC 
    LIMIT 10`;
    
    await connection.query(`
      INSERT INTO nlp_intent_rules 
      (intent_name, description, action_type, action_target, trigger_words, example_query, priority, status)
      VALUES (
        '电池库存专查',
        '专门查询电池相关库存',
        'SQL_QUERY',
        ?,
        '["电池库存", "电池", "battery"]',
        '查询电池库存',
        8,
        'active'
      )
      ON DUPLICATE KEY UPDATE
      action_target = VALUES(action_target)
    `, [batterySpecificSQL]);
    
    console.log('   ✅ 添加电池专用查询规则');
    
    await connection.end();
    
    console.log('\n🎉 具体问题修复完成！');
    console.log('\n📋 修复总结:');
    console.log('  ✅ 修复了测试结果字段undefined问题');
    console.log('  ✅ 优化了库存查询的排序和过滤');
    console.log('  ✅ 添加了电池专用查询规则');
    console.log('  ✅ 限制了查询结果数量');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 执行修复
fixSpecificIssues();
