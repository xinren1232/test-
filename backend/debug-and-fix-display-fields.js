/**
 * 调试并修复显示字段问题
 */

import mysql from 'mysql2/promise';

async function debugAndFixDisplayFields() {
  console.log('🔍 调试并修复显示字段问题...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 检查当前所有涉及测试结果和库存的规则
    console.log('1. 检查当前所有相关规则...');
    const [allRules] = await connection.query(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%测试%' OR intent_name LIKE '%库存%' OR intent_name LIKE '%状态%'
      ORDER BY intent_name
    `);
    
    console.log(`找到 ${allRules.length} 个相关规则:`);
    allRules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
    });
    
    // 2. 彻底修复所有包含risk_level的规则
    console.log('\n2. 彻底移除所有risk_level字段引用...');
    
    // 查找所有包含risk_level的规则
    const [riskRules] = await connection.query(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%risk_level%'
    `);
    
    console.log(`找到 ${riskRules.length} 个包含risk_level的规则:`);
    riskRules.forEach(rule => {
      console.log(`- ${rule.intent_name}`);
    });
    
    // 批量更新所有包含risk_level的规则，移除该字段
    for (const rule of riskRules) {
      const cleanedSQL = rule.action_target
        .replace(/,\s*risk_level\s+as\s+[^,\s]+/gi, '')
        .replace(/risk_level\s+as\s+[^,\s]+\s*,/gi, '')
        .replace(/,\s*risk_level/gi, '')
        .replace(/risk_level\s*,/gi, '');
      
      await connection.query(
        'UPDATE nlp_intent_rules SET action_target = ? WHERE intent_name = ?',
        [cleanedSQL, rule.intent_name]
      );
      
      console.log(`✅ 已清理规则: ${rule.intent_name}`);
    }
    
    // 3. 确保测试结果查询规则完全正确
    console.log('\n3. 确保测试结果查询规则完全正确...');
    
    const correctTestResultSQL = `SELECT
      test_id as 测试编号,
      test_date as 日期,
      "未知" as 项目,
      "未知" as 基线,
      material_code as 物料类型,
      "未知" as 数量,
      material_name as 物料名称,
      supplier_name as 供应商,
      CASE 
        WHEN test_result = 'PASS' THEN "合格"
        WHEN test_result = 'FAIL' THEN CONCAT("不合格: ", COALESCE(defect_desc, "无描述"))
        ELSE CONCAT("状态: ", test_result)
      END as 不合格描述,
      notes as 备注
    FROM lab_tests
    ORDER BY test_date DESC
    LIMIT 20`;
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '测试结果查询'
    `, [correctTestResultSQL]);
    
    // 4. 确保库存查询规则完全正确
    console.log('4. 确保库存查询规则完全正确...');
    
    const correctInventorySQL = `SELECT
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
    ORDER BY inbound_time DESC
    LIMIT 20`;
    
    // 更新所有库存相关的规则
    const inventoryRuleNames = [
      '供应商库存查询',
      '工厂库存查询', 
      '工厂库存统计',
      '物料类型库存查询',
      '库存数量预警',
      '正常状态查询',
      '风险状态查询',
      '冻结状态查询'
    ];
    
    for (const ruleName of inventoryRuleNames) {
      let sql = correctInventorySQL;
      
      // 根据规则名称添加特定的WHERE条件
      if (ruleName === '正常状态查询') {
        sql = sql.replace('WHERE 1=1', "WHERE status = '正常'");
      } else if (ruleName === '风险状态查询') {
        sql = sql.replace('WHERE 1=1', "WHERE status = '风险'");
      } else if (ruleName === '冻结状态查询') {
        sql = sql.replace('WHERE 1=1', "WHERE status = '冻结'");
      }
      
      // 如果没有WHERE条件，添加一个通用的
      if (!sql.includes('WHERE')) {
        sql = sql.replace('ORDER BY', 'WHERE 1=1 ORDER BY');
      }
      
      await connection.query(`
        UPDATE nlp_intent_rules 
        SET action_target = ?
        WHERE intent_name = ?
      `, [sql, ruleName]);
      
      console.log(`✅ 已更新规则: ${ruleName}`);
    }
    
    // 5. 验证修复结果
    console.log('\n5. 验证修复结果...');
    
    const testCases = [
      '测试结果查询',
      '正常状态查询',
      '风险状态查询'
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📋 测试规则: ${testCase}`);
      
      try {
        const [ruleData] = await connection.query(
          'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
          [testCase]
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
          
          // 检查是否还包含risk_level相关字段
          const hasRiskField = fields.some(field => 
            field.toLowerCase().includes('risk') || 
            field.includes('风险等级') ||
            field.includes('风险级别')
          );
          
          if (hasRiskField) {
            console.log(`❌ 仍然包含风险相关字段!`);
          } else {
            console.log(`✅ 已成功移除风险相关字段`);
          }
          
          // 显示第一条记录的示例
          console.log('数据示例:', results[0]);
        }
        
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
      }
    }
    
    // 6. 最终检查 - 确保没有任何规则包含risk_level
    console.log('\n6. 最终检查...');
    const [finalCheck] = await connection.query(`
      SELECT intent_name 
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%risk_level%'
    `);
    
    if (finalCheck.length === 0) {
      console.log('✅ 所有规则已成功清理，不再包含risk_level字段');
    } else {
      console.log(`❌ 仍有 ${finalCheck.length} 个规则包含risk_level字段:`);
      finalCheck.forEach(rule => console.log(`- ${rule.intent_name}`));
    }
    
    await connection.end();
    console.log('\n🎉 显示字段问题修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

debugAndFixDisplayFields();
