import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于物料大类别的NLP规则定义
const MATERIAL_CATEGORY_RULES = [
  // 基础查询规则 - Priority 10
  {
    intent_name: '结构件类物料查询',
    description: '查询结构件类物料的库存、测试、上线情况',
    priority: 10,
    category: '基础查询规则',
    trigger_words: JSON.stringify(['结构件', '电池盖', '中框', '手机卡托', '侧键', '装饰件']),
    action_target: `
SELECT 
  '库存' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
  notes as 备注
FROM inventory 
WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件')
UNION ALL
SELECT 
  '测试' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT(test_result, '次') as 数量,
  test_result as 状态,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  defect_description as 备注
FROM test_tracking 
WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件')
ORDER BY 日期 DESC
LIMIT 10`
  },
  
  {
    intent_name: '光学类物料查询',
    description: '查询光学类物料的库存、测试、上线情况',
    priority: 10,
    category: '基础查询规则',
    trigger_words: JSON.stringify(['光学', 'LCD', 'OLED', '显示屏', '摄像头']),
    action_target: `
SELECT 
  '库存' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
  notes as 备注
FROM inventory 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组')
UNION ALL
SELECT 
  '测试' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT(test_result, '次') as 数量,
  test_result as 状态,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  defect_description as 备注
FROM test_tracking 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组')
ORDER BY 日期 DESC
LIMIT 10`
  },
  
  {
    intent_name: '充电类物料查询',
    description: '查询充电类物料的库存、测试、上线情况',
    priority: 10,
    category: '基础查询规则',
    trigger_words: JSON.stringify(['充电', '电池', '充电器']),
    action_target: `
SELECT 
  '库存' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
  notes as 备注
FROM inventory 
WHERE material_name IN ('电池', '充电器')
UNION ALL
SELECT 
  '测试' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT(test_result, '次') as 数量,
  test_result as 状态,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  defect_description as 备注
FROM test_tracking 
WHERE material_name IN ('电池', '充电器')
ORDER BY 日期 DESC
LIMIT 10`
  },
  
  {
    intent_name: '声学类物料查询',
    description: '查询声学类物料的库存、测试、上线情况',
    priority: 10,
    category: '基础查询规则',
    trigger_words: JSON.stringify(['声学', '喇叭', '听筒', '音频']),
    action_target: `
SELECT 
  '库存' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
  notes as 备注
FROM inventory 
WHERE material_name IN ('喇叭', '听筒')
UNION ALL
SELECT 
  '测试' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT(test_result, '次') as 数量,
  test_result as 状态,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  defect_description as 备注
FROM test_tracking 
WHERE material_name IN ('喇叭', '听筒')
ORDER BY 日期 DESC
LIMIT 10`
  },
  
  {
    intent_name: '包材类物料查询',
    description: '查询包材类物料的库存、测试、上线情况',
    priority: 10,
    category: '基础查询规则',
    trigger_words: JSON.stringify(['包材', '保护套', '标签', '包装盒']),
    action_target: `
SELECT 
  '库存' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
  notes as 备注
FROM inventory 
WHERE material_name IN ('保护套', '标签', '包装盒')
UNION ALL
SELECT 
  '测试' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT(test_result, '次') as 数量,
  test_result as 状态,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  defect_description as 备注
FROM test_tracking 
WHERE material_name IN ('保护套', '标签', '包装盒')
ORDER BY 日期 DESC
LIMIT 10`
  },
  
  // 进阶分析规则 - Priority 20
  {
    intent_name: '物料大类别质量对比',
    description: '对比各物料大类别的质量表现',
    priority: 20,
    category: '进阶分析规则',
    trigger_words: JSON.stringify(['大类别对比', '类别质量', '物料类别分析']),
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
  COUNT(*) as 测试总次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
  COUNT(DISTINCT supplier_name) as 供应商数量
FROM test_tracking 
WHERE material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒')
GROUP BY 物料大类别
ORDER BY 通过率 DESC`
  },
  
  {
    intent_name: '大类别Top不良分析',
    description: '分析各物料大类别的主要不良问题',
    priority: 20,
    category: '进阶分析规则',
    trigger_words: JSON.stringify(['大类别不良', '类别缺陷', '主要问题']),
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
  defect_description as 主要不良,
  COUNT(*) as 出现次数,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(PARTITION BY CASE 
    WHEN material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件') THEN '结构件类'
    WHEN material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头模组') THEN '光学类'
    WHEN material_name IN ('电池', '充电器') THEN '充电类'
    WHEN material_name IN ('喇叭', '听筒') THEN '声学类'
    WHEN material_name IN ('保护套', '标签', '包装盒') THEN '包材类'
    ELSE '其他'
  END), 2) as 占比
FROM test_tracking 
WHERE test_result = 'NG' 
  AND defect_description IS NOT NULL 
  AND defect_description != ''
  AND material_name IN ('电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头模组', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒')
GROUP BY 物料大类别, defect_description
ORDER BY 物料大类别, 出现次数 DESC`
  }
];

async function createMaterialCategoryRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('📝 开始创建物料大类别NLP规则...\n');
    
    // 插入规则
    for (const rule of MATERIAL_CATEGORY_RULES) {
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
        `查询${rule.intent_name.replace('查询', '').replace('分析', '')}`
      ]);
      
      console.log(`✅ 创建规则: ${rule.intent_name}`);
    }
    
    // 验证规则创建结果
    console.log('\n📊 验证规则创建结果...');
    
    const [categoryRules] = await connection.execute(`
      SELECT intent_name, category, priority
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%类%' OR intent_name LIKE '%大类别%'
      ORDER BY priority, intent_name
    `);
    
    console.log(`✅ 物料大类别相关规则: ${categoryRules.length}个`);
    
    categoryRules.forEach((rule, i) => {
      console.log(`  ${i+1}. ${rule.intent_name} (${rule.category}, Priority: ${rule.priority})`);
    });
    
    console.log('\n🎉 物料大类别NLP规则创建完成！');
    
  } catch (error) {
    console.error('❌ 创建物料大类别规则失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createMaterialCategoryRules();
