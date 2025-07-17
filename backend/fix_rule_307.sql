-- 修复规则307: 供应商对比分析
UPDATE nlp_intent_rules 
SET action_target = 'SELECT storage_location as 工厂, storage_location as 仓库, material_code as 物料编码, material_name as 物料名称, supplier_name as 供应商, quantity as 数量, status as 状态, DATE_FORMAT(inbound_time, ''%Y-%m-%d'') as 入库时间, DATE_FORMAT(updated_at, ''%Y-%m-%d'') as 到期时间, COALESCE(notes, '''') as 备注 FROM inventory WHERE supplier_name LIKE CONCAT(''%'', ?, ''%'') ORDER BY supplier_name, id DESC',
    updated_at = NOW()
WHERE id = 307;

-- 验证更新
SELECT id, intent_name, action_target FROM nlp_intent_rules WHERE id = 307;
