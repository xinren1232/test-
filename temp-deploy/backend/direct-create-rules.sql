-- 直接创建规则库
DELETE FROM nlp_intent_rules;

-- 插入基础规则
INSERT INTO nlp_intent_rules (
  id, intent_name, description, category, example_query, 
  trigger_words, action_target, status, priority, created_at, updated_at
) VALUES 
(1, '库存查询_基础', '查询物料库存信息', '库存场景', '库存查询',
 '["库存查询", "库存", "物料库存", "查库存", "库存信息", "库存状态"]',
 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态, DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库日期 FROM inventory WHERE status = "正常" ORDER BY inbound_time DESC LIMIT 100',
 'active', 100, NOW(), NOW()),

(2, '聚龙供应商_库存查询', '查询聚龙供应商的库存信息', '库存场景', '聚龙供应商库存',
 '["聚龙供应商", "聚龙", "聚龙光电", "聚龙库存"]',
 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态, DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库日期 FROM inventory WHERE supplier_name LIKE "%聚龙%" ORDER BY inbound_time DESC LIMIT 100',
 'active', 95, NOW(), NOW()),

(3, 'BOE供应商_库存查询', '查询BOE供应商的库存信息', '库存场景', 'BOE供应商库存',
 '["BOE供应商", "BOE", "BOE科技", "BOE库存"]',
 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态, DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库日期 FROM inventory WHERE supplier_name LIKE "%BOE%" ORDER BY inbound_time DESC LIMIT 100',
 'active', 93, NOW(), NOW()),

(4, '天马供应商_库存查询', '查询天马供应商的库存信息', '库存场景', '天马供应商库存',
 '["天马供应商", "天马", "天马微电子", "天马库存"]',
 'SELECT material_name as 物料名称, supplier_name as 供应商, CAST(quantity AS CHAR) as 数量, status as 状态, DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库日期 FROM inventory WHERE supplier_name LIKE "%天马%" ORDER BY inbound_time DESC LIMIT 100',
 'active', 91, NOW(), NOW()),

(5, '全测试_综合查询', '查询检验测试结果', '检验场景', '全测试结果',
 '["全测试", "检验结果", "测试结果", "检验", "测试", "质检结果"]',
 'SELECT test_id as 测试编号, material_name as 物料名称, test_result as 测试结果, conclusion as 结论, DATE_FORMAT(test_date, "%Y-%m-%d") as 测试日期 FROM lab_tests ORDER BY test_date DESC LIMIT 100',
 'active', 90, NOW(), NOW()),

(6, '不良率_检验查询', '查询物料不良率情况', '检验场景', '不良率查询',
 '["不良率", "缺陷率", "合格率", "质量问题", "不合格"]',
 'SELECT material_name as 物料名称, test_result as 测试结果, conclusion as 结论, CASE WHEN conclusion = "不合格" THEN "高风险" WHEN test_result LIKE "%异常%" THEN "中风险" ELSE "正常" END as 风险等级 FROM lab_tests WHERE conclusion != "合格" OR test_result LIKE "%异常%" ORDER BY test_date DESC LIMIT 100',
 'active', 88, NOW(), NOW()),

(7, '生产上线_情况查询', '查询生产上线情况', '生产场景', '上线情况',
 '["上线情况", "生产情况", "生产", "上线", "在线情况", "生产状态"]',
 'SELECT batch_code as 批次号, material_name as 物料名称, factory as 工厂, CONCAT(ROUND(defect_rate * 100, 2), "%") as 缺陷率, DATE_FORMAT(online_date, "%Y-%m-%d") as 上线日期 FROM online_tracking ORDER BY online_date DESC LIMIT 100',
 'active', 85, NOW(), NOW()),

(8, '高缺陷率_生产查询', '查询高缺陷率的生产批次', '生产场景', '高缺陷率批次',
 '["高缺陷率", "缺陷率高", "质量问题", "生产异常", "不良批次"]',
 'SELECT batch_code as 批次号, material_name as 物料名称, factory as 工厂, CONCAT(ROUND(defect_rate * 100, 2), "%") as 缺陷率, DATE_FORMAT(online_date, "%Y-%m-%d") as 上线日期 FROM online_tracking WHERE defect_rate > 0.05 ORDER BY defect_rate DESC LIMIT 100',
 'active', 83, NOW(), NOW()),

(9, '供应商对比_分析', '对比不同供应商的表现', '分析场景', '供应商对比',
 '["供应商对比", "供应商分析", "供应商比较", "供应商表现"]',
 'SELECT supplier_name as 供应商, COUNT(*) as 物料数量, SUM(quantity) as 总库存, AVG(CASE WHEN status = "正常" THEN 1 ELSE 0 END) as 正常率 FROM inventory GROUP BY supplier_name ORDER BY 总库存 DESC LIMIT 50',
 'active', 80, NOW(), NOW()),

(10, '综合质量_报告', '生成综合质量报告', '报告场景', '质量报告',
 '["质量报告", "综合报告", "整体情况", "质量概况", "全面分析"]',
 'SELECT "库存状态" as 指标类型, COUNT(*) as 数量, CONCAT(ROUND(AVG(CASE WHEN status = "正常" THEN 1 ELSE 0 END) * 100, 1), "%") as 正常率 FROM inventory UNION ALL SELECT "检验状态" as 指标类型, COUNT(*) as 数量, CONCAT(ROUND(AVG(CASE WHEN conclusion = "合格" THEN 1 ELSE 0 END) * 100, 1), "%") as 正常率 FROM lab_tests UNION ALL SELECT "生产状态" as 指标类型, COUNT(*) as 数量, CONCAT(ROUND(AVG(CASE WHEN defect_rate < 0.05 THEN 1 ELSE 0 END) * 100, 1), "%") as 正常率 FROM online_tracking',
 'active', 75, NOW(), NOW());
