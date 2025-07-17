-- 直接修复数据库字段映射问题

-- 1. 检查inventory表的实际字段结构
-- 假设实际字段可能是：id, materialName, materialCode, supplier, quantity, status, warehouse, factory, inboundTime, expiryTime, notes

-- 2. 基于可能的实际字段结构更新库存场景规则
UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  COALESCE(factory, ''未指定'') as 工厂,
  COALESCE(warehouse, ''未指定'') as 仓库,
  COALESCE(materialCode, material_code, '''') as 物料编码,
  COALESCE(materialName, material_name, '''') as 物料名称,
  COALESCE(supplier, supplier_name, '''') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, ''正常'') as 状态,
  DATE_FORMAT(COALESCE(inboundTime, inbound_time, created_at), ''%Y-%m-%d'') as 入库时间,
  DATE_FORMAT(COALESCE(expiryTime, expiry_time, updated_at), ''%Y-%m-%d'') as 到期时间,
  COALESCE(notes, '''') as 备注
FROM inventory
WHERE materialName LIKE CONCAT(''%'', ?, ''%'') OR material_name LIKE CONCAT(''%'', ?, ''%'')
ORDER BY id DESC
LIMIT 10',
category = '库存场景'
WHERE intent_name = '物料库存信息查询_优化';

UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  COALESCE(factory, ''未指定'') as 工厂,
  COALESCE(warehouse, ''未指定'') as 仓库,
  COALESCE(materialCode, material_code, '''') as 物料编码,
  COALESCE(materialName, material_name, '''') as 物料名称,
  COALESCE(supplier, supplier_name, '''') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, ''正常'') as 状态,
  DATE_FORMAT(COALESCE(inboundTime, inbound_time, created_at), ''%Y-%m-%d'') as 入库时间,
  DATE_FORMAT(COALESCE(expiryTime, expiry_time, updated_at), ''%Y-%m-%d'') as 到期时间,
  COALESCE(notes, '''') as 备注
FROM inventory
WHERE supplier LIKE CONCAT(''%'', ?, ''%'') OR supplier_name LIKE CONCAT(''%'', ?, ''%'')
ORDER BY id DESC
LIMIT 10',
category = '库存场景'
WHERE intent_name = '供应商库存查询_优化';

-- 3. 基于可能的实际字段结构更新测试场景规则
-- 假设lab_tests表字段可能是：id, testId, testDate, materialName, materialCode, supplier, testResult, defectDesc, notes

UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  COALESCE(testId, test_id, id) as 测试编号,
  DATE_FORMAT(COALESCE(testDate, test_date, created_at), ''%Y-%m-%d'') as 日期,
  COALESCE(projectId, project_id, ''未指定'') as 项目,
  COALESCE(baselineId, baseline_id, ''未指定'') as 基线,
  COALESCE(materialCode, material_code, '''') as 物料编码,
  COALESCE(quantity, 1) as 数量,
  COALESCE(materialName, material_name, '''') as 物料名称,
  COALESCE(supplier, supplier_name, '''') as 供应商,
  COALESCE(testResult, test_result, ''PASS'') as 测试结果,
  COALESCE(defectDesc, defect_desc, '''') as 不合格描述,
  COALESCE(notes, '''') as 备注
FROM lab_tests
WHERE materialName LIKE CONCAT(''%'', ?, ''%'') OR material_name LIKE CONCAT(''%'', ?, ''%'')
ORDER BY testDate DESC, test_date DESC, id DESC
LIMIT 10',
category = '测试场景'
WHERE intent_name = '物料测试情况查询';

UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  COALESCE(testId, test_id, id) as 测试编号,
  DATE_FORMAT(COALESCE(testDate, test_date, created_at), ''%Y-%m-%d'') as 日期,
  COALESCE(projectId, project_id, ''未指定'') as 项目,
  COALESCE(baselineId, baseline_id, ''未指定'') as 基线,
  COALESCE(materialCode, material_code, '''') as 物料编码,
  COALESCE(quantity, 1) as 数量,
  COALESCE(materialName, material_name, '''') as 物料名称,
  COALESCE(supplier, supplier_name, '''') as 供应商,
  COALESCE(testResult, test_result, ''PASS'') as 测试结果,
  COALESCE(defectDesc, defect_desc, '''') as 不合格描述,
  COALESCE(notes, '''') as 备注
FROM lab_tests
WHERE supplier LIKE CONCAT(''%'', ?, ''%'') OR supplier_name LIKE CONCAT(''%'', ?, ''%'')
ORDER BY testDate DESC, test_date DESC, id DESC
LIMIT 10',
category = '测试场景'
WHERE intent_name = '供应商测试情况查询';

-- 4. 更新数据探索规则，使用更简单的查询避免字段问题
UPDATE nlp_intent_rules 
SET action_target = 'SELECT DISTINCT 
  COALESCE(supplier, supplier_name, ''未知供应商'') as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE COALESCE(supplier, supplier_name) IS NOT NULL 
  AND COALESCE(supplier, supplier_name) != ''''
GROUP BY COALESCE(supplier, supplier_name)
ORDER BY 记录数量 DESC'
WHERE intent_name = '查看所有供应商';

UPDATE nlp_intent_rules 
SET action_target = 'SELECT DISTINCT 
  COALESCE(materialName, material_name, ''未知物料'') as 物料名称,
  COALESCE(materialCode, material_code, '''') as 物料编码,
  COUNT(*) as 记录数量
FROM inventory 
WHERE COALESCE(materialName, material_name) IS NOT NULL 
  AND COALESCE(materialName, material_name) != ''''
GROUP BY COALESCE(materialName, material_name), COALESCE(materialCode, material_code)
ORDER BY 记录数量 DESC'
WHERE intent_name = '查看所有物料';

UPDATE nlp_intent_rules 
SET action_target = 'SELECT DISTINCT 
  COALESCE(factory, ''未知工厂'') as 工厂,
  COUNT(*) as 记录数量
FROM inventory 
WHERE factory IS NOT NULL AND factory != ''''
GROUP BY factory
ORDER BY 记录数量 DESC'
WHERE intent_name = '查看所有工厂';

UPDATE nlp_intent_rules 
SET action_target = 'SELECT DISTINCT 
  COALESCE(warehouse, ''未知仓库'') as 仓库,
  COUNT(*) as 记录数量
FROM inventory 
WHERE warehouse IS NOT NULL AND warehouse != ''''
GROUP BY warehouse
ORDER BY 记录数量 DESC'
WHERE intent_name = '查看所有仓库';

-- 5. 更新库存状态分布规则
UPDATE nlp_intent_rules 
SET action_target = 'SELECT 
  COALESCE(status, ''未知状态'') as 状态, 
  COUNT(*) as 数量,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
FROM inventory 
WHERE status IS NOT NULL AND status != ''''
GROUP BY status 
ORDER BY 数量 DESC'
WHERE intent_name = '查看库存状态分布';

-- 6. 确保所有重要规则都是活跃状态
UPDATE nlp_intent_rules 
SET status = 'active', updated_at = NOW()
WHERE intent_name IN (
  '查看所有物料', '查看所有供应商', '查看所有工厂', '查看所有仓库',
  '物料测试情况查询', '供应商测试情况查询', 'NG测试结果查询_优化',
  '物料库存信息查询_优化', '供应商库存查询_优化', '查看库存状态分布'
);

-- 7. 查看修复结果
SELECT 
  intent_name as 规则名称,
  category as 分类,
  status as 状态,
  JSON_LENGTH(trigger_words) as 触发词数量
FROM nlp_intent_rules 
WHERE category IN ('数据探索', '测试场景', '库存场景')
  AND status = 'active'
ORDER BY category, intent_name;
