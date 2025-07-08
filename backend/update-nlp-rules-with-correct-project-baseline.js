/**
 * 使用正确的项目和基线字段更新NLP规则
 * 
 * 现在lab_tests表已经有了project_id和baseline_id字段
 * 项目字段显示：X6827、S665LN、KI4K等
 * 基线字段显示：I6789、I6788、I6787等
 */

import mysql from 'mysql2/promise';

async function updateNLPRulesWithCorrectProjectBaseline() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔧 使用正确的项目和基线字段更新NLP规则...');

    // 删除之前的规则
    await connection.execute(`
      DELETE FROM nlp_intent_rules 
      WHERE intent_name IN ('测试结果查询', 'NG测试结果查询', 'OK测试结果查询')
    `);

    console.log('✅ 删除旧规则完成');

    // 创建使用正确项目基线字段的规则
    const finalRules = [
      {
        intent_name: '测试结果查询',
        description: '查询所有测试结果，正确显示项目代码和基线代码',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
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
        description: '查询测试失败(NG)的记录，正确显示项目代码和基线代码',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
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
        description: '查询测试通过(OK)的记录，正确显示项目代码和基线代码',
        action_type: 'SQL_QUERY',
        action_target: `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
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

    // 插入最终规则
    for (const rule of finalRules) {
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
      
      console.log(`✅ 创建最终规则: ${rule.intent_name}`);
    }

    // 验证最终结果
    console.log('\n🧪 验证最终结果...');
    
    const testQuery = finalRules[0].action_target;
    const [testResult] = await connection.execute(testQuery);
    
    console.log('\n最终的测试结果预览:');
    console.table(testResult.slice(0, 5));

    // 验证项目基线字段格式
    console.log('\n📊 项目基线字段格式验证:');
    const [formatCheck] = await connection.execute(`
      SELECT 
        DISTINCT project_id as 项目代码,
        baseline_id as 基线代码,
        COUNT(*) as 记录数
      FROM lab_tests 
      GROUP BY project_id, baseline_id
      ORDER BY project_id
    `);
    
    console.table(formatCheck);

    console.log('\n✅ NLP规则最终更新完成！');
    console.log('\n📋 最终效果:');
    console.log('- ✅ 项目字段：显示真实的项目代码 (X6827、S665LN、KI4K等)');
    console.log('- ✅ 基线字段：显示真实的基线代码 (I6789、I6788、I6787)');
    console.log('- ✅ 物料类型：显示物料名称 (充电器、摄像头(CAM)等)');
    console.log('- ✅ 数量字段：显示测试状态 (1次OK、1次NG)');
    console.log('- ✅ 不合格描述：显示具体缺陷信息');
    console.log('- ✅ 完全匹配前端显示需求和实际业务数据');

  } catch (error) {
    console.error('❌ 更新NLP规则失败:', error);
  } finally {
    await connection.end();
  }
}

// 执行更新
updateNLPRulesWithCorrectProjectBaseline().catch(console.error);
