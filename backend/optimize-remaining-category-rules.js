import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function optimizeRemainingCategoryRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 优化剩余物料大类和对比类查询规则...\n');
    
    // 定义物料大类的筛选条件
    const materialCategories = {
      '充电类': ['电池', '充电器', '充电线'],
      '声学类': ['扬声器', '麦克风', '听筒'],
      '包装类': ['包装盒', '说明书', '保护膜']
    };
    
    // 3. 优化充电类规则
    console.log('=== 3. 优化充电类规则 ===');
    const chargingMaterials = materialCategories['充电类'];
    const chargingCondition = chargingMaterials.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
    
    // 充电类库存查询
    const chargingInventorySQL = `
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
WHERE (${chargingCondition})
ORDER BY inbound_time DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [chargingInventorySQL, '充电类库存查询']
    );
    console.log('  ✅ 已优化充电类库存查询');
    
    // 充电类上线情况查询
    const chargingOnlineSQL = `
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
WHERE (${chargingCondition})
ORDER BY online_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [chargingOnlineSQL, '充电类上线情况查询']
    );
    console.log('  ✅ 已优化充电类上线情况查询');
    
    // 充电类测试情况查询
    const chargingTestSQL = `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, 'Project-Test') as 项目,
  COALESCE(baseline_id, 'Baseline-V1.0') as 基线,
  material_code as 物料编码,
  100 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
WHERE (${chargingCondition})
ORDER BY test_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [chargingTestSQL, '充电类测试情况查询']
    );
    console.log('  ✅ 已优化充电类测试情况查询');
    
    // 4. 优化声学类规则
    console.log('\n=== 4. 优化声学类规则 ===');
    const acousticMaterials = materialCategories['声学类'];
    const acousticCondition = acousticMaterials.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
    
    // 声学类库存查询
    const acousticInventorySQL = `
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
WHERE (${acousticCondition})
ORDER BY inbound_time DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [acousticInventorySQL, '声学类库存查询']
    );
    console.log('  ✅ 已优化声学类库存查询');
    
    // 声学类上线情况查询
    const acousticOnlineSQL = `
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
WHERE (${acousticCondition})
ORDER BY online_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [acousticOnlineSQL, '声学类上线情况查询']
    );
    console.log('  ✅ 已优化声学类上线情况查询');
    
    // 声学类测试情况查询
    const acousticTestSQL = `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, 'Project-Test') as 项目,
  COALESCE(baseline_id, 'Baseline-V1.0') as 基线,
  material_code as 物料编码,
  100 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
WHERE (${acousticCondition})
ORDER BY test_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [acousticTestSQL, '声学类测试情况查询']
    );
    console.log('  ✅ 已优化声学类测试情况查询');
    
    // 5. 优化包装类规则
    console.log('\n=== 5. 优化包装类规则 ===');
    const packagingMaterials = materialCategories['包装类'];
    const packagingCondition = packagingMaterials.map(m => `material_name LIKE '%${m}%'`).join(' OR ');
    
    // 包装类库存查询
    const packagingInventorySQL = `
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
WHERE (${packagingCondition})
ORDER BY inbound_time DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [packagingInventorySQL, '包装类库存查询']
    );
    console.log('  ✅ 已优化包装类库存查询');
    
    // 包装类上线情况查询
    const packagingOnlineSQL = `
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
WHERE (${packagingCondition})
ORDER BY online_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [packagingOnlineSQL, '包装类上线情况查询']
    );
    console.log('  ✅ 已优化包装类上线情况查询');
    
    // 包装类测试情况查询
    const packagingTestSQL = `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, 'Project-Test') as 项目,
  COALESCE(baseline_id, 'Baseline-V1.0') as 基线,
  material_code as 物料编码,
  100 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
WHERE (${packagingCondition})
ORDER BY test_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [packagingTestSQL, '包装类测试情况查询']
    );
    console.log('  ✅ 已优化包装类测试情况查询');
    
    console.log('\n✅ 第三阶段：剩余物料大类查询规则优化完成！');
    
  } catch (error) {
    console.error('❌ 优化过程中出错:', error);
  } finally {
    await connection.end();
  }
}

optimizeRemainingCategoryRules();
