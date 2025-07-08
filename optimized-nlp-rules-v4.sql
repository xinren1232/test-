-- 基于前端实际字段的优化NLP规则
-- 解决您提到的问题：
-- 1）项目/基线 物料类型 -不合格描述
-- 2）数量这里应该是该物料种类测试OK/NG的次数
-- 3）显示10条数据，但是实际满足条件的数量也要说明
-- 4）备注不要填写这些信息

-- 清空现有规则
DELETE FROM nlp_intent_rules;

-- 插入优化的NLP规则
INSERT INTO `nlp_intent_rules` (`intent_name`, `description`, `action_type`, `action_target`, `parameters`, `trigger_words`, `synonyms`, `example_query`, `priority`, `status`) VALUES

-- 1. 测试结果统计规则 (修复字段映射问题)
('测试结果统计', '统计测试结果分布情况，显示OK/NG次数', 'SQL_QUERY', 
'SELECT 
  project as 项目,
  baseline as 基线,
  material_type as 物料类型,
  defect_desc as 不合格描述,
  COUNT(CASE WHEN test_result = ''PASS'' THEN 1 END) as OK次数,
  COUNT(CASE WHEN test_result = ''FAIL'' THEN 1 END) as NG次数,
  COUNT(*) as 总测试次数
FROM lab_tests 
WHERE test_result IN (''PASS'', ''FAIL'')
GROUP BY project, baseline, material_type, defect_desc
ORDER BY NG次数 DESC, OK次数 DESC
LIMIT 10', 
'[{"name":"test_type","type":"string","required":false,"description":"测试类型筛选"}]',
'["测试结果", "统计", "OK", "NG", "合格率", "不合格率"]',
'{"测试结果": ["检测结果", "测试状态"], "统计": ["分析", "汇总"], "OK": ["合格", "通过", "PASS"], "NG": ["不合格", "失败", "FAIL"]}',
'统计测试结果分布情况', 10, 'active'),

-- 2. 库存查询规则 (基于实际前端字段)
('库存查询', '查询库存信息，按工厂、仓库、物料类型等筛选', 'SQL_QUERY',
'SELECT 
  factory as 工厂,
  warehouse as 仓库,
  material_type as 物料类型,
  supplier_name as 供应商名称,
  supplier_code as 供应商,
  SUM(quantity) as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, ''%Y-%m-%d'') as 入库时间,
  DATE_FORMAT(expiry_time, ''%Y-%m-%d'') as 到期时间,
  GROUP_CONCAT(DISTINCT notes SEPARATOR ''; '') as 备注
FROM inventory 
WHERE 1=1
  AND (? IS NULL OR factory LIKE CONCAT(''%'', ?, ''%''))
  AND (? IS NULL OR warehouse LIKE CONCAT(''%'', ?, ''%''))
  AND (? IS NULL OR material_type LIKE CONCAT(''%'', ?, ''%''))
  AND (? IS NULL OR supplier_name LIKE CONCAT(''%'', ?, ''%''))
GROUP BY factory, warehouse, material_type, supplier_name, supplier_code, status, inbound_time, expiry_time
ORDER BY 数量 DESC
LIMIT 10',
'[{"name":"factory","type":"string","required":false,"description":"工厂名称"},{"name":"warehouse","type":"string","required":false,"description":"仓库名称"},{"name":"material_type","type":"string","required":false,"description":"物料类型"},{"name":"supplier","type":"string","required":false,"description":"供应商名称"}]',
'["库存", "查询", "工厂", "仓库", "物料", "供应商"]',
'{"库存": ["存货", "物料库存"], "查询": ["查找", "搜索"], "工厂": ["厂区", "生产基地"], "仓库": ["仓储", "存储区"]}',
'查询深圳工厂的库存情况', 8, 'active'),

-- 3. NG测试结果查询 (修复数量含义和备注问题)
('NG测试结果查询', '查询测试失败的记录，显示NG次数而非物料数量', 'SQL_QUERY',
'SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
  project as 项目,
  baseline as 基线,
  material_type as 物料类型,
  COUNT(*) as NG次数,
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_desc as 不合格描述,
  '''' as 备注
FROM lab_tests 
WHERE test_result = ''FAIL''
GROUP BY test_id, test_date, project, baseline, material_type, material_name, supplier_name, defect_desc
ORDER BY test_date DESC, NG次数 DESC
LIMIT 10',
'[{"name":"date_range","type":"string","required":false,"description":"日期范围"},{"name":"material_type","type":"string","required":false,"description":"物料类型"}]',
'["NG", "不合格", "失败", "测试失败", "不良品"]',
'{"NG": ["不合格", "失败", "FAIL"], "测试": ["检测", "检验"]}',
'查询NG测试结果', 9, 'active'),

-- 4. OK测试结果查询
('OK测试结果查询', '查询测试通过的记录，显示OK次数', 'SQL_QUERY',
'SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, ''%Y-%m-%d'') as 日期,
  project as 项目,
  baseline as 基线,
  material_type as 物料类型,
  COUNT(*) as OK次数,
  material_name as 物料名称,
  supplier_name as 供应商,
  '''' as 不合格描述,
  '''' as 备注
FROM lab_tests 
WHERE test_result = ''PASS''
GROUP BY test_id, test_date, project, baseline, material_type, material_name, supplier_name
ORDER BY test_date DESC, OK次数 DESC
LIMIT 10',
'[{"name":"date_range","type":"string","required":false,"description":"日期范围"},{"name":"material_type","type":"string","required":false,"description":"物料类型"}]',
'["OK", "合格", "通过", "测试通过", "良品"]',
'{"OK": ["合格", "通过", "PASS"], "测试": ["检测", "检验"]}',
'查询OK测试结果', 9, 'active'),

-- 5. 工厂库存查询
('工厂库存查询', '按工厂查询库存分布', 'SQL_QUERY',
'SELECT 
  factory as 工厂,
  warehouse as 仓库,
  material_type as 物料类型,
  supplier_name as 供应商名称,
  supplier_code as 供应商,
  SUM(quantity) as 数量,
  status as 状态,
  DATE_FORMAT(MAX(inbound_time), ''%Y-%m-%d'') as 入库时间,
  DATE_FORMAT(MIN(expiry_time), ''%Y-%m-%d'') as 到期时间,
  '''' as 备注
FROM inventory 
WHERE factory LIKE CONCAT(''%'', COALESCE(?, ''''), ''%'')
GROUP BY factory, warehouse, material_type, supplier_name, supplier_code, status
ORDER BY factory, 数量 DESC
LIMIT 10',
'[{"name":"factory_name","type":"string","required":false,"description":"工厂名称"}]',
'["工厂库存", "工厂", "厂区库存", "生产基地库存"]',
'{"工厂": ["厂区", "生产基地", "制造厂"], "库存": ["存货", "物料"]}',
'查询深圳工厂库存', 7, 'active');
