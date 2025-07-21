import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function optimizeComparisonRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 优化对比类查询规则...\n');
    
    // 6. 优化对比类查询规则
    console.log('=== 6. 优化对比类查询规则 ===');
    
    // 供应商对比分析 - 显示2个供应商的详细数据对比
    const supplierComparisonSQL = `
SELECT
  '供应商对比' as 分析类型,
  supplier_name as 供应商,
  COUNT(*) as 库存记录数,
  SUM(quantity) as 总库存量,
  COUNT(CASE WHEN status = '正常' THEN 1 END) as 正常库存,
  COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险库存,
  COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结库存,
  ROUND(AVG(quantity), 2) as 平均库存量,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最新入库时间,
  GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 主要物料
FROM inventory
WHERE supplier_name IN (
  SELECT DISTINCT supplier_name 
  FROM inventory 
  ORDER BY supplier_name 
  LIMIT 2
)
GROUP BY supplier_name
ORDER BY 总库存量 DESC`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [supplierComparisonSQL, '供应商对比分析']
    );
    console.log('  ✅ 已优化供应商对比分析');
    
    // 物料对比分析 - 显示2个物料的详细数据对比
    const materialComparisonSQL = `
SELECT
  '物料对比' as 分析类型,
  material_name as 物料名称,
  COUNT(*) as 库存记录数,
  SUM(quantity) as 总库存量,
  COUNT(CASE WHEN status = '正常' THEN 1 END) as 正常库存,
  COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险库存,
  COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结库存,
  ROUND(AVG(quantity), 2) as 平均库存量,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最新入库时间,
  GROUP_CONCAT(DISTINCT supplier_name ORDER BY supplier_name SEPARATOR ', ') as 主要供应商
FROM inventory
WHERE material_name IN (
  SELECT DISTINCT material_name 
  FROM inventory 
  ORDER BY material_name 
  LIMIT 2
)
GROUP BY material_name
ORDER BY 总库存量 DESC`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [materialComparisonSQL, '物料对比分析']
    );
    console.log('  ✅ 已优化物料对比分析');
    
    // 物料大类别质量对比 - 显示不同大类的质量对比
    const categoryQualityComparisonSQL = `
SELECT
  '大类质量对比' as 分析类型,
  CASE 
    WHEN material_name LIKE '%电池%' OR material_name LIKE '%充电%' THEN '充电类'
    WHEN material_name LIKE '%显示屏%' OR material_name LIKE '%摄像头%' THEN '光学类'
    WHEN material_name LIKE '%中框%' OR material_name LIKE '%电池盖%' OR material_name LIKE '%卡托%' THEN '结构件'
    WHEN material_name LIKE '%包装%' THEN '包装类'
    ELSE '其他类'
  END as 物料大类,
  COUNT(*) as 测试记录数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 合格数量,
  COUNT(CASE WHEN test_result = 'NG' THEN 1 END) as 不合格数量,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 合格率,
  GROUP_CONCAT(DISTINCT defect_desc ORDER BY defect_desc SEPARATOR ', ') as 主要缺陷
FROM lab_tests
WHERE material_name IS NOT NULL
GROUP BY 物料大类
HAVING 物料大类 != '其他类'
ORDER BY 合格率 ASC`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [categoryQualityComparisonSQL, '物料大类别质量对比']
    );
    console.log('  ✅ 已优化物料大类别质量对比');
    
    // 7. 优化特殊查询规则
    console.log('\n=== 7. 优化特殊查询规则 ===');
    
    // 带参数的批次上线情况查询（保持之前的优化）
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
    console.log('  ✅ 已确认批次上线情况查询规则');
    
    // Top缺陷排行查询 - 按测试页面格式展示
    const topDefectSQL = `
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
WHERE test_result = 'NG' AND defect_desc IS NOT NULL AND defect_desc != ''
ORDER BY test_date DESC
LIMIT 20`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [topDefectSQL, 'Top缺陷排行查询']
    );
    console.log('  ✅ 已优化Top缺陷排行查询');
    
    // 供应商质量评级 - 基于测试结果的供应商评级
    const supplierQualityRatingSQL = `
SELECT
  '供应商质量评级' as 评级类型,
  supplier_name as 供应商,
  COUNT(*) as 测试总数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 合格数量,
  COUNT(CASE WHEN test_result = 'NG' THEN 1 END) as 不合格数量,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 合格率,
  CASE 
    WHEN COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*) >= 95 THEN 'A级'
    WHEN COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*) >= 90 THEN 'B级'
    WHEN COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*) >= 80 THEN 'C级'
    ELSE 'D级'
  END as 质量等级,
  GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 主要物料,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新测试日期
FROM lab_tests
WHERE supplier_name IS NOT NULL
GROUP BY supplier_name
ORDER BY 合格率 DESC`.trim();
    
    await connection.execute(
      'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
      [supplierQualityRatingSQL, '供应商质量评级']
    );
    console.log('  ✅ 已优化供应商质量评级');
    
    console.log('\n✅ 第四阶段：对比类查询规则优化完成！');
    
  } catch (error) {
    console.error('❌ 优化过程中出错:', error);
  } finally {
    await connection.end();
  }
}

optimizeComparisonRules();
