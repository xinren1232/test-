-- 修复规则332: 结构件类上线情况查询
-- 解决问题：1）内容空缺 2）确保真实数据调取 3）字段名错误（本周异常→不良现象）

UPDATE nlp_intent_rules 
SET action_target = 'SELECT
  COALESCE(factory, ''未知工厂'') as 工厂,
  COALESCE(baseline, baseline_id, ''未知基线'') as 基线,
  COALESCE(project, project_id, ''未知项目'') as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  COALESCE(supplier_name, ''未知供应商'') as 供应商,
  COALESCE(batch_code, ''未知批次'') as 批次号,
  CASE 
    WHEN defect_rate IS NOT NULL AND defect_rate > 0 THEN CONCAT(ROUND(defect_rate * 100, 2), ''%'')
    WHEN defect_rate = 0 THEN ''0.00%''
    ELSE ''待检测''
  END as 不良率,
  COALESCE(
    CASE 
      WHEN weekly_anomaly IS NOT NULL AND weekly_anomaly != '''' THEN weekly_anomaly
      WHEN defect_phenomenon IS NOT NULL AND defect_phenomenon != '''' THEN defect_phenomenon
      ELSE ''无异常''
    END
  ) as 不良现象,
  DATE_FORMAT(COALESCE(inspection_date, created_at), ''%Y-%m-%d'') as 检验日期,
  COALESCE(notes, '''') as 备注
FROM online_tracking
WHERE (
    material_name LIKE ''%框%'' 
    OR material_name LIKE ''%盖%'' 
    OR material_name LIKE ''%壳%''
    OR material_name LIKE ''%支架%''
    OR material_name LIKE ''%结构%''
    OR material_code LIKE ''%CS-%''
    OR material_code LIKE ''%CASE-%''
    OR material_code LIKE ''%FRAME-%''
  )
  AND material_name IS NOT NULL 
  AND material_name != ''''
  AND material_code IS NOT NULL 
  AND material_code != ''''
  AND supplier_name IS NOT NULL
  AND supplier_name != ''''
ORDER BY 
  COALESCE(inspection_date, created_at) DESC, 
  defect_rate DESC,
  id DESC
LIMIT 100',
updated_at = NOW()
WHERE id = 332;

-- 验证更新
SELECT id, rule_name, action_target FROM nlp_intent_rules WHERE id = 332;
