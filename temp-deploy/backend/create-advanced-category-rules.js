import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 高级物料大类别规则
const ADVANCED_CATEGORY_RULES = [
  // 高级统计规则 - Priority 30
  {
    intent_name: '结构件类供应商质量排行',
    description: '分析结构件类供应商的质量表现排行',
    priority: 30,
    category: '高级统计规则',
    trigger_words: JSON.stringify(['结构件供应商', '结构件质量', '聚龙', '欣冠']),
    action_target: `
SELECT 
  supplier_name as 供应商,
  COUNT(*) as 测试总次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT material_name) as 涉及物料数,
  GROUP_CONCAT(DISTINCT defect_description ORDER BY defect_description) as 主要不良
FROM test_tracking 
WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件')
GROUP BY supplier_name
ORDER BY 通过率 DESC, 测试总次数 DESC`
  },
  
  {
    intent_name: '光学类供应商质量排行',
    description: '分析光学类供应商的质量表现排行',
    priority: 30,
    category: '高级统计规则',
    trigger_words: JSON.stringify(['光学供应商', '光学质量', '天马', 'BOE', '华星']),
    action_target: `
SELECT 
  supplier_name as 供应商,
  COUNT(*) as 测试总次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT material_name) as 涉及物料数,
  GROUP_CONCAT(DISTINCT defect_description ORDER BY defect_description) as 主要不良
FROM test_tracking 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组')
GROUP BY supplier_name
ORDER BY 通过率 DESC, 测试总次数 DESC`
  },
  
  {
    intent_name: '物料大类别库存风险分析',
    description: '分析各物料大类别的库存风险状况',
    priority: 30,
    category: '高级统计规则',
    trigger_words: JSON.stringify(['大类别风险', '库存风险', '类别库存']),
    action_target: `
SELECT 
  CASE 
    WHEN material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件') THEN '结构件类'
    WHEN material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组') THEN '光学类'
    WHEN material_name IN ('电池', '充电器') THEN '充电类'
    WHEN material_name IN ('喇叭', '听筒') THEN '声学类'
    WHEN material_name IN ('保护套', '标签', '包装盒') THEN '包材类'
    ELSE '其他'
  END as 物料大类别,
  COUNT(*) as 库存批次数,
  SUM(quantity) as 总库存量,
  SUM(CASE WHEN status = '风险' THEN 1 ELSE 0 END) as 风险批次数,
  SUM(CASE WHEN status = '风险' THEN quantity ELSE 0 END) as 风险库存量,
  ROUND(SUM(CASE WHEN status = '风险' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 风险批次率,
  ROUND(SUM(CASE WHEN status = '风险' THEN quantity ELSE 0 END) * 100.0 / SUM(quantity), 2) as 风险库存率,
  COUNT(DISTINCT supplier_name) as 供应商数量
FROM inventory 
WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒')
GROUP BY 物料大类别
ORDER BY 风险库存率 DESC`
  },
  
  // 专项分析规则 - Priority 40
  {
    intent_name: '结构件类深度不良分析',
    description: '深度分析结构件类物料的不良模式和改善建议',
    priority: 40,
    category: '专项分析规则',
    trigger_words: JSON.stringify(['结构件不良', '结构件缺陷', '结构件改善']),
    action_target: `
SELECT 
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_description as 不良描述,
  COUNT(*) as 发生次数,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as 占总不良比例,
  DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 首次发现,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最近发现,
  DATEDIFF(MAX(test_date), MIN(test_date)) as 持续天数,
  CASE 
    WHEN COUNT(*) >= 10 THEN '高频不良'
    WHEN COUNT(*) >= 5 THEN '中频不良'
    ELSE '低频不良'
  END as 不良等级,
  CASE 
    WHEN defect_description LIKE '%划伤%' OR defect_description LIKE '%破裂%' THEN '外观缺陷'
    WHEN defect_description LIKE '%尺寸%' OR defect_description LIKE '%松动%' THEN '尺寸问题'
    WHEN defect_description LIKE '%色差%' OR defect_description LIKE '%掉色%' THEN '颜色问题'
    ELSE '其他问题'
  END as 问题分类
FROM test_tracking 
WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件')
  AND test_result = 'NG'
  AND defect_description IS NOT NULL
GROUP BY material_name, supplier_name, defect_description
ORDER BY 发生次数 DESC, material_name`
  },
  
  {
    intent_name: '光学类显示缺陷专项分析',
    description: '专项分析光学类显示器件的缺陷模式',
    priority: 40,
    category: '专项分析规则',
    trigger_words: JSON.stringify(['显示缺陷', '光学不良', '屏幕问题']),
    action_target: `
SELECT 
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_description as 缺陷描述,
  COUNT(*) as 发生次数,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(PARTITION BY material_name), 2) as 该物料占比,
  CASE 
    WHEN defect_description LIKE '%漏光%' OR defect_description LIKE '%亮线%' THEN '背光问题'
    WHEN defect_description LIKE '%暗点%' OR defect_description LIKE '%亮点%' THEN '像素问题'
    WHEN defect_description LIKE '%色差%' OR defect_description LIKE '%偏色%' THEN '色彩问题'
    WHEN defect_description LIKE '%闪屏%' OR defect_description LIKE '%mura%' THEN '显示异常'
    ELSE '其他问题'
  END as 缺陷类型,
  CASE 
    WHEN material_name = 'LCD显示屏' THEN 'LCD特有'
    WHEN material_name = 'OLED显示屏' THEN 'OLED特有'
    ELSE '通用问题'
  END as 技术特性,
  AVG(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良率
FROM test_tracking 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组')
  AND defect_description IS NOT NULL
GROUP BY material_name, supplier_name, defect_description
HAVING 发生次数 >= 2
ORDER BY 发生次数 DESC, material_name`
  },
  
  // 趋势对比规则 - Priority 50
  {
    intent_name: '物料大类别月度质量趋势',
    description: '分析各物料大类别的月度质量变化趋势',
    priority: 50,
    category: '趋势对比规则',
    trigger_words: JSON.stringify(['大类别趋势', '月度质量', '类别变化']),
    action_target: `
SELECT 
  DATE_FORMAT(test_date, '%Y-%m') as 月份,
  CASE 
    WHEN material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件') THEN '结构件类'
    WHEN material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组') THEN '光学类'
    WHEN material_name IN ('电池', '充电器') THEN '充电类'
    WHEN material_name IN ('喇叭', '听筒') THEN '声学类'
    WHEN material_name IN ('保护套', '标签', '包装盒') THEN '包材类'
    ELSE '其他'
  END as 物料大类别,
  COUNT(*) as 测试次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
  LAG(ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2)) 
    OVER(PARTITION BY CASE 
      WHEN material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件') THEN '结构件类'
      WHEN material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组') THEN '光学类'
      WHEN material_name IN ('电池', '充电器') THEN '充电类'
      WHEN material_name IN ('喇叭', '听筒') THEN '声学类'
      WHEN material_name IN ('保护套', '标签', '包装盒') THEN '包材类'
      ELSE '其他'
    END ORDER BY 月份) as 上月通过率,
  ROUND(
    ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) -
    LAG(ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2)) 
      OVER(PARTITION BY CASE 
        WHEN material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件') THEN '结构件类'
        WHEN material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组') THEN '光学类'
        WHEN material_name IN ('电池', '充电器') THEN '充电类'
        WHEN material_name IN ('喇叭', '听筒') THEN '声学类'
        WHEN material_name IN ('保护套', '标签', '包装盒') THEN '包材类'
        ELSE '其他'
      END ORDER BY 月份), 2
  ) as 环比变化
FROM test_tracking 
WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒')
  AND test_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY 月份, 物料大类别
ORDER BY 月份 DESC, 物料大类别`
  }
];

