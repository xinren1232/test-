import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixAllRulesWithRealPageFields() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔧 根据实际页面字段设计修复所有规则...\n');

    // 1. 检查实际表结构
    console.log('=== 检查实际表结构 ===');
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    const [onlineFields] = await connection.execute('DESCRIBE online_tracking');
    const [labFields] = await connection.execute('DESCRIBE lab_tests');

    console.log('inventory表字段:', inventoryFields.map(f => f.Field).join(', '));
    console.log('online_tracking表字段:', onlineFields.map(f => f.Field).join(', '));
    console.log('lab_tests表字段:', labFields.map(f => f.Field).join(', '));

    // 2. 修复库存相关规则 - 对应库存页面字段
    console.log('\n🔧 修复库存相关规则...');
    const inventorySQL = `
SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
ORDER BY inbound_time DESC
LIMIT 20`.trim();
    
    const inventoryRules = [
      '物料库存查询',
      '物料库存信息查询',
      '供应商库存查询',
      '库存状态查询',
      '风险库存查询',
      '物料库存信息查询_优化',
      '供应商库存查询_优化',
      '风险状态物料查询',
      '库存状态查询_风险冻结物料'
    ];
    
    for (const ruleName of inventoryRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [inventorySQL, ruleName]
      );
      console.log(`  ✅ 已修复库存规则: ${ruleName}`);
    }
    
    // 3. 修复上线跟踪相关规则 - 对应上线页面字段
    console.log('\n🔧 修复上线跟踪相关规则...');
    const onlineTrackingSQL = `
SELECT
  factory as 工厂,
  baseline_id as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
ORDER BY online_date DESC
LIMIT 20`.trim();
    
    const onlineRules = [
      '在线跟踪查询',
      '物料上线情况查询',
      '批次上线情况查询',
      '供应商上线情况查询',
      '物料上线跟踪查询_优化',
      '批次上线情况查询_优化'
    ];
    
    for (const ruleName of onlineRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [onlineTrackingSQL, ruleName]
      );
      console.log(`  ✅ 已修复上线跟踪规则: ${ruleName}`);
    }
    
    // 4. 修复测试相关规则 - 对应测试页面字段
    console.log('\n🔧 修复测试相关规则...');
    const labTestSQL = `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_code as 物料编码,
  quantity as 数量,
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
      'NG测试结果查询_优化'
    ];
    
    for (const ruleName of testRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [labTestSQL, ruleName]
      );
      console.log(`  ✅ 已修复测试规则: ${ruleName}`);
    }
    
    // 5. 修复批次管理相关规则 - 对应批次管理页面字段
    console.log('\n🔧 修复批次管理相关规则...');
    const batchManagementSQL = `
SELECT
  batch_code as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期,
  '无' as 产线异常,
  '无' as 测试异常,
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
    
    // 6. 特别修复带参数的规则
    console.log('\n🔧 修复带参数的规则...');
    
    // 批次上线情况查询（带批次号参数）
    const batchOnlineSQL = `
SELECT
  factory as 工厂,
  baseline_id as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  COALESCE(defect_rate, 0) as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY online_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [batchOnlineSQL, '批次上线情况查询']
    );
    console.log('  ✅ 已修复带参数的批次上线情况查询规则');
    
    // 7. 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    const [updatedRules] = await connection.execute(`
      SELECT intent_name, 
             SUBSTRING(action_target, 1, 100) as sql_preview
      FROM nlp_intent_rules 
      WHERE intent_name IN (
        '批次上线情况查询', '物料库存查询', 'NG测试结果查询', '批次信息查询'
      )
    `);
    
    updatedRules.forEach(rule => {
      console.log(`- ${rule.intent_name}:`);
      console.log(`  SQL: ${rule.sql_preview}...`);
    });
    
    console.log('\n✅ 所有规则已根据实际页面字段设计修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixAllRulesWithRealPageFields();
