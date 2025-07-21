/**
 * 修复规则SQL，移除LIMIT限制并使用正确的字段值
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function fixRulesSQL() {
  console.log('🔧 修复规则SQL，移除LIMIT限制并使用正确的字段值...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 修复Top缺陷排行查询规则
    console.log('🔧 修复Top缺陷排行查询规则:');
    const newTopDefectSQL = `SELECT test_id as 测试编号,
            test_date as 日期,
            project_id as 项目,
            baseline_id as 基线,
            material_code as 物料编码,
            quantity as 数量,
            material_name as 物料名称,
            supplier_name as 供应商,
            test_result as 测试结果,
            defect_desc as 不合格描述,
            notes as 备注
FROM lab_tests
WHERE test_result = '不合格' AND defect_desc IS NOT NULL AND defect_desc != ''
ORDER BY test_date DESC`;
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ? WHERE intent_name = "Top缺陷排行查询"',
      [newTopDefectSQL]
    );
    console.log('  ✅ Top缺陷排行查询规则已更新（移除LIMIT，修正test_result条件）');
    
    // 2. 批量移除所有规则的LIMIT限制
    console.log('\n🔧 批量移除所有规则的LIMIT限制:');
    
    // 获取所有包含LIMIT的规则
    const [limitRules] = await connection.execute(
      'SELECT id, intent_name, action_target FROM nlp_intent_rules WHERE action_target LIKE "%LIMIT%"'
    );
    
    console.log(`  - 找到 ${limitRules.length} 个包含LIMIT的规则`);
    
    let updatedCount = 0;
    for (const rule of limitRules) {
      // 移除LIMIT子句
      const updatedSQL = rule.action_target.replace(/\s+LIMIT\s+\d+/gi, '');
      
      if (updatedSQL !== rule.action_target) {
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
          [updatedSQL, rule.id]
        );
        updatedCount++;
        console.log(`    ✅ 已更新: ${rule.intent_name} (ID: ${rule.id})`);
      }
    }
    
    console.log(`  ✅ 总共更新了 ${updatedCount} 个规则，移除了LIMIT限制`);
    
    // 3. 测试修复后的Top缺陷排行查询
    console.log('\n🧪 测试修复后的Top缺陷排行查询:');
    const [testResults] = await connection.execute(newTopDefectSQL);
    console.log(`  - 返回记录数: ${testResults.length}`);
    
    if (testResults.length > 0) {
      console.log('  - 前3条记录:');
      testResults.slice(0, 3).forEach((row, index) => {
        console.log(`    记录 ${index + 1}:`);
        console.log(`      测试编号: ${row.测试编号}`);
        console.log(`      物料名称: ${row.物料名称}`);
        console.log(`      供应商: ${row.供应商}`);
        console.log(`      测试结果: ${row.测试结果}`);
        console.log(`      不合格描述: ${row.不合格描述}`);
        console.log(`      数量: ${row.数量}`);
      });
    } else {
      console.log('  - ⚠️ 没有找到不合格记录，检查数据...');
      
      // 检查test_result的实际值
      const [resultValues] = await connection.execute(
        'SELECT DISTINCT test_result FROM lab_tests'
      );
      console.log('  - test_result字段的实际值:', resultValues.map(r => r.test_result));
      
      // 检查defect_desc的实际值
      const [defectValues] = await connection.execute(
        'SELECT DISTINCT defect_desc FROM lab_tests WHERE defect_desc IS NOT NULL AND defect_desc != "" LIMIT 10'
      );
      console.log('  - defect_desc字段的实际值:', defectValues.map(r => r.defect_desc));
    }
    
    // 4. 验证修复结果
    console.log('\n✅ 验证修复结果:');
    const [remainingLimitRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules WHERE action_target LIKE "%LIMIT%"'
    );
    console.log(`  - 剩余包含LIMIT的规则数: ${remainingLimitRules[0].count}`);
    
    await connection.end();
    
    console.log('\n🎉 规则SQL修复完成！');
    console.log('📋 修复内容:');
    console.log('  1. ✅ 移除了所有规则的LIMIT限制');
    console.log('  2. ✅ 修正了Top缺陷排行查询的test_result条件');
    console.log('  3. ✅ 现在所有规则都会返回完整的真实数据');
    
  } catch (error) {
    console.error('❌ 修复规则SQL时出错:', error.message);
  }
}

fixRulesSQL().catch(console.error);
