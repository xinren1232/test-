import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixComparisonRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 专门修复对比场景规则的字段映射...\n');
    
    // 定义对比场景规则的SQL模板
    const comparisonRulesSQLs = {
      '物料大类别质量对比': `
SELECT
  CASE 
    WHEN material_name LIKE '%电池%' OR material_name LIKE '%充电器%' OR material_name LIKE '%充电线%' THEN '充电类'
    WHEN material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%' THEN '光学类'
    WHEN material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%' THEN '结构件类'
    WHEN material_name LIKE '%扬声器%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%听筒%' THEN '声学类'
    WHEN material_name LIKE '%包装盒%' OR material_name LIKE '%说明书%' OR material_name LIKE '%保护膜%' THEN '包装类'
    ELSE '其他类'
  END as 物料大类,
  COUNT(*) as 测试总数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
  CONCAT(ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2), '%') as 不良率,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新测试日期
FROM lab_tests
WHERE material_name IS NOT NULL AND material_name != ''
GROUP BY 
  CASE 
    WHEN material_name LIKE '%电池%' OR material_name LIKE '%充电器%' OR material_name LIKE '%充电线%' THEN '充电类'
    WHEN material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%' THEN '光学类'
    WHEN material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%' THEN '结构件类'
    WHEN material_name LIKE '%扬声器%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%听筒%' THEN '声学类'
    WHEN material_name LIKE '%包装盒%' OR material_name LIKE '%说明书%' OR material_name LIKE '%保护膜%' THEN '包装类'
    ELSE '其他类'
  END
ORDER BY 不良率 DESC`,

      '物料大类别月度质量趋势': `
SELECT
  DATE_FORMAT(test_date, '%Y-%m') as 月份,
  CASE 
    WHEN material_name LIKE '%电池%' OR material_name LIKE '%充电器%' OR material_name LIKE '%充电线%' THEN '充电类'
    WHEN material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%' THEN '光学类'
    WHEN material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%' THEN '结构件类'
    WHEN material_name LIKE '%扬声器%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%听筒%' THEN '声学类'
    WHEN material_name LIKE '%包装盒%' OR material_name LIKE '%说明书%' OR material_name LIKE '%保护膜%' THEN '包装类'
    ELSE '其他类'
  END as 物料大类,
  COUNT(*) as 测试总数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
  CONCAT(ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2), '%') as 不良率
FROM lab_tests
WHERE material_name IS NOT NULL AND material_name != ''
  AND test_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY 
  DATE_FORMAT(test_date, '%Y-%m'),
  CASE 
    WHEN material_name LIKE '%电池%' OR material_name LIKE '%充电器%' OR material_name LIKE '%充电线%' THEN '充电类'
    WHEN material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%' THEN '光学类'
    WHEN material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%' THEN '结构件类'
    WHEN material_name LIKE '%扬声器%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%听筒%' THEN '声学类'
    WHEN material_name LIKE '%包装盒%' OR material_name LIKE '%说明书%' OR material_name LIKE '%保护膜%' THEN '包装类'
    ELSE '其他类'
  END
ORDER BY 月份 DESC, 不良率 DESC`,

      '大类别Top不良分析': `
SELECT
  CASE 
    WHEN material_name LIKE '%电池%' OR material_name LIKE '%充电器%' OR material_name LIKE '%充电线%' THEN '充电类'
    WHEN material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%' THEN '光学类'
    WHEN material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%' THEN '结构件类'
    WHEN material_name LIKE '%扬声器%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%听筒%' THEN '声学类'
    WHEN material_name LIKE '%包装盒%' OR material_name LIKE '%说明书%' OR material_name LIKE '%保护膜%' THEN '包装类'
    ELSE '其他类'
  END as 物料大类,
  defect_desc as 不良描述,
  COUNT(*) as 不良次数,
  CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result = 'NG'), 2), '%') as 占比,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新发生日期
FROM lab_tests
WHERE test_result = 'NG' 
  AND defect_desc IS NOT NULL 
  AND defect_desc != ''
  AND material_name IS NOT NULL 
  AND material_name != ''
GROUP BY 
  CASE 
    WHEN material_name LIKE '%电池%' OR material_name LIKE '%充电器%' OR material_name LIKE '%充电线%' THEN '充电类'
    WHEN material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%' THEN '光学类'
    WHEN material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%' THEN '结构件类'
    WHEN material_name LIKE '%扬声器%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%听筒%' THEN '声学类'
    WHEN material_name LIKE '%包装盒%' OR material_name LIKE '%说明书%' OR material_name LIKE '%保护膜%' THEN '包装类'
    ELSE '其他类'
  END,
  defect_desc
ORDER BY 不良次数 DESC
LIMIT 20`,

      '结构件类供应商质量排行': `
SELECT
  supplier_name as 供应商,
  COUNT(*) as 测试总数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
  CONCAT(ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2), '%') as 不良率,
  COUNT(DISTINCT material_name) as 物料种类数,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新测试日期
FROM lab_tests
WHERE (material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%')
  AND supplier_name IS NOT NULL 
  AND supplier_name != ''
GROUP BY supplier_name
ORDER BY 不良率 ASC, 测试总数 DESC
LIMIT 20`,

      '光学类供应商质量排行': `
SELECT
  supplier_name as 供应商,
  COUNT(*) as 测试总数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
  CONCAT(ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2), '%') as 不良率,
  COUNT(DISTINCT material_name) as 物料种类数,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新测试日期
FROM lab_tests
WHERE (material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%')
  AND supplier_name IS NOT NULL 
  AND supplier_name != ''
GROUP BY supplier_name
ORDER BY 不良率 ASC, 测试总数 DESC
LIMIT 20`,

      '结构件类深度不良分析': `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_desc as 不良描述,
  COUNT(*) as 不良次数,
  CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result = 'NG' AND (material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%')), 2), '%') as 占比,
  DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 首次发生,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新发生
FROM lab_tests
WHERE test_result = 'NG' 
  AND (material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%')
  AND defect_desc IS NOT NULL 
  AND defect_desc != ''
GROUP BY material_name, supplier_name, defect_desc
ORDER BY 不良次数 DESC
LIMIT 20`,

      '光学类显示缺陷专项分析': `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_desc as 缺陷描述,
  COUNT(*) as 缺陷次数,
  CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result = 'NG' AND (material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%')), 2), '%') as 占比,
  DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 首次发现,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新发现
FROM lab_tests
WHERE test_result = 'NG' 
  AND (material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%')
  AND defect_desc IS NOT NULL 
  AND defect_desc != ''
  AND (defect_desc LIKE '%显示%' OR defect_desc LIKE '%屏幕%' OR defect_desc LIKE '%色彩%' OR defect_desc LIKE '%亮度%' OR defect_desc LIKE '%对焦%' OR defect_desc LIKE '%成像%')
GROUP BY material_name, supplier_name, defect_desc
ORDER BY 缺陷次数 DESC
LIMIT 20`
    };
    
    console.log('=== 开始修复对比场景规则 ===\n');
    
    let fixedCount = 0;
    
    for (const [ruleName, sql] of Object.entries(comparisonRulesSQLs)) {
      try {
        console.log(`修复规则: ${ruleName}`);
        
        const [updateResult] = await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
          [sql.trim(), ruleName]
        );
        
        if (updateResult.affectedRows > 0) {
          console.log(`  ✅ 修复成功`);
          fixedCount++;
        } else {
          console.log(`  ⚠️  规则不存在或未更新`);
        }
      } catch (error) {
        console.log(`  ❌ 修复失败: ${error.message}`);
      }
    }
    
    console.log(`\n=== 对比场景规则修复完成 ===`);
    console.log(`🔧 修复规则数: ${fixedCount}/${Object.keys(comparisonRulesSQLs).length}`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 对比场景规则字段映射修复完成！');
      console.log('📊 现在所有对比场景查询都会显示中文字段名');
      console.log('🔄 请重启后端服务以加载更新的规则');
    }
    
    // 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    const [verifyRules] = await connection.execute(
      'SELECT intent_name, category FROM nlp_intent_rules WHERE category = "对比场景" ORDER BY sort_order'
    );
    
    console.log('对比场景规则列表:');
    verifyRules.forEach((rule, index) => {
      const isFixed = Object.keys(comparisonRulesSQLs).includes(rule.intent_name);
      console.log(`  ${index + 1}. ${rule.intent_name} ${isFixed ? '✅' : '⚠️'}`);
    });
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixComparisonRules();
