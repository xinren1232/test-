import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalFixRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 最终修正规则...');
    
    // 获取所有规则
    const [rules] = await connection.execute('SELECT * FROM nlp_intent_rules ORDER BY intent_name');
    
    console.log(`\n开始最终修正 ${rules.length} 条规则：\n`);
    
    let fixedCount = 0;
    
    for (const rule of rules) {
      console.log(`📋 处理规则: ${rule.intent_name}`);
      
      let originalSQL = rule.action_target;
      let fixedSQL = originalSQL;
      let needsUpdate = false;
      
      // 特殊处理具体规则
      if (rule.intent_name === '供应商物料查询') {
        fixedSQL = `
SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_name as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  notes as 备注
FROM inventory
WHERE supplier_name = COALESCE(?, '')
ORDER BY inbound_time DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '物料库存信息查询') {
        fixedSQL = `
SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_name as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  notes as 备注
FROM inventory
WHERE material_name = COALESCE(?, '')
ORDER BY inbound_time DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '在线跟踪查询') {
        fixedSQL = `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  line as 生产线,
  project as 项目,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
  factory as 工厂,
  workshop as 车间,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 异常次数
FROM online_tracking
WHERE material_name = COALESCE(?, '')
ORDER BY online_date DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '在线跟踪相关查询') {
        fixedSQL = `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  line as 生产线,
  project as 项目,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
  factory as 工厂,
  workshop as 车间,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 异常次数
FROM online_tracking
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY online_date DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '本周入库统计') {
        fixedSQL = `
SELECT
  material_name as 物料类型,
  COUNT(*) as 入库批次,
  SUM(quantity) as 总数量,
  COUNT(DISTINCT supplier_name) as 供应商数量,
  DATE_FORMAT(MIN(inbound_time), '%Y-%m-%d') as 最早入库,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最晚入库
FROM inventory
WHERE YEARWEEK(inbound_time) = YEARWEEK(NOW())
GROUP BY material_name
ORDER BY 总数量 DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '本月测试汇总') {
        fixedSQL = `
SELECT
  project_id as 项目,
  baseline_id as 基线,
  COUNT(*) as 测试次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率
FROM lab_tests
WHERE YEAR(test_date) = YEAR(NOW()) AND MONTH(test_date) = MONTH(NOW())
GROUP BY project_id, baseline_id
ORDER BY 测试次数 DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '测试NG情况查询') {
        fixedSQL = `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_name as 物料类型,
  supplier_name as 供应商,
  defect_desc as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
WHERE test_result = 'FAIL'
ORDER BY test_date DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '基线测试情况查询') {
        fixedSQL = `
SELECT
  baseline_id as 基线,
  COUNT(*) as 总测试次数,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 通过次数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 失败次数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT project_id) as 关联项目数
FROM lab_tests
GROUP BY baseline_id
ORDER BY 总测试次数 DESC`.trim();
        needsUpdate = true;
      }
      
      if (rule.intent_name === '基线物料不良查询') {
        fixedSQL = `
SELECT
  l.baseline_id as 基线,
  l.material_name as 物料名称,
  l.supplier_name as 供应商,
  COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) as 测试失败次数,
  COUNT(*) as 总测试次数,
  ROUND(COUNT(CASE WHEN l.test_result = 'FAIL' THEN 1 END) * 100.0 / COUNT(*), 2) as 失败率
FROM lab_tests l
GROUP BY l.baseline_id, l.material_name, l.supplier_name
HAVING 失败率 > 0
ORDER BY 失败率 DESC
LIMIT 10`.trim();
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        console.log(`🔧 修正字段问题`);
        
        // 更新数据库
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
          [fixedSQL, rule.id]
        );
        
        fixedCount++;
        console.log(`✅ 已更新`);
      } else {
        console.log(`✅ 无需修正`);
      }
      
      console.log('---\n');
    }
    
    console.log(`\n🎉 最终修正完成！共修正了 ${fixedCount} 条规则`);
    
  } catch (error) {
    console.error('❌ 修正失败:', error);
  } finally {
    await connection.end();
  }
}

finalFixRules();
