-- 清理模拟数据并重置为真实数据查询
-- 执行前请确保已备份重要数据

-- 1. 创建备份表
CREATE TABLE IF NOT EXISTS online_tracking_backup_20250716 AS 
SELECT * FROM online_tracking;

-- 2. 查看当前数据状态
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN operator = '系统' THEN 1 END) as system_generated,
  COUNT(CASE WHEN operator IS NULL THEN 1 END) as null_operator,
  COUNT(CASE WHEN operator NOT IN ('系统') AND operator IS NOT NULL THEN 1 END) as manual_records
FROM online_tracking;

-- 3. 查看样本数据
SELECT id, material_name, supplier_name, project, baseline, operator, created_at
FROM online_tracking 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. 清理自动生成的模拟数据
DELETE FROM online_tracking 
WHERE operator = '系统' OR operator IS NULL;

-- 5. 查看清理后状态
SELECT COUNT(*) as remaining_records FROM online_tracking;

-- 6. 如果还有记录，查看剩余数据
SELECT id, material_name, supplier_name, project, baseline, operator
FROM online_tracking 
LIMIT 5;

-- 7. 更新规则332为真实数据查询（无模拟数据）
UPDATE nlp_intent_rules 
SET action_target = 'SELECT
  COALESCE(factory, ''未知工厂'') as 工厂,
  COALESCE(baseline, ''未知基线'') as 基线,
  COALESCE(project, ''未知项目'') as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  COALESCE(supplier_name, ''未知供应商'') as 供应商,
  COALESCE(batch_code, ''未知批次'') as 批次号,
  CASE 
    WHEN defect_rate IS NULL OR defect_rate = 0 THEN ''0.0%''
    WHEN defect_rate < 1 THEN CONCAT(ROUND(defect_rate * 100, 1), ''%'')
    ELSE CONCAT(ROUND(defect_rate, 1), ''%'')
  END as 不良率,
  CASE
    WHEN defect_rate = 0 OR defect_rate IS NULL THEN ''正常''
    WHEN weekly_anomaly IS NULL OR weekly_anomaly = '''' OR weekly_anomaly = ''无'' THEN ''待分析''
    ELSE weekly_anomaly
  END as 不良现象,
  DATE_FORMAT(COALESCE(inspection_date, created_at), ''%Y-%m-%d'') as 检验日期,
  COALESCE(notes, '''') as 备注
FROM online_tracking
WHERE (
    material_name LIKE ''%框%'' 
    OR material_name LIKE ''%盖%'' 
    OR material_name LIKE ''%壳%''
    OR material_name LIKE ''%支架%''
    OR material_name LIKE ''%结构%''
    OR material_name LIKE ''%保护套%''
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
  id DESC',
  updated_at = NOW()
WHERE id = 332;

-- 8. 验证规则更新
SELECT id, intent_name, LEFT(action_target, 100) as sql_preview
FROM nlp_intent_rules 
WHERE id = 332;

-- 9. 测试查询（应该返回空结果）
SELECT
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, '未知基线') as 基线,
  COALESCE(project, '未知项目') as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '未知批次') as 批次号,
  CASE 
    WHEN defect_rate IS NULL OR defect_rate = 0 THEN '0.0%'
    WHEN defect_rate < 1 THEN CONCAT(ROUND(defect_rate * 100, 1), '%')
    ELSE CONCAT(ROUND(defect_rate, 1), '%')
  END as 不良率,
  CASE
    WHEN defect_rate = 0 OR defect_rate IS NULL THEN '正常'
    WHEN weekly_anomaly IS NULL OR weekly_anomaly = '' OR weekly_anomaly = '无' THEN '待分析'
    ELSE weekly_anomaly
  END as 不良现象,
  DATE_FORMAT(COALESCE(inspection_date, created_at), '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE (
    material_name LIKE '%框%' 
    OR material_name LIKE '%盖%' 
    OR material_name LIKE '%壳%'
    OR material_name LIKE '%支架%'
    OR material_name LIKE '%结构%'
    OR material_name LIKE '%保护套%'
    OR material_code LIKE '%CS-%'
    OR material_code LIKE '%CASE-%'
    OR material_code LIKE '%FRAME-%'
  )
  AND material_name IS NOT NULL 
  AND material_name != ''
  AND material_code IS NOT NULL 
  AND material_code != ''
  AND supplier_name IS NOT NULL
  AND supplier_name != ''
ORDER BY 
  COALESCE(inspection_date, created_at) DESC, 
  defect_rate DESC,
  id DESC;
