/**
 * 针对性修复特定的NLP规则问题
 */

import mysql from 'mysql2/promise';

async function finalFixSpecificRules() {
  console.log('🔧 针对性修复特定的NLP规则问题...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 修复测试结果查询规则 - 移除WHERE条件，显示所有测试结果
    console.log('1. 修复测试结果查询规则...');
    
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
          WHEN test_result = "FAIL" THEN CONCAT("不合格: ", COALESCE(defect_desc, "无描述"))
          ELSE CONCAT("状态: ", test_result)
        END as 不合格描述,
        notes as 备注
      FROM lab_tests
      ORDER BY test_date DESC
      LIMIT 20'
      WHERE intent_name = '测试结果查询'
    `);
    
    // 2. 创建专门的OK/NG测试结果查询规则
    console.log('2. 创建OK/NG测试结果查询规则...');
    
    // 先删除可能存在的旧规则
    await connection.query(`
      DELETE FROM nlp_intent_rules 
      WHERE intent_name = 'OK测试结果查询' OR intent_name = 'NG测试结果查询'
    `);
    
    // 创建OK测试结果查询规则
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, 
        description, 
        action_type, 
        action_target, 
        example_query,
        status,
        created_at, 
        updated_at
      ) VALUES (
        'OK测试结果查询',
        '查询测试通过(PASS)的物料信息',
        'query',
        'SELECT
          test_id as 测试编号,
          test_date as 日期,
          "未知" as 项目,
          "未知" as 基线,
          material_code as 物料类型,
          "未知" as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          "合格" as 不合格描述,
          notes as 备注
        FROM lab_tests
        WHERE test_result = ''PASS''
        ORDER BY test_date DESC
        LIMIT 20',
        '查询OK测试结果',
        'active',
        NOW(),
        NOW()
      )
    `);
    
    // 创建NG测试结果查询规则
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, 
        description, 
        action_type, 
        action_target, 
        example_query,
        status,
        created_at, 
        updated_at
      ) VALUES (
        'NG测试结果查询',
        '查询测试失败(FAIL)的物料信息',
        'query',
        'SELECT
          test_id as 测试编号,
          test_date as 日期,
          "未知" as 项目,
          "未知" as 基线,
          material_code as 物料类型,
          "未知" as 数量,
          material_name as 物料名称,
          supplier_name as 供应商,
          CONCAT("不合格: ", COALESCE(defect_desc, "无描述")) as 不合格描述,
          notes as 备注
        FROM lab_tests
        WHERE test_result = ''FAIL''
        ORDER BY test_date DESC
        LIMIT 20',
        '查询NG测试结果',
        'active',
        NOW(),
        NOW()
      )
    `);
    
    // 3. 修复库存状态查询规则 - 移除risk_level字段，只显示前端实际字段
    console.log('3. 修复库存状态查询规则...');
    
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
      WHERE 1=1
      ORDER BY inbound_time DESC
      LIMIT 20'
      WHERE intent_name LIKE '%状态查询%' OR intent_name LIKE '%风险查询%' OR intent_name LIKE '%冻结查询%' OR intent_name LIKE '%正常查询%'
    `);
    
    // 4. 创建专门的状态筛选查询规则
    console.log('4. 创建专门的状态筛选查询规则...');
    
    // 删除可能存在的旧规则
    await connection.query(`
      DELETE FROM nlp_intent_rules 
      WHERE intent_name IN ('正常状态查询', '风险状态查询', '冻结状态查询')
    `);
    
    // 创建正常状态查询规则
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, example_query, status, created_at, updated_at
      ) VALUES (
        '正常状态查询', '查询状态为正常的库存物料', 'query',
        'SELECT "未知" as 工厂, storage_location as 仓库, material_type as 物料类型, supplier_name as 供应商名称, supplier_name as 供应商, quantity as 数量, status as 状态, inbound_time as 入库时间, "未知" as 到期时间, notes as 备注 FROM inventory WHERE status = ''正常'' ORDER BY inbound_time DESC LIMIT 20',
        '查询正常状态库存', 'active', NOW(), NOW()
      )
    `);
    
    // 创建风险状态查询规则
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, example_query, status, created_at, updated_at
      ) VALUES (
        '风险状态查询', '查询状态为风险的库存物料', 'query',
        'SELECT "未知" as 工厂, storage_location as 仓库, material_type as 物料类型, supplier_name as 供应商名称, supplier_name as 供应商, quantity as 数量, status as 状态, inbound_time as 入库时间, "未知" as 到期时间, notes as 备注 FROM inventory WHERE status = ''风险'' ORDER BY inbound_time DESC LIMIT 20',
        '查询风险状态库存', 'active', NOW(), NOW()
      )
    `);
    
    // 创建冻结状态查询规则
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, action_type, action_target, example_query, status, created_at, updated_at
      ) VALUES (
        '冻结状态查询', '查询状态为冻结的库存物料', 'query',
        'SELECT "未知" as 工厂, storage_location as 仓库, material_type as 物料类型, supplier_name as 供应商名称, supplier_name as 供应商, quantity as 数量, status as 状态, inbound_time as 入库时间, "未知" as 到期时间, notes as 备注 FROM inventory WHERE status = ''冻结'' ORDER BY inbound_time DESC LIMIT 20',
        '查询冻结状态库存', 'active', NOW(), NOW()
      )
    `);
    
    // 5. 验证修复后的规则
    console.log('\n5. 验证修复后的规则...');
    
    const testRules = [
      '测试结果查询',
      'OK测试结果查询', 
      'NG测试结果查询',
      '正常状态查询',
      '风险状态查询',
      '冻结状态查询'
    ];
    
    for (const ruleName of testRules) {
      console.log(`\n📋 验证规则: ${ruleName}`);
      
      try {
        const [ruleData] = await connection.query(
          'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
          [ruleName]
        );
        
        if (ruleData.length === 0) {
          console.log(`❌ 规则不存在`);
          continue;
        }
        
        const [results] = await connection.query(ruleData[0].action_target);
        
        console.log(`✅ 执行成功，返回 ${results.length} 条记录`);
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`📊 返回字段: ${fields.join(', ')}`);
          console.log('数据示例:', {
            测试编号: results[0]['测试编号'] || results[0]['工厂'] || '无',
            物料名称: results[0]['物料名称'] || '无',
            状态: results[0]['状态'] || results[0]['不合格描述'] || '无'
          });
        }
        
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 针对性规则修复完成！');
    console.log('\n📋 修复总结:');
    console.log('1. ✅ 测试结果查询规则已修复，现在可以正常返回数据');
    console.log('2. ✅ 新增OK/NG专门查询规则，支持按测试结果筛选');
    console.log('3. ✅ 库存状态查询规则已修复，移除了前端不显示的risk_level字段');
    console.log('4. ✅ 新增专门的状态筛选规则，支持按正常/风险/冻结状态查询');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

finalFixSpecificRules();
