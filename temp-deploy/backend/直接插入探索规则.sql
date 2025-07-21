-- 数据探索规则直接插入SQL
-- 支持用户先探索数据内容，再执行具体查询

-- 1. 查看所有供应商
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看所有供应商', '显示系统中所有可用的供应商列表', 'SQL_QUERY', 
'SELECT DISTINCT supplier_name as 供应商名称, COUNT(*) as 记录数量
FROM inventory 
WHERE supplier_name IS NOT NULL AND supplier_name != \'\'
GROUP BY supplier_name 
ORDER BY 记录数量 DESC',
'["供应商列表", "所有供应商", "有哪些供应商", "供应商有什么"]',
'系统里有哪些供应商？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 2. 查看所有物料
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看所有物料', '显示系统中所有可用的物料列表', 'SQL_QUERY',
'SELECT DISTINCT material_name as 物料名称, material_code as 物料编码, COUNT(*) as 记录数量
FROM inventory 
WHERE material_name IS NOT NULL AND material_name != \'\'
GROUP BY material_name, material_code 
ORDER BY 记录数量 DESC',
'["物料列表", "所有物料", "有哪些物料", "物料有什么"]',
'系统里有哪些物料？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 3. 查看所有工厂
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看所有工厂', '显示系统中所有可用的工厂列表', 'SQL_QUERY',
'SELECT DISTINCT factory as 工厂名称, COUNT(*) as 记录数量
FROM inventory 
WHERE factory IS NOT NULL AND factory != \'\'
GROUP BY factory 
ORDER BY 记录数量 DESC',
'["工厂列表", "所有工厂", "有哪些工厂", "工厂有什么"]',
'系统里有哪些工厂？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 4. 查看所有仓库
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看所有仓库', '显示系统中所有可用的仓库列表', 'SQL_QUERY',
'SELECT DISTINCT warehouse as 仓库名称, COUNT(*) as 记录数量
FROM inventory 
WHERE warehouse IS NOT NULL AND warehouse != \'\'
GROUP BY warehouse 
ORDER BY 记录数量 DESC',
'["仓库列表", "所有仓库", "有哪些仓库", "仓库有什么"]',
'系统里有哪些仓库？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 5. 查看所有项目
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看所有项目', '显示系统中所有可用的项目列表', 'SQL_QUERY',
'SELECT DISTINCT project_id as 项目编号, COUNT(*) as 记录数量
FROM lab_tests 
WHERE project_id IS NOT NULL AND project_id != \'\'
GROUP BY project_id 
ORDER BY 记录数量 DESC',
'["项目列表", "所有项目", "有哪些项目", "项目有什么"]',
'系统里有哪些项目？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 6. 查看所有基线
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看所有基线', '显示系统中所有可用的基线列表', 'SQL_QUERY',
'SELECT DISTINCT baseline_id as 基线编号, COUNT(*) as 记录数量
FROM lab_tests 
WHERE baseline_id IS NOT NULL AND baseline_id != \'\'
GROUP BY baseline_id 
ORDER BY 记录数量 DESC',
'["基线列表", "所有基线", "有哪些基线", "基线有什么"]',
'系统里有哪些基线？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 7. 查看供应商物料组合
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看供应商物料组合', '显示每个供应商提供的物料种类', 'SQL_QUERY',
'SELECT supplier_name as 供应商, 
       GROUP_CONCAT(DISTINCT material_name ORDER BY material_name) as 物料列表,
       COUNT(DISTINCT material_name) as 物料种类数
FROM inventory 
WHERE supplier_name IS NOT NULL AND material_name IS NOT NULL
GROUP BY supplier_name 
ORDER BY 物料种类数 DESC',
'["供应商物料", "供应商提供什么物料", "哪个供应商有什么物料"]',
'各个供应商都提供哪些物料？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 8. 查看工厂仓库组合
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看工厂仓库组合', '显示每个工厂对应的仓库分布', 'SQL_QUERY',
'SELECT factory as 工厂, 
       GROUP_CONCAT(DISTINCT warehouse ORDER BY warehouse) as 仓库列表,
       COUNT(DISTINCT warehouse) as 仓库数量
FROM inventory 
WHERE factory IS NOT NULL AND warehouse IS NOT NULL
GROUP BY factory 
ORDER BY 仓库数量 DESC',
'["工厂仓库", "工厂有哪些仓库", "仓库分布"]',
'各个工厂都有哪些仓库？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 9. 查看库存状态分布
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看库存状态分布', '显示库存中各种状态的分布情况', 'SQL_QUERY',
'SELECT status as 状态, COUNT(*) as 数量, 
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
FROM inventory 
WHERE status IS NOT NULL
GROUP BY status 
ORDER BY 数量 DESC',
'["状态分布", "库存状态", "有哪些状态"]',
'库存状态都有哪些？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 10. 查看测试结果分布
INSERT INTO nlp_intent_rules 
(intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms)
VALUES 
('查看测试结果分布', '显示测试结果的分布情况', 'SQL_QUERY',
'SELECT test_result as 测试结果, COUNT(*) as 数量,
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as 占比
FROM lab_tests 
WHERE test_result IS NOT NULL
GROUP BY test_result 
ORDER BY 数量 DESC',
'["测试结果分布", "测试状态", "合格率"]',
'测试结果都有哪些？', '数据探索', 50, 'active', '{}')
ON DUPLICATE KEY UPDATE 
action_target = VALUES(action_target),
trigger_words = VALUES(trigger_words);

-- 查询插入结果
SELECT COUNT(*) as 数据探索规则数量 FROM nlp_intent_rules WHERE category = '数据探索' AND status = 'active';
SELECT COUNT(*) as 总活跃规则数量 FROM nlp_intent_rules WHERE status = 'active';
