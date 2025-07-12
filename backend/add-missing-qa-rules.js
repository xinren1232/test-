import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function addMissingQARules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 添加缺失的智能问答规则...\n');
    
    // 定义缺失的规则
    const missingRules = [
      // 风险库存查询
      {
        intent_name: '风险库存查询',
        description: '查询风险状态的库存物料',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  notes as 备注
FROM inventory 
WHERE status = '风险'
ORDER BY inbound_time DESC 
LIMIT 10`,
        trigger_words: JSON.stringify(['风险', '风险库存', '风险物料', '风险状态', '查询风险']),
        example_query: '查询风险状态的库存',
        category: '库存查询',
        priority: 5,
        status: 'active'
      },
      
      // 批次综合信息查询
      {
        intent_name: '批次综合信息查询',
        description: '查询批次的综合信息（库存+测试+上线）',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  b.batch_code as 批次号,
  b.material_code as 物料编码,
  b.material_name as 物料名称,
  b.supplier_name as 供应商,
  b.quantity as 数量,
  DATE_FORMAT(b.inbound_date, '%Y-%m-%d') as 入库日期,
  b.production_exceptions as 产线异常,
  b.test_exceptions as 测试异常,
  b.notes as 备注
FROM batch_management b
ORDER BY b.inbound_date DESC
LIMIT 10`,
        trigger_words: JSON.stringify(['批次综合', '批次信息', '批次详情', '综合信息', '批次查询']),
        example_query: '查询批次的综合信息（库存+测试+上线）',
        category: '批次查询',
        priority: 6,
        status: 'active'
      },
      
      // Top缺陷排行查询
      {
        intent_name: 'Top缺陷排行查询',
        description: '查询Top缺陷排行统计',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  defect_desc as 缺陷描述,
  COUNT(*) as 出现次数,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result = 'NG'), 2) as 占比百分比
FROM lab_tests 
WHERE test_result = 'NG' 
  AND defect_desc IS NOT NULL 
  AND defect_desc != ''
GROUP BY defect_desc
ORDER BY COUNT(*) DESC
LIMIT 10`,
        trigger_words: JSON.stringify(['Top缺陷', '缺陷排行', '主要缺陷', '缺陷统计', '缺陷排名']),
        example_query: '查询Top缺陷排行',
        category: '统计分析',
        priority: 7,
        status: 'active'
      },
      
      // 供应商对比分析
      {
        intent_name: '供应商对比分析',
        description: '对比不同供应商的质量表现',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  supplier_name as 供应商,
  COUNT(*) as 总测试次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率百分比
FROM lab_tests 
WHERE supplier_name IN (?, ?)
GROUP BY supplier_name
ORDER BY 通过率百分比 DESC`,
        trigger_words: JSON.stringify(['供应商对比', '供应商比较', '对比供应商', '供应商分析', '供应商表现']),
        example_query: '对比聚龙和天马供应商表现',
        category: '对比分析',
        priority: 8,
        status: 'active'
      },
      
      // 物料对比分析
      {
        intent_name: '物料对比分析',
        description: '对比不同物料的质量表现',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  material_name as 物料名称,
  COUNT(*) as 总测试次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率百分比
FROM lab_tests 
WHERE material_name IN (?, ?)
GROUP BY material_name
ORDER BY 通过率百分比 DESC`,
        trigger_words: JSON.stringify(['物料对比', '物料比较', '对比物料', '物料分析', '物料表现']),
        example_query: '对比电池和LCD显示屏质量表现',
        category: '对比分析',
        priority: 8,
        status: 'active'
      },
      
      // 精确物料查询
      {
        intent_name: '精确物料查询',
        description: '精确查询物料（完全匹配，排除相似物料）',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  notes as 备注
FROM inventory 
WHERE material_name = ?
  AND NOT (
    (? = '电池' AND material_name LIKE '%电池盖%')
    OR (? = '显示' AND material_name LIKE '%显示器%')
  )
ORDER BY inbound_time DESC 
LIMIT 10`,
        trigger_words: JSON.stringify(['精确查询', '准确查询', '完全匹配', '精确匹配', '精准查询']),
        example_query: '精确查询电池（排除电池盖）',
        category: '精确查询',
        priority: 9,
        status: 'active'
      },
      
      // 智能物料匹配
      {
        intent_name: '智能物料匹配',
        description: '智能匹配相关物料，自动排除不相关的',
        action_type: 'SQL_QUERY',
        action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  notes as 备注
FROM inventory 
WHERE (
  material_name LIKE CONCAT('%', ?, '%')
  OR material_name LIKE CONCAT(?, '%')
)
AND NOT (
  (? = '显示' AND material_name LIKE '%显示器%')
  OR (? = '电池' AND material_name LIKE '%电池盖%')
)
ORDER BY 
  CASE 
    WHEN material_name = ? THEN 1
    WHEN material_name LIKE CONCAT(?, '%') THEN 2
    ELSE 3
  END,
  inbound_time DESC 
LIMIT 10`,
        trigger_words: JSON.stringify(['智能匹配', '智能查询', '智能搜索', '相关物料', '匹配物料']),
        example_query: '智能匹配显示相关物料',
        category: '智能查询',
        priority: 9,
        status: 'active'
      }
    ];
    
    // 添加规则到数据库
    for (const rule of missingRules) {
      // 检查规则是否已存在
      const [existing] = await connection.execute(`
        SELECT id FROM nlp_intent_rules WHERE intent_name = ?
      `, [rule.intent_name]);
      
      if (existing.length === 0) {
        await connection.execute(`
          INSERT INTO nlp_intent_rules 
          (intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target.trim(),
          rule.trigger_words,
          rule.example_query,
          rule.category,
          rule.priority,
          rule.status
        ]);
        
        console.log(`✅ 已添加规则: ${rule.intent_name}`);
      } else {
        console.log(`⚠️  规则已存在: ${rule.intent_name}`);
      }
    }
    
    // 验证添加结果
    console.log('\n🔍 验证添加结果...');
    
    for (const rule of missingRules) {
      const [result] = await connection.execute(`
        SELECT intent_name, status FROM nlp_intent_rules WHERE intent_name = ?
      `, [rule.intent_name]);
      
      if (result.length > 0) {
        console.log(`✅ ${rule.intent_name}: ${result[0].status}`);
      } else {
        console.log(`❌ ${rule.intent_name}: 未找到`);
      }
    }
    
    // 统计总规则数
    const [totalRules] = await connection.execute(`
      SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = 'active'
    `);
    
    console.log(`\n📊 当前活跃规则总数: ${totalRules[0].count}`);
    console.log('\n🎯 缺失规则添加完成！');
    
  } catch (error) {
    console.error('❌ 添加规则失败:', error);
  } finally {
    await connection.end();
  }
}

addMissingQARules();
