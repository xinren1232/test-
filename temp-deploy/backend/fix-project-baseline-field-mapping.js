/**
 * 修复项目和基线字段映射问题
 * 
 * 问题分析：
 * - 前端"项目"字段当前显示的是material_code（物料编码），应该显示有意义的项目名称
 * - 前端"基线"字段当前显示的是batch_code（批次号），这个映射是正确的
 * 
 * 解决方案：
 * - 项目字段：使用test_item或者根据material_name生成项目名称
 * - 基线字段：继续使用batch_code，但格式化显示
 */

import mysql from 'mysql2/promise';

async function fixFieldMapping() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔧 开始修复项目和基线字段映射...');

    // 1. 检查当前数据情况
    console.log('\n📊 分析当前数据结构...');
    
    const [materialTypes] = await connection.execute(`
      SELECT DISTINCT material_name, COUNT(*) as count 
      FROM lab_tests 
      GROUP BY material_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log('物料类型分布:');
    console.table(materialTypes);

    // 2. 更新所有测试相关的NLP规则
    console.log('\n🔄 更新NLP规则的字段映射...');

    // 获取所有测试相关的规则
    const [testRules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE (intent_name LIKE '%测试%' OR intent_name LIKE '%NG%' OR intent_name LIKE '%检测%')
      AND action_target LIKE '%lab_tests%'
    `);

    console.log(`找到 ${testRules.length} 条需要修复的规则`);

    for (const rule of testRules) {
      console.log(`\n修复规则: ${rule.intent_name}`);
      
      // 创建正确的字段映射SQL
      const fixedSQL = `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  CASE 
    WHEN material_name LIKE '%电容%' THEN '电容器项目'
    WHEN material_name LIKE '%电芯%' THEN '电芯项目'
    WHEN material_name LIKE '%充电器%' THEN '充电器项目'
    WHEN material_name LIKE '%摄像头%' THEN '摄像头项目'
    WHEN material_name LIKE '%显示屏%' THEN '显示屏项目'
    WHEN material_name LIKE '%装饰件%' THEN '装饰件项目'
    WHEN material_name LIKE '%包装%' THEN '包装项目'
    ELSE CONCAT(material_name, '项目')
  END as 项目,
  CONCAT('批次-', batch_code) as 基线,
  material_name as 物料类型,
  CASE 
    WHEN test_result = 'PASS' THEN '1次OK'
    WHEN test_result = 'FAIL' THEN '1次NG'
    ELSE '1次'
  END as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  CASE 
    WHEN test_result = 'PASS' THEN '合格'
    WHEN test_result = 'FAIL' THEN COALESCE(defect_desc, '不合格-无具体描述')
    ELSE test_result
  END as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE 1=1`;

      // 根据规则类型添加特定条件
      let finalSQL = fixedSQL;
      if (rule.intent_name.includes('NG') || rule.intent_name.includes('不合格')) {
        finalSQL += ` AND test_result = 'FAIL'`;
      } else if (rule.intent_name.includes('OK') || rule.intent_name.includes('合格')) {
        finalSQL += ` AND test_result = 'PASS'`;
      }
      
      finalSQL += ` ORDER BY test_date DESC LIMIT 10`;

      // 更新规则
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, 
            description = CONCAT(description, ' [字段映射已修复]'),
            updated_at = NOW()
        WHERE id = ?
      `, [finalSQL, rule.id]);

      console.log(`✅ 已修复规则: ${rule.intent_name}`);
    }

    // 3. 验证修复结果
    console.log('\n🧪 验证修复结果...');
    
    const testQuery = `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  CASE 
    WHEN material_name LIKE '%电容%' THEN '电容器项目'
    WHEN material_name LIKE '%电芯%' THEN '电芯项目'
    WHEN material_name LIKE '%充电器%' THEN '充电器项目'
    WHEN material_name LIKE '%摄像头%' THEN '摄像头项目'
    WHEN material_name LIKE '%显示屏%' THEN '显示屏项目'
    WHEN material_name LIKE '%装饰件%' THEN '装饰件项目'
    WHEN material_name LIKE '%包装%' THEN '包装项目'
    ELSE CONCAT(material_name, '项目')
  END as 项目,
  CONCAT('批次-', batch_code) as 基线,
  material_name as 物料类型,
  CASE 
    WHEN test_result = 'PASS' THEN '1次OK'
    WHEN test_result = 'FAIL' THEN '1次NG'
    ELSE '1次'
  END as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  CASE 
    WHEN test_result = 'PASS' THEN '合格'
    WHEN test_result = 'FAIL' THEN COALESCE(defect_desc, '不合格-无具体描述')
    ELSE test_result
  END as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'FAIL'
ORDER BY test_date DESC 
LIMIT 5`;

    const [testResult] = await connection.execute(testQuery);
    
    console.log('\n修复后的数据预览:');
    console.table(testResult);

    console.log('\n✅ 字段映射修复完成！');
    console.log('\n📋 修复总结:');
    console.log('- 项目字段：根据物料名称生成有意义的项目名称');
    console.log('- 基线字段：格式化显示批次号（批次-XXXXXX）');
    console.log('- 数量字段：显示OK/NG次数而非固定数量');
    console.log('- 不合格描述：根据测试结果显示合格/不合格信息');

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    await connection.end();
  }
}

// 执行修复
fixFieldMapping().catch(console.error);
