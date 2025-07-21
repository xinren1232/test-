-- 插入基础NLP规则
USE iqe_inspection;

-- 清空现有规则
DELETE FROM nlp_rules;

-- 插入基础规则
INSERT INTO nlp_rules (intent, trigger_words, sql_template, description, category, priority, is_active) VALUES
('inventory_query', '["库存", "库存查询", "物料库存", "剩余数量", "库存状态"]', 'SELECT * FROM inventory WHERE material_name LIKE "%{material}%" OR material_code LIKE "%{material}%"', '查询物料库存信息', '库存管理', 10, 1),

('quality_inspection', '["质量检测", "检验结果", "质检报告", "不良率", "合格率"]', 'SELECT * FROM lab_tests WHERE test_type LIKE "%{test_type}%" AND test_date >= "{start_date}"', '查询质量检测相关信息', '质量检测', 9, 1),

('supplier_query', '["供应商", "供应商查询", "厂商信息", "供货商"]', 'SELECT * FROM inventory WHERE supplier_name LIKE "%{supplier}%"', '查询供应商相关信息', '供应商管理', 8, 1),

('material_search', '["物料", "物料查询", "材料", "零件", "组件"]', 'SELECT * FROM inventory WHERE material_name LIKE "%{keyword}%" OR material_code LIKE "%{keyword}%"', '搜索物料信息', '物料管理', 7, 1),

('production_tracking', '["生产", "生产进度", "制造", "产量", "生产状态"]', 'SELECT * FROM production_tracking WHERE status = "{status}" OR product_name LIKE "%{product}%"', '查询生产跟踪信息', '生产跟踪', 6, 1),

('batch_management', '["批次", "批次管理", "批号", "生产批次"]', 'SELECT * FROM batch_management WHERE batch_code LIKE "%{batch}%" OR product_name LIKE "%{product}%"', '查询批次管理信息', '批次管理', 5, 1),

('data_cleaning_query', '["数据清洗", "8D报告", "问题分析", "根因分析", "纠正措施"]', 'SELECT * FROM data_cleaning_results WHERE file_type = "8D" OR content LIKE "%{keyword}%"', '查询数据清洗和8D报告相关信息', '数据清洗', 8, 1),

('general_help', '["帮助", "使用说明", "功能介绍", "如何使用"]', 'SELECT "帮助信息" as help_info', '提供系统使用帮助', '系统帮助', 1, 1);

-- 验证插入结果
SELECT COUNT(*) as total_rules FROM nlp_rules WHERE is_active = 1;
SELECT intent, category, priority FROM nlp_rules ORDER BY priority DESC;
