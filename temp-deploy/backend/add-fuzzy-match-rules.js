import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function addFuzzyMatchRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 添加模糊匹配规则作为补充...\n');
    
    const fuzzyRules = [
      {
        intent_name: '物料相关查询',
        description: '模糊匹配查询包含指定关键词的相关物料信息（库存+测试）',
        action_type: 'SQL_QUERY',
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
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
UNION ALL
SELECT 
  '测试' as 数据来源,
  material_name as 物料名称,
  supplier_name as 供应商,
  CASE 
    WHEN test_result = 'OK' THEN '1次OK'
    WHEN test_result = 'NG' THEN '1次NG'
    ELSE test_result
  END as 数量,
  test_result as 状态,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  defect_description as 备注
FROM test_tracking 
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY 日期 DESC
LIMIT 15`,
        trigger_words: JSON.stringify(['相关物料', '包含', '类似', '模糊查询', '相关查询', '物料相关']),
        priority: 8,
        category: '中级规则',
        status: 'active',
        example_query: '查询电池相关物料'
      },
      
      {
        intent_name: '在线跟踪相关查询',
        description: '模糊匹配查询包含指定关键词的相关物料在线跟踪信息',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT
  material_name as 物料名称,
  supplier_name as 供应商,
  line as 生产线,
  project as 项目,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
  factory as 工厂,
  workshop as 车间,
  batch_code as 批次号,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
  exception_count as 异常次数
FROM online_tracking
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
ORDER BY online_date DESC
LIMIT 10`,
        trigger_words: JSON.stringify(['相关跟踪', '包含跟踪', '类似跟踪', '模糊跟踪', '跟踪相关']),
        priority: 8,
        category: '中级规则',
        status: 'active',
        example_query: '查询电池相关跟踪'
      },
      
      {
        intent_name: '物料系列查询',
        description: '查询物料系列（如电池系列包括电池、电池盖等）',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(*) as 库存记录数,
  SUM(quantity) as 总库存量,
  GROUP_CONCAT(DISTINCT status) as 状态列表,
  GROUP_CONCAT(DISTINCT factory) as 工厂列表,
  MAX(DATE_FORMAT(inbound_time, '%Y-%m-%d')) as 最新入库日期
FROM inventory 
WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY material_name, supplier_name
ORDER BY 总库存量 DESC
LIMIT 10`,
        trigger_words: JSON.stringify(['物料系列', '系列查询', '全系列', '整个系列']),
        priority: 7,
        category: '高级规则',
        status: 'active',
        example_query: '查询电池系列物料'
      }
    ];
    
    for (const rule of fuzzyRules) {
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
        rule.action_type,
        rule.action_target,
        rule.trigger_words,
        rule.priority,
        rule.category,
        rule.status,
        rule.example_query
      ]);
      
      console.log(`✅ 创建模糊匹配规则: ${rule.intent_name}`);
    }
    
    // 统计最终规则数量
    const [totalCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    console.log(`\n🎯 模糊匹配规则添加完成！`);
    console.log(`📊 当前活跃规则总数: ${totalCount[0].total} 条`);
    
    console.log('\n📋 现在用户可以使用:');
    console.log('1. 精准匹配: "查询电池" -> 只返回名称为"电池"的物料');
    console.log('2. 模糊匹配: "查询电池相关物料" -> 返回包含"电池"的所有物料');
    console.log('3. 系列查询: "查询电池系列" -> 返回电池系列的汇总信息');
    
  } catch (error) {
    console.error('❌ 添加模糊匹配规则失败:', error);
  } finally {
    await connection.end();
  }
}

addFuzzyMatchRules();
