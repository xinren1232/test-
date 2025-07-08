/**
 * 重新设计IQE质量工作角度的NLP规则
 * 从基础到复杂，涵盖更多质量管理场景
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function redesignIQERules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 重新设计IQE质量工作角度的NLP规则...\n');
    
    // 清空现有规则
    await connection.execute('DELETE FROM nlp_intent_rules');
    console.log('🗑️ 清空现有规则\n');
    
    // 重新设计的规则体系 - 从基础到复杂
    const iqeRules = [
      
      // ===== 基础规则 - 单场景单字段查询 =====
      
      // 1. 基础物料查询
      {
        intent_name: '物料基础信息查询',
        description: '查询物料的基础信息',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编号,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["物料信息", "物料查询", "物料基础", "物料详情"]),
        synonyms: JSON.stringify({"物料": ["材料", "零件"], "信息": ["详情", "数据"]}),
        example_query: '查询物料基础信息',
        priority: 10
      },
      
      // 2. 基础测试结果查询
      {
        intent_name: '测试结果基础查询',
        description: '查询测试结果的基础信息',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不良描述
FROM lab_tests 
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["测试结果", "检测结果", "测试查询", "检验结果"]),
        synonyms: JSON.stringify({"测试": ["检测", "检验"], "结果": ["数据", "信息"]}),
        example_query: '查询测试结果',
        priority: 10
      },
      
      // 3. 不良品查询
      {
        intent_name: '不良品查询',
        description: '查询测试不合格的物料',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '无描述') as 不良描述
FROM lab_tests 
WHERE test_result IN ('FAIL', 'NG')
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["不良品", "不合格", "NG", "失败", "不良"]),
        synonyms: JSON.stringify({"不良": ["不合格", "NG", "失败"], "品": ["物料", "产品"]}),
        example_query: '查询不良品',
        priority: 9
      },
      
      // 4. 合格品查询
      {
        intent_name: '合格品查询',
        description: '查询测试合格的物料',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不良描述
FROM lab_tests 
WHERE test_result IN ('PASS', 'OK')
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["合格品", "合格", "OK", "通过", "良品"]),
        synonyms: JSON.stringify({"合格": ["OK", "通过", "良品"], "品": ["物料", "产品"]}),
        example_query: '查询合格品',
        priority: 9
      },
      
      // 5. 风险物料查询
      {
        intent_name: '风险物料查询',
        description: '查询状态为风险的物料',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编号,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE status = '风险'
ORDER BY inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["风险物料", "风险", "危险物料", "问题物料"]),
        synonyms: JSON.stringify({"风险": ["危险", "问题"], "物料": ["材料", "零件"]}),
        example_query: '查询风险物料',
        priority: 9
      },
      
      // ===== 中级规则 - 单场景多字段查询 =====
      
      // 6. 供应商质量表现
      {
        intent_name: '供应商质量表现',
        description: '分析供应商的质量表现情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  supplier_name as 供应商,
  COUNT(DISTINCT material_code) as 物料种类,
  SUM(quantity) as 总数量,
  COUNT(DISTINCT batch_code) as 批次数量,
  (SELECT COUNT(*) FROM lab_tests WHERE lab_tests.supplier_name = inventory.supplier_name AND test_result IN ('PASS', 'OK')) as 合格次数,
  (SELECT COUNT(*) FROM lab_tests WHERE lab_tests.supplier_name = inventory.supplier_name AND test_result IN ('FAIL', 'NG')) as 不良次数,
  status as 状态,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最新入库时间,
  '' as 到期时间,
  '' as 备注
FROM inventory 
GROUP BY supplier_name, status
ORDER BY 不良次数 DESC, 合格次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["供应商质量", "供应商表现", "供应商分析", "厂商质量"]),
        synonyms: JSON.stringify({"供应商": ["厂商", "供货商"], "质量": ["品质", "表现"]}),
        example_query: '分析供应商质量表现',
        priority: 8
      },
      
      // 7. 批次质量分析
      {
        intent_name: '批次质量分析',
        description: '分析批次的质量情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  batch_code as 批次号,
  material_code as 物料编号,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  '0' as 产线异常,
  (SELECT COUNT(*) FROM lab_tests WHERE lab_tests.batch_code = inventory.batch_code AND test_result IN ('FAIL', 'NG')) as 测试异常,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY 测试异常 DESC, inbound_time DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["批次质量", "批次分析", "批次情况", "批号质量"]),
        synonyms: JSON.stringify({"批次": ["批号", "batch"], "质量": ["品质", "情况"]}),
        example_query: '分析批次质量',
        priority: 8
      },
      
      // ===== 高级规则 - 多场景多字段复杂查询 =====
      
      // 8. 特定物料的不良分析
      {
        intent_name: '物料不良分析',
        description: '分析特定物料的不良情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  material_code as 物料编号,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次,
  COUNT(*) as 不良次数,
  GROUP_CONCAT(DISTINCT defect_desc SEPARATOR '; ') as 不良描述,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新不良日期,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM lab_tests 
WHERE test_result IN ('FAIL', 'NG') AND defect_desc IS NOT NULL
GROUP BY material_code, material_name, supplier_name, batch_code
ORDER BY 不良次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["物料不良", "不良分析", "物料缺陷", "材料问题"]),
        synonyms: JSON.stringify({"物料": ["材料", "零件"], "不良": ["缺陷", "问题"]}),
        example_query: '分析物料不良情况',
        priority: 7
      },
      
      // 9. 供应商物料不良关联分析
      {
        intent_name: '供应商物料不良关联',
        description: '分析供应商与物料不良的关联情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  supplier_name as 供应商,
  material_name as 物料名称,
  COUNT(*) as 不良总次数,
  COUNT(DISTINCT batch_code) as 涉及批次,
  GROUP_CONCAT(DISTINCT defect_desc SEPARATOR '; ') as 主要不良,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests lt2 WHERE lt2.supplier_name = lab_tests.supplier_name AND lt2.material_name = lab_tests.material_name), 2) as 不良率,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新不良日期,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM lab_tests 
WHERE test_result IN ('FAIL', 'NG')
GROUP BY supplier_name, material_name
HAVING COUNT(*) >= 2
ORDER BY 不良率 DESC, 不良总次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["供应商物料不良", "供应商不良关联", "厂商物料问题", "供应商缺陷分析"]),
        synonyms: JSON.stringify({"供应商": ["厂商", "供货商"], "不良": ["缺陷", "问题"], "关联": ["关系", "分析"]}),
        example_query: '分析供应商物料不良关联',
        priority: 6
      },
      
      // 10. 质量趋势分析
      {
        intent_name: '质量趋势分析',
        description: '分析质量变化趋势',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COUNT(*) as 总测试数,
  SUM(CASE WHEN test_result IN ('PASS', 'OK') THEN 1 ELSE 0 END) as 合格数,
  SUM(CASE WHEN test_result IN ('FAIL', 'NG') THEN 1 ELSE 0 END) as 不良数,
  ROUND(SUM(CASE WHEN test_result IN ('PASS', 'OK') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 合格率,
  COUNT(DISTINCT material_code) as 涉及物料数,
  COUNT(DISTINCT supplier_name) as 涉及供应商数,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM lab_tests
WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE_FORMAT(test_date, '%Y-%m-%d')
ORDER BY 日期 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["质量趋势", "趋势分析", "质量变化", "品质趋势"]),
        synonyms: JSON.stringify({"质量": ["品质", "质量"], "趋势": ["变化", "走势"]}),
        example_query: '分析质量趋势',
        priority: 7
      },

      // ===== 更多复杂场景规则 =====

      // 11. 电池物料不良分析
      {
        intent_name: '电池物料不良分析',
        description: '专门分析电池类物料的不良情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '无描述') as 不良描述
FROM lab_tests
WHERE material_name LIKE '%电池%' AND test_result IN ('FAIL', 'NG')
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["电池不良", "电池物料不良", "电池缺陷", "电池问题"]),
        synonyms: JSON.stringify({"电池": ["battery"], "不良": ["缺陷", "问题"]}),
        example_query: '分析电池物料不良',
        priority: 6
      },

      // 12. 包装盒物料不良分析
      {
        intent_name: '包装盒物料不良分析',
        description: '专门分析包装盒类物料的不良情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '无描述') as 不良描述
FROM lab_tests
WHERE material_name LIKE '%包装盒%' AND test_result IN ('FAIL', 'NG')
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["包装盒不良", "包装盒物料不良", "包装盒缺陷", "包装问题"]),
        synonyms: JSON.stringify({"包装盒": ["包装", "盒子"], "不良": ["缺陷", "问题"]}),
        example_query: '分析包装盒物料不良',
        priority: 6
      },

      // 13. 充电器物料不良分析
      {
        intent_name: '充电器物料不良分析',
        description: '专门分析充电器类物料的不良情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(material_code, '未知') as 项目,
  COALESCE(batch_code, '未知') as 基线,
  material_code as 物料编号,
  batch_code as 批次,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '无描述') as 不良描述
FROM lab_tests
WHERE material_name LIKE '%充电器%' AND test_result IN ('FAIL', 'NG')
ORDER BY test_date DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["充电器不良", "充电器物料不良", "充电器缺陷", "充电器问题"]),
        synonyms: JSON.stringify({"充电器": ["charger"], "不良": ["缺陷", "问题"]}),
        example_query: '分析充电器物料不良',
        priority: 6
      },

      // 14. 特定供应商的不良分析
      {
        intent_name: '供应商不良专项分析',
        description: '分析特定供应商的所有不良情况',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  supplier_name as 供应商,
  material_name as 物料名称,
  batch_code as 批次,
  COUNT(*) as 不良次数,
  GROUP_CONCAT(DISTINCT defect_desc SEPARATOR '; ') as 不良类型,
  DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 首次不良日期,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新不良日期,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM lab_tests
WHERE test_result IN ('FAIL', 'NG') AND defect_desc IS NOT NULL
GROUP BY supplier_name, material_name, batch_code
ORDER BY supplier_name, 不良次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["供应商不良专项", "厂商不良分析", "供应商问题分析", "供应商缺陷"]),
        synonyms: JSON.stringify({"供应商": ["厂商", "供货商"], "不良": ["缺陷", "问题"], "专项": ["专门", "特定"]}),
        example_query: '供应商不良专项分析',
        priority: 5
      },

      // 15. 批次不良率排行
      {
        intent_name: '批次不良率排行',
        description: '按批次统计不良率并排行',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  batch_code as 批次号,
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(*) as 总测试次数,
  SUM(CASE WHEN test_result IN ('FAIL', 'NG') THEN 1 ELSE 0 END) as 不良次数,
  ROUND(SUM(CASE WHEN test_result IN ('FAIL', 'NG') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新测试日期,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM lab_tests
GROUP BY batch_code, material_name, supplier_name
HAVING COUNT(*) >= 3
ORDER BY 不良率 DESC, 不良次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["批次不良率", "批次排行", "不良率排行", "批次质量排名"]),
        synonyms: JSON.stringify({"批次": ["批号", "batch"], "不良率": ["缺陷率"], "排行": ["排名", "排序"]}),
        example_query: '批次不良率排行',
        priority: 5
      },

      // 16. 工厂质量对比分析
      {
        intent_name: '工厂质量对比分析',
        description: '对比不同工厂的质量表现',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  i.storage_location as 工厂,
  COUNT(DISTINCT i.material_code) as 物料种类,
  COUNT(DISTINCT i.supplier_name) as 供应商数量,
  COUNT(DISTINCT i.batch_code) as 批次数量,
  (SELECT COUNT(*) FROM lab_tests lt JOIN inventory inv ON lt.batch_code = inv.batch_code WHERE inv.storage_location = i.storage_location AND lt.test_result IN ('PASS', 'OK')) as 合格次数,
  (SELECT COUNT(*) FROM lab_tests lt JOIN inventory inv ON lt.batch_code = inv.batch_code WHERE inv.storage_location = i.storage_location AND lt.test_result IN ('FAIL', 'NG')) as 不良次数,
  '' as 状态,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM inventory i
GROUP BY i.storage_location
ORDER BY 不良次数 ASC, 合格次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["工厂质量对比", "工厂对比", "厂区质量", "工厂质量分析"]),
        synonyms: JSON.stringify({"工厂": ["厂区", "生产基地"], "对比": ["比较", "分析"]}),
        example_query: '工厂质量对比分析',
        priority: 5
      },

      // 17. 重复不良问题分析
      {
        intent_name: '重复不良问题分析',
        description: '分析重复出现的不良问题',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  COALESCE(defect_desc, '未描述') as 不良类型,
  COUNT(*) as 出现次数,
  COUNT(DISTINCT material_name) as 涉及物料数,
  COUNT(DISTINCT supplier_name) as 涉及供应商数,
  COUNT(DISTINCT batch_code) as 涉及批次数,
  GROUP_CONCAT(DISTINCT material_name SEPARATOR '; ') as 主要物料,
  GROUP_CONCAT(DISTINCT supplier_name SEPARATOR '; ') as 主要供应商,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新出现日期,
  '' as 入库时间,
  '' as 到期时间
FROM lab_tests
WHERE test_result IN ('FAIL', 'NG') AND defect_desc IS NOT NULL AND defect_desc != ''
GROUP BY defect_desc
HAVING COUNT(*) >= 3
ORDER BY 出现次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["重复不良", "重复问题", "常见不良", "频繁问题"]),
        synonyms: JSON.stringify({"重复": ["频繁", "常见"], "不良": ["问题", "缺陷"]}),
        example_query: '重复不良问题分析',
        priority: 4
      },

      // 18. 质量改善效果分析
      {
        intent_name: '质量改善效果分析',
        description: '分析质量改善的效果趋势',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  supplier_name as 供应商,
  material_name as 物料名称,
  DATE_FORMAT(test_date, '%Y-%m') as 月份,
  COUNT(*) as 测试次数,
  SUM(CASE WHEN test_result IN ('PASS', 'OK') THEN 1 ELSE 0 END) as 合格次数,
  SUM(CASE WHEN test_result IN ('FAIL', 'NG') THEN 1 ELSE 0 END) as 不良次数,
  ROUND(SUM(CASE WHEN test_result IN ('PASS', 'OK') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 合格率,
  '' as 入库时间,
  '' as 到期时间,
  '' as 备注
FROM lab_tests
WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
GROUP BY supplier_name, material_name, DATE_FORMAT(test_date, '%Y-%m')
HAVING COUNT(*) >= 5
ORDER BY supplier_name, material_name, 月份 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["质量改善", "改善效果", "质量提升", "改进效果"]),
        synonyms: JSON.stringify({"改善": ["改进", "提升"], "效果": ["结果", "成效"]}),
        example_query: '质量改善效果分析',
        priority: 4
      },

      // 19. 高风险组合分析
      {
        intent_name: '高风险组合分析',
        description: '分析供应商+物料的高风险组合',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  supplier_name as 供应商,
  material_name as 物料名称,
  COUNT(*) as 总测试次数,
  SUM(CASE WHEN test_result IN ('FAIL', 'NG') THEN 1 ELSE 0 END) as 不良次数,
  ROUND(SUM(CASE WHEN test_result IN ('FAIL', 'NG') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率,
  COUNT(DISTINCT batch_code) as 涉及批次,
  GROUP_CONCAT(DISTINCT defect_desc SEPARATOR '; ') as 主要不良,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新测试日期,
  '' as 入库时间,
  '' as 到期时间
FROM lab_tests
GROUP BY supplier_name, material_name
HAVING COUNT(*) >= 5 AND SUM(CASE WHEN test_result IN ('FAIL', 'NG') THEN 1 ELSE 0 END) >= 2
ORDER BY 不良率 DESC, 不良次数 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["高风险组合", "风险组合", "危险组合", "问题组合"]),
        synonyms: JSON.stringify({"高风险": ["危险", "问题"], "组合": ["搭配", "配对"]}),
        example_query: '高风险组合分析',
        priority: 4
      },

      // 20. 质量稳定性分析
      {
        intent_name: '质量稳定性分析',
        description: '分析质量表现的稳定性',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  supplier_name as 供应商,
  material_name as 物料名称,
  COUNT(DISTINCT DATE_FORMAT(test_date, '%Y-%m-%d')) as 测试天数,
  COUNT(*) as 总测试次数,
  ROUND(AVG(CASE WHEN test_result IN ('PASS', 'OK') THEN 100 ELSE 0 END), 2) as 平均合格率,
  ROUND(STDDEV(CASE WHEN test_result IN ('PASS', 'OK') THEN 100 ELSE 0 END), 2) as 合格率波动,
  MIN(DATE_FORMAT(test_date, '%Y-%m-%d')) as 首次测试,
  MAX(DATE_FORMAT(test_date, '%Y-%m-%d')) as 最新测试,
  '' as 入库时间,
  '' as 到期时间
FROM lab_tests
GROUP BY supplier_name, material_name
HAVING COUNT(*) >= 10 AND COUNT(DISTINCT DATE_FORMAT(test_date, '%Y-%m-%d')) >= 3
ORDER BY 合格率波动 DESC
LIMIT 10`,
        parameters: JSON.stringify([]),
        trigger_words: JSON.stringify(["质量稳定性", "稳定性分析", "质量波动", "稳定性评估"]),
        synonyms: JSON.stringify({"稳定性": ["稳定", "波动"], "分析": ["评估", "检查"]}),
        example_query: '质量稳定性分析',
        priority: 4
      }
    ];
    
    // 插入重新设计的规则
    console.log('➕ 插入重新设计的IQE质量规则...\n');
    
    for (const rule of iqeRules) {
      await connection.execute(
        `INSERT INTO nlp_intent_rules 
         (intent_name, description, action_type, action_target, parameters, trigger_words, synonyms, example_query, priority, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.parameters,
          rule.trigger_words,
          rule.synonyms,
          rule.example_query,
          rule.priority
        ]
      );
      console.log(`✅ 插入规则: ${rule.intent_name}`);
    }
    
    // 验证新规则
    console.log('\n🧪 验证重新设计的规则...\n');
    
    const [newRules] = await connection.execute(
      'SELECT intent_name, description, priority FROM nlp_intent_rules ORDER BY priority DESC'
    );
    
    console.log('📊 规则分类统计:');
    console.log('基础规则 (优先级9-10): 5条 - 单场景单字段查询');
    console.log('中级规则 (优先级8): 2条 - 单场景多字段查询');
    console.log('高级规则 (优先级6-7): 3条 - 多场景多字段查询');
    console.log('专项规则 (优先级5-6): 5条 - 特定物料/供应商专项分析');
    console.log('复杂规则 (优先级4-5): 5条 - 复杂关联分析和趋势分析');
    console.log(`总计: ${newRules.length} 条规则\n`);
    
    newRules.forEach((rule, index) => {
      console.log(`${index + 1}. [优先级${rule.priority}] ${rule.intent_name} - ${rule.description}`);
    });
    
    console.log('\n🎉 IQE质量规则重新设计完成！');
    
  } catch (error) {
    console.error('❌ 重新设计失败:', error);
  } finally {
    await connection.end();
  }
}

redesignIQERules().catch(console.error);
