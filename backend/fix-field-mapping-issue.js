/**
 * 修正字段映射问题
 * 
 * 根据用户反馈：
 * - 项目字段应该显示物料编码（material_code），不是物料名称
 * - 基线字段应该显示批次号（batch_code），不需要"批次-"前缀
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
    console.log('🔧 修正字段映射问题...');

    // 删除之前的错误规则
    await connection.execute(`
      DELETE FROM nlp_intent_rules 
      WHERE intent_name IN ('测试结果查询', 'NG测试结果查询', 'OK测试结果查询')
    `);

    console.log('✅ 删除旧规则完成');

    // 创建修正后的规则
    const correctedRules = [
      {
        intent_name: '测试结果查询',
        description: '查询所有测试结果，正确显示项目(物料编码)/基线(批次号)等字段',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  material_code as 项目,
  batch_code as 基线,
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
    WHEN test_result = 'FAIL' THEN CONCAT('不合格: ', COALESCE(defect_desc, '检测异常'))
    ELSE test_result
  END as 不合格描述,
  '' as 备注
FROM lab_tests 
ORDER BY test_date DESC 
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(['测试结果', '检测结果', '测试查询', '检验结果']),
        synonyms: JSON.stringify({'测试': ['检测', '检验'], '结果': ['数据', '信息']}),
        example_query: '查询测试结果',
        priority: 10,
        status: 'active'
      },
      
      {
        intent_name: 'NG测试结果查询',
        description: '查询测试失败(NG)的记录，正确显示项目(物料编码)/基线(批次号)等字段',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  material_code as 项目,
  batch_code as 基线,
  material_name as 物料类型,
  '1次NG' as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT('不合格: ', COALESCE(defect_desc, '检测异常')) as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'FAIL'
ORDER BY test_date DESC 
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(['NG', '不合格', '失败', '测试失败', '不良品']),
        synonyms: JSON.stringify({'NG': ['不合格', '失败', 'FAIL'], '测试': ['检测', '检验']}),
        example_query: '查询NG测试结果',
        priority: 9,
        status: 'active'
      },
      
      {
        intent_name: 'OK测试结果查询',
        description: '查询测试通过(OK)的记录，正确显示项目(物料编码)/基线(批次号)等字段',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  material_code as 项目,
  batch_code as 基线,
  material_name as 物料类型,
  '1次OK' as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  '合格' as 不合格描述,
  '' as 备注
FROM lab_tests 
WHERE test_result = 'PASS'
ORDER BY test_date DESC 
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(['OK', '合格', '通过', '测试通过', '良品']),
        synonyms: JSON.stringify({'OK': ['合格', '通过', 'PASS'], '测试': ['检测', '检验']}),
        example_query: '查询OK测试结果',
        priority: 8,
        status: 'active'
      }
    ];

    // 插入修正后的规则
    for (const rule of correctedRules) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target, parameters,
          trigger_words, synonyms, example_query, priority, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        rule.intent_name, rule.description, rule.action_type, rule.action_target,
        rule.parameters, rule.trigger_words, rule.synonyms, rule.example_query,
        rule.priority, rule.status
      ]);
      
      console.log(`✅ 创建修正规则: ${rule.intent_name}`);
    }

    // 验证修正结果
    console.log('\n🧪 验证修正结果...');
    
    const testQuery = correctedRules[0].action_target;
    const [testResult] = await connection.execute(testQuery);
    
    console.log('\n修正后的测试结果预览:');
    console.table(testResult.slice(0, 3));

    console.log('\n✅ 字段映射修正完成！');
    console.log('\n📋 修正总结:');
    console.log('- ✅ 项目字段：现在显示物料编码 (material_code)');
    console.log('- ✅ 基线字段：现在显示批次号 (batch_code)，无前缀');
    console.log('- ✅ 物料类型：显示物料名称 (material_name)');
    console.log('- ✅ 数量字段：显示"1次OK"或"1次NG"');
    console.log('- ✅ 不合格描述：为FAIL记录显示具体缺陷信息');
    console.log('- ✅ 完全对齐前端显示需求');

  } catch (error) {
    console.error('❌ 修正过程中出现错误:', error);
  } finally {
    await connection.end();
  }
}

// 执行修正
fixFieldMapping().catch(console.error);
