/**
 * 检查实际数据并修复NLP规则
 */

import mysql from 'mysql2/promise';

async function checkActualDataAndFixRules() {
  console.log('🔍 检查实际数据并修复NLP规则...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 检查lab_tests表的实际数据和测试结果字段
    console.log('1. 检查lab_tests表的实际数据...');
    const [labData] = await connection.query('SELECT * FROM lab_tests LIMIT 5');
    console.log('lab_tests表数据示例:');
    if (labData.length > 0) {
      console.table(labData);
      
      // 检查test_result字段的实际值
      const [testResults] = await connection.query('SELECT DISTINCT test_result FROM lab_tests WHERE test_result IS NOT NULL');
      console.log('test_result字段的实际值:', testResults.map(r => r.test_result));
      
      // 统计各种测试结果的数量
      const [resultStats] = await connection.query(`
        SELECT test_result, COUNT(*) as count 
        FROM lab_tests 
        WHERE test_result IS NOT NULL 
        GROUP BY test_result
      `);
      console.log('测试结果统计:');
      console.table(resultStats);
    } else {
      console.log('❌ lab_tests表中没有数据');
    }
    
    // 2. 检查inventory表的实际数据和字段
    console.log('\n2. 检查inventory表的实际数据...');
    const [inventoryData] = await connection.query('SELECT * FROM inventory LIMIT 5');
    console.log('inventory表数据示例:');
    if (inventoryData.length > 0) {
      console.table(inventoryData);
      
      // 检查status和risk_level字段的实际值
      const [statusValues] = await connection.query('SELECT DISTINCT status FROM inventory WHERE status IS NOT NULL');
      console.log('status字段的实际值:', statusValues.map(s => s.status));
      
      const [riskValues] = await connection.query('SELECT DISTINCT risk_level FROM inventory WHERE risk_level IS NOT NULL');
      console.log('risk_level字段的实际值:', riskValues.map(r => r.risk_level));
      
      // 统计状态分布
      const [statusStats] = await connection.query(`
        SELECT status, COUNT(*) as count 
        FROM inventory 
        WHERE status IS NOT NULL 
        GROUP BY status
      `);
      console.log('库存状态统计:');
      console.table(statusStats);
    } else {
      console.log('❌ inventory表中没有数据');
    }
    
    // 3. 修复测试结果查询规则
    console.log('\n3. 修复测试结果查询规则...');
    
    // 检查当前的测试结果查询规则
    const [testRules] = await connection.query(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%测试结果%'
    `);
    
    console.log('当前测试结果相关规则:');
    testRules.forEach(rule => {
      console.log(`规则: ${rule.intent_name}`);
      console.log(`SQL: ${rule.action_target.substring(0, 100)}...`);
    });
    
    // 修复测试结果查询规则 - 基于实际的test_result值
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        test_id as 测试编号,
        test_date as 日期,
        "未知" as 项目,
        "未知" as 基线,
        material_code as 物料类型,
        "未知" as 数量,
        material_name as 物料名称,
        supplier_name as 供应商,
        CASE 
          WHEN test_result = "PASS" THEN "合格"
          WHEN test_result = "FAIL" THEN defect_desc
          ELSE test_result
        END as 不合格描述,
        notes as 备注
      FROM lab_tests
      WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY test_date DESC
      LIMIT 20'
      WHERE intent_name LIKE '%测试结果查询%'
    `);
    
    // 4. 修复库存状态查询规则 - 移除risk_level字段
    console.log('4. 修复库存状态查询规则...');
    
    // 检查当前的库存状态查询规则
    const [statusRules] = await connection.query(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%状态%' OR intent_name LIKE '%库存%'
    `);
    
    console.log('当前库存状态相关规则:');
    statusRules.forEach(rule => {
      console.log(`规则: ${rule.intent_name}`);
      console.log(`SQL: ${rule.action_target.substring(0, 100)}...`);
    });
    
    // 修复库存状态查询规则 - 移除不存在的字段，只使用前端实际显示的字段
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = 'SELECT
        "未知" as 工厂,
        storage_location as 仓库,
        material_type as 物料类型,
        supplier_name as 供应商名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        inbound_time as 入库时间,
        "未知" as 到期时间,
        notes as 备注
      FROM inventory
      WHERE status LIKE CONCAT(''%'', ?, ''%'')
      ORDER BY inbound_time DESC
      LIMIT 20'
      WHERE intent_name LIKE '%状态查询%' OR intent_name LIKE '%风险查询%' OR intent_name LIKE '%冻结查询%' OR intent_name LIKE '%正常查询%'
    `);
    
    // 5. 验证修复后的规则
    console.log('\n5. 验证修复后的规则...');
    
    const [updatedRules] = await connection.query(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%测试结果查询%' OR intent_name LIKE '%状态查询%'
    `);
    
    for (const rule of updatedRules) {
      console.log(`\n📋 验证规则: ${rule.intent_name}`);
      
      try {
        let testSQL = rule.action_target;
        if (testSQL.includes('?')) {
          testSQL = testSQL.replace(/\?/g, "'test'");
        }
        
        const [results] = await connection.query(testSQL);
        
        console.log(`✅ 执行成功，返回 ${results.length} 条记录`);
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`📊 返回字段: ${fields.join(', ')}`);
          console.log('数据示例:', results[0]);
        }
        
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 基于实际数据的规则修复完成！');
    
  } catch (error) {
    console.error('❌ 检查和修复失败:', error.message);
  }
}

checkActualDataAndFixRules();