async function createAdvancedCategoryRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🚀 开始创建高级物料大类别规则...\n');
    
    // 插入高级规则
    for (const rule of ADVANCED_CATEGORY_RULES) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target, 
          trigger_words, priority, category, status, example_query, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        description = VALUES(description),
        action_target = VALUES(action_target),
        trigger_words = VALUES(trigger_words),
        priority = VALUES(priority),
        category = VALUES(category),
        updated_at = CURRENT_TIMESTAMP
      `, [
        rule.intent_name,
        rule.description,
        'SQL_QUERY',
        rule.action_target,
        rule.trigger_words,
        rule.priority,
        rule.category,
        'active',
        `分析${rule.intent_name.replace('分析', '').replace('排行', '')}`
      ]);
      
      console.log(`✅ 创建高级规则: ${rule.intent_name}`);
    }
    
    // 统计所有物料大类别相关规则
    console.log('\n📊 统计物料大类别规则...');
    
    const [allCategoryRules] = await connection.execute(`
      SELECT 
        category,
        priority,
        COUNT(*) as rule_count
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%类%' 
         OR intent_name LIKE '%大类别%'
         OR intent_name LIKE '%结构件%'
         OR intent_name LIKE '%光学%'
         OR intent_name LIKE '%充电%'
         OR intent_name LIKE '%声学%'
         OR intent_name LIKE '%包材%'
      GROUP BY category, priority
      ORDER BY priority, category
    `);
    
    console.log('物料大类别规则分布:');
    allCategoryRules.forEach(stat => {
      console.log(`  ${stat.category} (Priority ${stat.priority}): ${stat.rule_count}个规则`);
    });
    
    // 获取详细规则列表
    const [detailRules] = await connection.execute(`
      SELECT intent_name, category, priority
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%类%' 
         OR intent_name LIKE '%大类别%'
         OR intent_name LIKE '%结构件%'
         OR intent_name LIKE '%光学%'
         OR intent_name LIKE '%充电%'
         OR intent_name LIKE '%声学%'
         OR intent_name LIKE '%包材%'
      ORDER BY priority, intent_name
    `);
    
    console.log(`\n📋 物料大类别相关规则详情 (共${detailRules.length}个):`);
    detailRules.forEach((rule, i) => {
      console.log(`  ${i+1}. ${rule.intent_name} (${rule.category}, Priority: ${rule.priority})`);
    });
    
    console.log('\n🎉 高级物料大类别规则创建完成！');
    
  } catch (error) {
    console.error('❌ 创建高级规则失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdvancedCategoryRules();
