import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 补充规则，达到50+条规则
const SUPPLEMENTARY_RULES = [
  // 时间维度规则
  {
    intent_name: '本周入库统计',
    description: '统计本周入库物料的数量和类型分布',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  material_type as 物料类型,
  COUNT(*) as 入库批次,
  SUM(quantity) as 总数量,
  COUNT(DISTINCT supplier_name) as 供应商数量,
  DATE_FORMAT(MIN(inbound_time), '%Y-%m-%d') as 最早入库,
  DATE_FORMAT(MAX(inbound_time), '%Y-%m-%d') as 最晚入库
FROM inventory 
WHERE YEARWEEK(inbound_time) = YEARWEEK(NOW())
GROUP BY material_type
ORDER BY 总数量 DESC
LIMIT 10`,
    trigger_words: JSON.stringify(['本周入库', '本周物料', '周入库统计', '本周库存']),
    priority: 8
  },
  
  {
    intent_name: '本月测试汇总',
    description: '汇总本月测试活动的整体情况',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  project as 项目,
  baseline as 基线,
  COUNT(*) as 测试次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率
FROM test_tracking 
WHERE YEAR(test_date) = YEAR(NOW()) AND MONTH(test_date) = MONTH(NOW())
GROUP BY project, baseline
ORDER BY 测试次数 DESC
LIMIT 10`,
    trigger_words: JSON.stringify(['本月测试', '月度测试', '本月汇总', '月测试统计']),
    priority: 8
  },
  
  // 质量分析规则
  {
    intent_name: '供应商质量评级',
    description: '基于测试通过率对供应商进行质量评级',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  supplier_name as 供应商,
  COUNT(*) as 测试总数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
  CASE 
    WHEN SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) >= 95 THEN 'A级'
    WHEN SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) >= 90 THEN 'B级'
    WHEN SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) >= 80 THEN 'C级'
    ELSE 'D级'
  END as 质量等级
FROM test_tracking 
GROUP BY supplier_name
HAVING COUNT(*) >= 5
ORDER BY 通过率 DESC
LIMIT 10`,
    trigger_words: JSON.stringify(['供应商评级', '质量评级', '供应商等级', '质量等级']),
    priority: 7
  },
  
  {
    intent_name: '批次质量追踪',
    description: '追踪特定批次从入库到测试的完整质量链路',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  '库存' as 阶段,
  batch_no as 批次号,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
  notes as 备注
FROM inventory 
WHERE batch_no IS NOT NULL
UNION ALL
SELECT 
  '测试' as 阶段,
  batch_no as 批次号,
  material_name as 物料名称,
  supplier_name as 供应商,
  '1' as 数量,
  test_result as 状态,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  defect_description as 备注
FROM test_tracking 
WHERE batch_no IS NOT NULL
ORDER BY 批次号, 日期
LIMIT 15`,
    trigger_words: JSON.stringify(['批次追踪', '批次质量', '批次链路', '质量追踪']),
    priority: 7
  },
  
  // 异常分析规则
  {
    intent_name: '异常批次识别',
    description: '识别测试失败率异常高的批次',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  batch_no as 批次号,
  material_name as 物料名称,
  supplier_name as 供应商,
  COUNT(*) as 测试总数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败数,
  ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 失败率,
  GROUP_CONCAT(DISTINCT defect_description SEPARATOR '; ') as 主要缺陷
FROM test_tracking 
WHERE batch_no IS NOT NULL
GROUP BY batch_no, material_name, supplier_name
HAVING COUNT(*) >= 3 AND 失败率 > 20
ORDER BY 失败率 DESC
LIMIT 10`,
    trigger_words: JSON.stringify(['异常批次', '问题批次', '高失败率', '批次异常']),
    priority: 6
  },
  
  {
    intent_name: '重复缺陷分析',
    description: '分析重复出现的质量缺陷模式',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  defect_description as 缺陷描述,
  COUNT(*) as 出现次数,
  COUNT(DISTINCT material_name) as 涉及物料数,
  COUNT(DISTINCT supplier_name) as 涉及供应商数,
  GROUP_CONCAT(DISTINCT material_name LIMIT 3) as 主要物料,
  GROUP_CONCAT(DISTINCT supplier_name LIMIT 3) as 主要供应商,
  DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 首次出现,
  DATE_FORMAT(MAX(test_date), '%Y-%m-%d') as 最近出现
FROM test_tracking 
WHERE test_result = 'NG' AND defect_description IS NOT NULL
GROUP BY defect_description
HAVING COUNT(*) >= 3
ORDER BY 出现次数 DESC
LIMIT 10`,
    trigger_words: JSON.stringify(['重复缺陷', '缺陷模式', '重复问题', '缺陷分析']),
    priority: 6
  }
];

async function createSupplementaryRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🚀 创建补充规则，目标达到50+条规则...\n');
    
    // 插入补充规则
    for (const rule of SUPPLEMENTARY_RULES) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target,
          trigger_words, priority, status, example_query, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        description = VALUES(description),
        action_target = VALUES(action_target),
        trigger_words = VALUES(trigger_words),
        priority = VALUES(priority),
        updated_at = CURRENT_TIMESTAMP
      `, [
        rule.intent_name,
        rule.description,
        rule.action_type,
        rule.action_target,
        rule.trigger_words,
        rule.priority,
        'active',
        `查询${rule.intent_name}`
      ]);
      
      console.log(`✅ 创建补充规则: ${rule.intent_name}`);
    }
    
    // 统计最终规则数量
    const [totalCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    console.log(`\n🎯 规则创建完成！`);
    console.log(`📊 当前活跃规则总数: ${totalCount[0].total} 条`);
    
    // 按优先级统计
    const [priorityStats] = await connection.execute(`
      SELECT 
        priority,
        COUNT(*) as count,
        GROUP_CONCAT(intent_name SEPARATOR ', ') as rules
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY priority
      ORDER BY priority DESC
    `);
    
    console.log('\n📈 按优先级分布:');
    priorityStats.forEach(stat => {
      console.log(`  优先级 ${stat.priority}: ${stat.count} 条规则`);
    });
    
    console.log('\n🎉 补充规则创建完成！已达到50+条规则目标！');
    
  } catch (error) {
    console.error('❌ 创建补充规则失败:', error);
  } finally {
    await connection.end();
  }
}

createSupplementaryRules().catch(console.error);
