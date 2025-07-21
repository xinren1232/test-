import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRemainingRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修复剩余4个问题规则的字段映射...\n');
    
    // 定义剩余问题规则的正确SQL
    const fixedRulesSQLs = {
      '供应商对比分析': `
SELECT
  '供应商对比' as 分析类型,
  supplier_name as 供应商,
  COUNT(*) as 库存记录数,
  SUM(quantity) as 总库存量,
  COUNT(CASE WHEN status = '正常' THEN 1 END) as 正常库存,
  COUNT(CASE WHEN status = '风险' THEN 1 END) as 风险库存,
  COUNT(CASE WHEN status = '冻结' THEN 1 END) as 冻结库存,
  ROUND(AVG(quantity), 2) as 平均库存量,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最新入库时间,
  GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 主要物料
FROM inventory
WHERE supplier_name IS NOT NULL AND supplier_name != ''
GROUP BY supplier_name
ORDER BY 总库存量 DESC
LIMIT 10`,

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
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新发生日期,
  COUNT(DISTINCT supplier_name) as 涉及供应商数,
  GROUP_CONCAT(DISTINCT supplier_name ORDER BY supplier_name SEPARATOR ', ') as 主要供应商
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

      '结构件类深度不良分析': `
SELECT
  '结构件类' as 物料大类,
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_desc as 不良描述,
  COUNT(*) as 不良次数,
  CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result = 'NG' AND (material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%手机卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%')), 2), '%') as 占比,
  DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 首次发生,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新发生,
  COUNT(DISTINCT DATE_FORMAT(test_date, '%Y-%m')) as 持续月数
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
  '光学类' as 物料大类,
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_desc as 缺陷描述,
  COUNT(*) as 缺陷次数,
  CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result = 'NG' AND (material_name LIKE '%LCD显示屏%' OR material_name LIKE '%摄像头%' OR material_name LIKE '%传感器%')), 2), '%') as 占比,
  DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 首次发现,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最新发现,
  COUNT(DISTINCT DATE_FORMAT(test_date, '%Y-%m')) as 持续月数
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
    
    console.log('=== 开始修复剩余问题规则 ===\n');
    
    let fixedCount = 0;
    
    for (const [ruleName, sql] of Object.entries(fixedRulesSQLs)) {
      try {
        console.log(`修复规则: ${ruleName}`);
        
        const [updateResult] = await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
          [sql.trim(), ruleName]
        );
        
        if (updateResult.affectedRows > 0) {
          console.log(`  ✅ 修复成功`);
          fixedCount++;
          
          // 验证修复后的字段
          const hasRequiredFields = sql.includes(' as 物料大类') || 
                                   sql.includes(' as 供应商') || 
                                   sql.includes(' as 不良') ||
                                   sql.includes(' as 缺陷');
          
          if (hasRequiredFields) {
            console.log(`  ✅ 字段映射验证通过`);
          } else {
            console.log(`  ⚠️  字段映射可能仍有问题`);
          }
        } else {
          console.log(`  ⚠️  规则不存在或未更新`);
        }
      } catch (error) {
        console.log(`  ❌ 修复失败: ${error.message}`);
      }
    }
    
    console.log(`\n=== 修复完成总结 ===`);
    console.log(`🔧 修复规则数: ${fixedCount}/${Object.keys(fixedRulesSQLs).length}`);
    
    if (fixedCount === Object.keys(fixedRulesSQLs).length) {
      console.log('\n🎉 所有问题规则修复完成！');
      console.log('📊 现在所有规则都应该显示正确的中文字段名');
      
      // 最终验证
      console.log('\n=== 最终验证 ===');
      const [allRules] = await connection.execute(
        'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name IN (?, ?, ?, ?)',
        Object.keys(fixedRulesSQLs)
      );
      
      console.log('修复后的规则验证:');
      allRules.forEach(rule => {
        const hasChineseFields = rule.action_target.includes(' as ') && 
                                (rule.action_target.includes(' as 物料大类') || 
                                 rule.action_target.includes(' as 供应商') || 
                                 rule.action_target.includes(' as 不良') ||
                                 rule.action_target.includes(' as 缺陷') ||
                                 rule.action_target.includes(' as 分析类型'));
        
        console.log(`  ${rule.intent_name}: ${hasChineseFields ? '✅' : '❌'}`);
      });
      
      console.log('\n🔄 请重启后端服务以加载更新的规则');
    } else {
      console.log('\n⚠️  部分规则修复失败，请检查错误信息');
    }
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixRemainingRules();
