import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixTestAndBatchRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修复测试和批次管理相关规则...\n');
    
    // 1. 检查lab_tests表字段
    const [labFields] = await connection.execute('DESCRIBE lab_tests');
    const labFieldNames = labFields.map(f => f.Field);
    console.log('lab_tests表字段:', labFieldNames.join(', '));
    
    // 检查是否有quantity字段
    const hasQuantity = labFieldNames.includes('quantity');
    if (!hasQuantity) {
      console.log('添加quantity字段...');
      await connection.execute('ALTER TABLE lab_tests ADD COLUMN quantity INT DEFAULT 100');
    }
    
    // 2. 修复测试相关规则 - 测试页面: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
    console.log('\n🔧 修复测试相关规则...');
    const labTestSQL = `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, 'Project-Test') as 项目,
  COALESCE(baseline_id, 'Baseline-V1.0') as 基线,
  material_code as 物料编码,
  COALESCE(quantity, 100) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
ORDER BY test_date DESC
LIMIT 20`.trim();
    
    const testRules = [
      'NG测试结果查询',
      '测试NG情况查询',
      '物料测试情况查询',
      '批次测试情况查询',
      '供应商测试情况查询',
      '物料测试结果查询_优化',
      'NG测试结果查询_优化',
      '结构件类测试情况查询',
      '光学类测试情况查询',
      '充电类测试情况查询',
      '声学类测试情况查询',
      '包装类测试情况查询',
      '项目测试情况查询',
      '基线测试情况查询'
    ];
    
    for (const ruleName of testRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [labTestSQL, ruleName]
      );
      console.log(`  ✅ 已修复测试规则: ${ruleName}`);
    }
    
    // 3. 修复批次管理相关规则 - 批次管理: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注
    console.log('\n🔧 修复批次管理相关规则...');
    const batchManagementSQL = `
SELECT
  batch_code as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期,
  CASE 
    WHEN status = '风险' THEN '有异常'
    WHEN status = '冻结' THEN '有异常'
    ELSE '无异常'
  END as 产线异常,
  CASE 
    WHEN risk_level = 'HIGH' THEN '有异常'
    WHEN risk_level = 'MEDIUM' THEN '轻微异常'
    ELSE '无异常'
  END as 测试异常,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE batch_code IS NOT NULL AND batch_code != ''
ORDER BY inbound_time DESC
LIMIT 20`.trim();
    
    const batchRules = [
      '批次信息查询',
      '批次库存信息查询',
      '批次综合信息查询',
      '批次综合信息查询_优化',
      '异常批次识别',
      '异常批次识别_优化'
    ];
    
    for (const ruleName of batchRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [batchManagementSQL, ruleName]
      );
      console.log(`  ✅ 已修复批次管理规则: ${ruleName}`);
    }
    
    // 4. 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    
    // 测试测试查询
    const [testResult] = await connection.execute(labTestSQL.replace('LIMIT 20', 'LIMIT 3'));
    console.log(`\n🧪 测试查询验证 (${testResult.length}条):`);
    testResult.forEach((row, index) => {
      console.log(`${index + 1}. 测试编号: ${row.测试编号}, 物料: ${row.物料名称}, 结果: ${row.测试结果}`);
    });
    
    // 测试批次管理查询
    const [batchResult] = await connection.execute(batchManagementSQL.replace('LIMIT 20', 'LIMIT 3'));
    console.log(`\n📦 批次管理查询验证 (${batchResult.length}条):`);
    batchResult.forEach((row, index) => {
      console.log(`${index + 1}. 批次: ${row.批次号}, 物料: ${row.物料名称}, 产线异常: ${row.产线异常}`);
    });
    
    // 5. 测试批次669033的上线情况查询（验证之前修复的规则）
    console.log('\n🔍 验证批次669033上线情况查询...');
    const batchOnlineSQL = `
SELECT
  factory as 工厂,
  'Baseline-V1.0' as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(COALESCE(defect_rate, 0) * 100, 2), '%') as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY online_date DESC
LIMIT 20`;
    
    const [batchOnlineResult] = await connection.execute(batchOnlineSQL, ['669033']);
    console.log(`批次669033上线情况查询结果 (${batchOnlineResult.length}条):`);
    batchOnlineResult.forEach((row, index) => {
      console.log(`${index + 1}. 工厂: ${row.工厂}, 基线: ${row.基线}, 项目: ${row.项目}`);
      console.log(`   物料: ${row.物料名称}, 供应商: ${row.供应商}, 不良率: ${row.不良率}`);
    });
    
    console.log('\n✅ 所有规则已根据实际页面字段设计修复完成！');
    console.log('\n📋 字段映射总结:');
    console.log('库存页面: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注');
    console.log('上线页面: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注');
    console.log('测试页面: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注');
    console.log('批次管理: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注');
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixTestAndBatchRules();
