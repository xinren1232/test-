import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixSQLIssues() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修复SQL问题...\n');
    
    // 修复批次综合信息查询的DISTINCT问题
    const fixedBatchQuery = `
SELECT 
  i.batch_code as 批次号,
  i.material_code as 物料编码,
  i.material_name as 物料名称,
  i.supplier_name as 供应商,
  i.quantity as 数量,
  DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 入库日期,
  COALESCE(ot.exception_count, 0) as 产线异常,
  CASE 
    WHEN lt.test_result = 'FAIL' THEN '有异常'
    WHEN lt.test_result = 'PASS' THEN '正常'
    ELSE '未测试'
  END as 测试异常,
  COALESCE(i.notes, '') as 备注
FROM inventory i
LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
LEFT JOIN lab_tests lt ON i.batch_code = lt.batch_code
WHERE i.batch_code LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR i.material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
   OR i.supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY i.inbound_time DESC
LIMIT 10`;

    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '批次综合信息查询_优化'
    `, [fixedBatchQuery]);
    
    console.log('✅ 修复批次综合信息查询SQL');
    
    // 修复异常批次识别的DISTINCT问题
    const fixedAnomalyQuery = `
SELECT 
  i.batch_code as 批次号,
  i.material_code as 物料编码,
  i.material_name as 物料名称,
  i.supplier_name as 供应商,
  i.quantity as 数量,
  DATE_FORMAT(i.inbound_time, '%Y-%m-%d') as 入库日期,
  COALESCE(ot.exception_count, 0) as 产线异常,
  CASE 
    WHEN lt.test_result = 'FAIL' THEN CONCAT('测试异常: ', COALESCE(lt.defect_desc, '未知'))
    ELSE '正常'
  END as 测试异常,
  CONCAT('产线异常数: ', COALESCE(ot.exception_count, 0), 
         ', 测试状态: ', COALESCE(lt.test_result, '未测试')) as 备注
FROM inventory i
LEFT JOIN online_tracking ot ON i.batch_code = ot.batch_code
LEFT JOIN lab_tests lt ON i.batch_code = lt.batch_code
WHERE ot.exception_count > 0 OR lt.test_result = 'FAIL'
ORDER BY COALESCE(ot.exception_count, 0) DESC, i.inbound_time DESC
LIMIT 10`;

    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?
      WHERE intent_name = '异常批次识别_优化'
    `, [fixedAnomalyQuery]);
    
    console.log('✅ 修复异常批次识别SQL');
    
    // 验证修复结果
    console.log('\n🧪 验证修复结果...');
    
    const [batchRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['批次综合信息查询_优化']
    );
    
    const [anomalyRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
      ['异常批次识别_优化']
    );
    
    // 测试修复后的SQL
    try {
      const testSql1 = batchRule[0].action_target.replace(/COALESCE\(\?, ''\)/g, "'235277'");
      const [result1] = await connection.execute(testSql1);
      console.log(`✅ 批次综合信息查询测试成功，返回 ${result1.length} 条记录`);
    } catch (error) {
      console.log(`❌ 批次综合信息查询测试失败: ${error.message}`);
    }
    
    try {
      const testSql2 = anomalyRule[0].action_target;
      const [result2] = await connection.execute(testSql2);
      console.log(`✅ 异常批次识别测试成功，返回 ${result2.length} 条记录`);
    } catch (error) {
      console.log(`❌ 异常批次识别测试失败: ${error.message}`);
    }
    
    console.log('\n✅ SQL问题修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await connection.end();
  }
}

fixSQLIssues().catch(console.error);
