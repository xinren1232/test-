import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRulesWithExactPageFields() {
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
    
    // 2. 修复库存相关规则 - 库存页面: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
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
      '库存状态查询_风险冻结物料',
      '电池库存查询',
      '结构件类库存查询',
      '光学类库存查询',
      '充电类库存查询',
      '声学类库存查询',
      '包装类库存查询'
    ];
    
    for (const ruleName of inventoryRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [inventorySQL, ruleName]
      );
      console.log(`  ✅ 已修复库存规则: ${ruleName}`);
    }
    
    // 3. 修复上线跟踪相关规则 - 上线页面: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
    console.log('\n🔧 修复上线跟踪相关规则...');
    const onlineTrackingSQL = `
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
ORDER BY online_date DESC
LIMIT 20`.trim();
    
    const onlineRules = [
      '在线跟踪查询',
      '物料上线情况查询',
      '供应商上线情况查询',
      '物料上线跟踪查询_优化',
      '批次上线情况查询_优化',
      '结构件类上线情况查询',
      '光学类上线情况查询',
      '充电类上线情况查询',
      '声学类上线情况查询',
      '包装类上线情况查询'
    ];
    
    for (const ruleName of onlineRules) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [onlineTrackingSQL, ruleName]
      );
      console.log(`  ✅ 已修复上线跟踪规则: ${ruleName}`);
    }
    
    // 4. 修复带参数的批次上线情况查询
    console.log('\n🔧 修复带参数的批次上线情况查询...');
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
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [batchOnlineSQL, '批次上线情况查询']
    );
    console.log('  ✅ 已修复带参数的批次上线情况查询规则');
    
    console.log('\n✅ 第一部分修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixRulesWithExactPageFields();
