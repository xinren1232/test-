import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 手动修复的完整SQL
const MANUAL_FIXES = {
  '物料测试情况查询': `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE material_name LIKE CONCAT('%', ?, '%')
   OR supplier_name LIKE CONCAT('%', ?, '%')
ORDER BY test_date DESC
LIMIT 10`,

  '本月测试汇总': `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY test_date DESC
LIMIT 20`,

  '物料测试Top不良': `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COUNT(*) OVER (PARTITION BY material_name, supplier_name) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(conclusion, '') as 备注
FROM lab_tests 
WHERE test_result = 'FAIL'
ORDER BY test_date DESC
LIMIT 20`
};

async function manualFixFinalRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 手动修复最后的规则问题...\n');
    
    for (const [ruleName, fixedSQL] of Object.entries(MANUAL_FIXES)) {
      try {
        // 更新规则
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE intent_name = ? AND status = 'active'
        `, [fixedSQL, ruleName]);
        
        console.log(`✅ 手动修复规则: ${ruleName}`);
        
        // 测试修复后的SQL
        let testSQL = fixedSQL;
        testSQL = testSQL.replace(/\?/g, "'测试值'");
        testSQL = testSQL.replace(/COALESCE\('测试值', ''\)/g, "COALESCE('测试值', '')");
        
        const [results] = await connection.execute(testSQL);
        console.log(`   测试成功，返回 ${results.length} 条记录`);
        
      } catch (error) {
        console.log(`❌ 修复失败: ${ruleName} - ${error.message}`);
      }
    }
    
    console.log('\n🎯 最终验证所有规则...');
    
    // 最终批量测试
    const [allRules] = await connection.execute(
      'SELECT id, intent_name, action_target FROM nlp_intent_rules WHERE status = "active"'
    );
    
    let successCount = 0;
    let failCount = 0;
    
    for (const rule of allRules) {
      try {
        let testSQL = rule.action_target;
        testSQL = testSQL.replace(/\?/g, "'测试值'");
        testSQL = testSQL.replace(/COALESCE\('测试值', ''\)/g, "COALESCE('测试值', '')");
        
        const [results] = await connection.execute(testSQL);
        successCount++;
      } catch (error) {
        failCount++;
        console.log(`❌ 规则测试失败: ${rule.intent_name} - ${error.message}`);
      }
    }
    
    console.log(`\n📊 最终测试结果:`);
    console.log(`总规则数: ${allRules.length}`);
    console.log(`成功: ${successCount} (${((successCount/allRules.length)*100).toFixed(1)}%)`);
    console.log(`失败: ${failCount} (${((failCount/allRules.length)*100).toFixed(1)}%)`);
    
    if (failCount === 0) {
      console.log('\n🎉 所有规则优化完成！规则库质量100%！');
    }
    
  } catch (error) {
    console.error('❌ 修复过程失败:', error);
  } finally {
    await connection.end();
  }
}

manualFixFinalRules().catch(console.error);
