// 添加更多规则以覆盖所有查询场景
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 更多规则
const MORE_RULES = [
  {
    intent_name: '按物料名称查询库存',
    description: '根据物料名称查询库存',
    action_target: `SELECT 
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
      SUBSTRING_INDEX(storage_location, '-', -1) as '仓库',
      material_code as '物料编码',
      material_name as '物料名称',
      supplier_name as '供应商',
      quantity as '数量',
      status as '状态',
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as '入库时间'
    FROM inventory 
    WHERE material_name LIKE '%{material}%' 
    ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['物料库存', '{material}库存', '{material}的库存', '查询{material}']),
    example_query: '查询电池盖的库存',
    priority: 8
  },

  {
    intent_name: '按状态查询库存',
    description: '根据状态查询库存',
    action_target: `SELECT 
      material_name as '物料名称',
      supplier_name as '供应商',
      quantity as '数量',
      status as '状态',
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as '入库时间'
    FROM inventory 
    WHERE status = '{status}' 
    ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['{status}状态库存', '{status}的库存', '状态为{status}', '查询{status}状态']),
    example_query: '查询正常状态的库存',
    priority: 7
  },

  {
    intent_name: '库存数量统计',
    description: '统计库存总数量',
    action_target: `SELECT 
      '库存统计' as '统计类型',
      COUNT(*) as '总记录数',
      SUM(quantity) as '总数量',
      COUNT(DISTINCT supplier_name) as '供应商数量',
      COUNT(DISTINCT material_name) as '物料种类'
    FROM inventory`,
    trigger_words: JSON.stringify(['库存统计', '库存总数', '库存数量', '有多少库存']),
    example_query: '统计库存数量',
    priority: 6
  },

  {
    intent_name: '物料种类统计',
    description: '统计系统中的物料种类',
    action_target: `SELECT 
      material_name as '物料名称',
      COUNT(*) as '库存记录数',
      SUM(quantity) as '总数量',
      COUNT(DISTINCT supplier_name) as '供应商数量'
    FROM inventory 
    WHERE material_name IS NOT NULL 
    GROUP BY material_name 
    ORDER BY COUNT(*) DESC`,
    trigger_words: JSON.stringify(['物料统计', '有哪些物料', '物料种类', '物料列表']),
    example_query: '系统里有哪些物料？',
    priority: 6
  },

  {
    intent_name: '按测试结果查询检验数据',
    description: '根据测试结果查询检验数据',
    action_target: `SELECT 
      test_id as '测试编号',
      DATE_FORMAT(test_date, '%Y-%m-%d') as '日期',
      material_name as '物料名称',
      supplier_name as '供应商',
      test_result as '测试结果',
      COALESCE(defect_desc, '') as '不合格描述',
      COALESCE(conclusion, '') as '备注'
    FROM lab_tests 
    WHERE test_result = '{result}' 
    ORDER BY test_date DESC`,
    trigger_words: JSON.stringify(['{result}的检验', '测试结果{result}', '{result}测试', '检验{result}']),
    example_query: '查询合格的检验数据',
    priority: 8
  },

  {
    intent_name: '按工厂查询生产数据',
    description: '根据工厂查询生产数据',
    action_target: `SELECT 
      id as '测试编号',
      DATE_FORMAT(online_date, '%Y-%m-%d') as '日期',
      project as '项目',
      workshop as '基线',
      material_name as '物料名称',
      supplier_name as '供应商',
      CONCAT('不良率: ', ROUND(defect_rate * 100, 2), '%') as '不合格描述',
      CONCAT('工厂: ', factory) as '备注'
    FROM online_tracking 
    WHERE factory LIKE '%{factory}%' 
    ORDER BY online_date DESC`,
    trigger_words: JSON.stringify(['{factory}工厂', '{factory}生产', '{factory}的生产数据']),
    example_query: '查询深圳工厂的生产数据',
    priority: 8
  },

  {
    intent_name: '最近入库物料',
    description: '查询最近入库的物料',
    action_target: `SELECT 
      material_name as '物料名称',
      supplier_name as '供应商',
      quantity as '数量',
      status as '状态',
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
      DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as '入库时间'
    FROM inventory 
    WHERE inbound_time >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
    ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['最近入库', '近期入库', '本周入库', '最新库存']),
    example_query: '查询最近入库的物料',
    priority: 7
  },

  {
    intent_name: '质量问题汇总',
    description: '汇总所有质量问题',
    action_target: `SELECT 
      '检验不合格' as '问题类型',
      COUNT(*) as '问题数量',
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as '涉及物料'
    FROM lab_tests 
    WHERE test_result NOT IN ('合格', 'pass', 'passed')
    UNION ALL
    SELECT 
      '高不良率生产' as '问题类型',
      COUNT(*) as '问题数量',
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as '涉及物料'
    FROM online_tracking 
    WHERE defect_rate > 0.05
    UNION ALL
    SELECT 
      '异常库存状态' as '问题类型',
      COUNT(*) as '问题数量',
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as '涉及物料'
    FROM inventory 
    WHERE status != 'normal'`,
    trigger_words: JSON.stringify(['质量问题', '问题汇总', '质量异常', '问题统计']),
    example_query: '汇总质量问题',
    priority: 8
  },

  {
    intent_name: '系统数据概览',
    description: '查看系统整体数据概况',
    action_target: `SELECT 
      '数据概览' as '统计项目',
      (SELECT COUNT(*) FROM inventory) as '库存记录数',
      (SELECT COUNT(*) FROM lab_tests) as '检验记录数',
      (SELECT COUNT(*) FROM online_tracking) as '生产记录数',
      (SELECT COUNT(DISTINCT supplier_name) FROM inventory WHERE supplier_name IS NOT NULL) as '供应商数量',
      (SELECT COUNT(DISTINCT material_name) FROM inventory WHERE material_name IS NOT NULL) as '物料种类数'`,
    trigger_words: JSON.stringify(['系统概览', '数据概况', '整体数据', '系统统计', '数据总览']),
    example_query: '查看系统数据概览',
    priority: 5
  },

  {
    intent_name: '供应商质量分析',
    description: '分析供应商的质量表现',
    action_target: `SELECT 
      i.supplier_name as '供应商',
      COUNT(i.id) as '库存记录数',
      COUNT(l.id) as '检验记录数',
      SUM(CASE WHEN l.test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) as '合格数',
      ROUND(SUM(CASE WHEN l.test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) * 100.0 / COUNT(l.id), 2) as '合格率%'
    FROM inventory i 
    LEFT JOIN lab_tests l ON i.material_code = l.material_code 
    WHERE i.supplier_name IS NOT NULL 
    GROUP BY i.supplier_name 
    ORDER BY COUNT(i.id) DESC`,
    trigger_words: JSON.stringify(['供应商质量', '供应商分析', '质量分析', '供应商表现']),
    example_query: '分析供应商质量表现',
    priority: 5
  }
];

async function addMoreRules() {
  let connection;
  
  try {
    console.log('🚀 添加更多规则...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    let insertedCount = 0;
    
    for (const rule of MORE_RULES) {
      try {
        await connection.execute(`
          INSERT INTO assistant_rules (
            intent_name, description, action_type, action_target,
            trigger_words, example_query, priority, status, created_at
          ) VALUES (?, ?, 'SQL_QUERY', ?, ?, ?, ?, 'active', NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.action_target,
          rule.trigger_words,
          rule.example_query,
          rule.priority
        ]);
        
        insertedCount++;
        console.log(`✅ 已插入规则: ${rule.intent_name}`);
        
      } catch (error) {
        console.error(`❌ 插入规则失败 [${rule.intent_name}]:`, error.message);
      }
    }
    
    console.log(`\n🎉 规则添加完成！共添加 ${insertedCount} 条规则`);
    
    // 统计总规则数
    const [totalRules] = await connection.execute('SELECT COUNT(*) as count FROM assistant_rules WHERE status = "active"');
    console.log(`📊 当前总活跃规则数量: ${totalRules[0].count}`);
    
  } catch (error) {
    console.error('❌ 添加规则失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMoreRules();
