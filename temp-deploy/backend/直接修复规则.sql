-- 直接修复规则匹配和字段映射问题

-- 1. 修复数据探索规则的触发词
UPDATE nlp_intent_rules 
SET trigger_words = '["供应商列表", "所有供应商", "有哪些供应商", "系统里有哪些供应商", "供应商都有什么", "查看供应商"]'
WHERE intent_name = '查看所有供应商';

UPDATE nlp_intent_rules 
SET trigger_words = '["工厂列表", "所有工厂", "有哪些工厂", "系统里有哪些工厂", "工厂都有什么", "查看工厂"]'
WHERE intent_name = '查看所有工厂';

UPDATE nlp_intent_rules 
SET trigger_words = '["仓库列表", "所有仓库", "有哪些仓库", "系统里有哪些仓库", "仓库都有什么", "查看仓库"]'
WHERE intent_name = '查看所有仓库';

UPDATE nlp_intent_rules 
SET trigger_words = '["物料列表", "所有物料", "有哪些物料", "系统里有哪些物料", "物料都有什么", "查看物料"]'
WHERE intent_name = '查看所有物料';

-- 2. 修复测试场景规则的SQL - 确保字段匹配测试页面设计
UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
  COALESCE(project_id, ''未指定'') as 项目,
  COALESCE(baseline_id, ''未指定'') as 基线,
  material_code as 物料编码,
  COALESCE(quantity, 1) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '''') as 不合格描述,
  COALESCE(notes, '''') as 备注
FROM lab_tests
WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
ORDER BY test_date DESC
LIMIT 10',
category = '测试场景'
WHERE intent_name = '物料测试情况查询';

UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
  COALESCE(project_id, ''未指定'') as 项目,
  COALESCE(baseline_id, ''未指定'') as 基线,
  material_code as 物料编码,
  COALESCE(quantity, 1) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '''') as 不合格描述,
  COALESCE(notes, '''') as 备注
FROM lab_tests
WHERE supplier_name LIKE CONCAT(''%'', ?, ''%'')
ORDER BY test_date DESC
LIMIT 10',
category = '测试场景'
WHERE intent_name = '供应商测试情况查询';

UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
  COALESCE(project_id, ''未指定'') as 项目,
  COALESCE(baseline_id, ''未指定'') as 基线,
  material_code as 物料编码,
  COALESCE(quantity, 1) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '''') as 不合格描述,
  COALESCE(notes, '''') as 备注
FROM lab_tests
WHERE test_result IN (''FAIL'', ''NG'', ''不合格'')
ORDER BY test_date DESC
LIMIT 10',
category = '测试场景'
WHERE intent_name = 'NG测试结果查询_优化';

-- 3. 修复库存场景规则的SQL - 确保字段匹配库存页面设计
UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  factory as 工厂,
  warehouse as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, ''%Y-%m-%d'') as 入库时间,
  DATE_FORMAT(expiry_time, ''%Y-%m-%d'') as 到期时间,
  COALESCE(notes, '''') as 备注
FROM inventory
WHERE material_name LIKE CONCAT(''%'', ?, ''%'')
ORDER BY inbound_time DESC
LIMIT 10',
category = '库存场景'
WHERE intent_name = '物料库存信息查询_优化';

UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  factory as 工厂,
  warehouse as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, ''%Y-%m-%d'') as 入库时间,
  DATE_FORMAT(expiry_time, ''%Y-%m-%d'') as 到期时间,
  COALESCE(notes, '''') as 备注
FROM inventory
WHERE supplier_name LIKE CONCAT(''%'', ?, ''%'')
ORDER BY inbound_time DESC
LIMIT 10',
category = '库存场景'
WHERE intent_name = '供应商库存查询_优化';

-- 4. 添加库存状态分布探索规则
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, created_at, updated_at)
VALUES (
  '查看库存状态分布',
  '显示库存中各种状态的分布情况',
  'SQL_QUERY',
  'SELECT 
    status as 状态, 
    COUNT(*) as 数量,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
  FROM inventory 
  WHERE status IS NOT NULL
  GROUP BY status 
  ORDER BY 数量 DESC',
  '["状态分布", "库存状态", "有哪些状态", "状态统计", "库存状态都有哪些", "状态都有什么"]',
  '库存状态都有哪些？',
  '数据探索',
  50,
  'active',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words),
updated_at = NOW();

-- 5. 修复测试结果查询规则的触发词
UPDATE nlp_intent_rules 
SET trigger_words = '["测试结果", "查询测试结果", "测试情况", "检测结果", "测试记录"]'
WHERE intent_name LIKE '%测试结果查询%';

-- 6. 确保所有规则都有正确的状态
UPDATE nlp_intent_rules 
SET status = 'active', updated_at = NOW()
WHERE intent_name IN (
  '查看所有物料', '查看所有供应商', '查看所有工厂', '查看所有仓库',
  '物料测试情况查询', '供应商测试情况查询', 'NG测试结果查询_优化',
  '物料库存信息查询_优化', '供应商库存查询_优化', '查看库存状态分布'
);

-- 7. 查看修复结果统计
SELECT 
  category,
  COUNT(*) as 规则数量,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as 活跃规则
FROM nlp_intent_rules 
WHERE category IN ('数据探索', '测试场景', '库存场景')
GROUP BY category
ORDER BY category;
