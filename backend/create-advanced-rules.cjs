// 创建高级规则系统 - 覆盖所有查询场景
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 高级规则模板 - 覆盖更多查询场景
const ADVANCED_RULES = [
  // === 批次相关查询 ===
  {
    intent_name: '按批次查询库存',
    description: '根据批次号查询库存信息',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
      SUBSTRING_INDEX(storage_location, '-', -1) as '仓库',
      material_code as '物料编码',
      material_name as '物料名称',
      material_type as '物料类型',
      supplier_name as '供应商',
      batch_code as '批次号',
      quantity as '数量',
      status as '状态',
      DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as '入库时间',
      COALESCE(notes, '') as '备注'
    FROM inventory 
    WHERE batch_code LIKE '%{batch}%' 
    ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['批次查询', '批次{batch}', '{batch}批次', '查询批次{batch}']),
    example_query: '查询批次411013的库存',
    priority: 8
  },

  // === 数量范围查询 ===
  {
    intent_name: '大批量库存查询',
    description: '查询数量大于指定值的库存',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
      material_name as '物料名称',
      supplier_name as '供应商',
      quantity as '数量',
      status as '状态',
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as '入库时间'
    FROM inventory 
    WHERE quantity > 100 
    ORDER BY quantity DESC`,
    trigger_words: JSON.stringify(['大批量库存', '数量大的库存', '库存量大', '大量库存']),
    example_query: '查询大批量库存',
    priority: 6
  },

  {
    intent_name: '低库存预警',
    description: '查询数量较少的库存，用于预警',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      material_name as '物料名称',
      supplier_name as '供应商',
      quantity as '数量',
      status as '状态',
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂'
    FROM inventory 
    WHERE quantity < 50 
    ORDER BY quantity ASC`,
    trigger_words: JSON.stringify(['低库存', '库存不足', '库存预警', '少量库存']),
    example_query: '查询低库存预警',
    priority: 7
  },

  // === 工厂和仓库查询 ===
  {
    intent_name: '按工厂查询库存',
    description: '根据工厂查询库存分布',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
      SUBSTRING_INDEX(storage_location, '-', -1) as '仓库',
      material_name as '物料名称',
      supplier_name as '供应商',
      quantity as '数量',
      status as '状态'
    FROM inventory 
    WHERE storage_location LIKE '%{factory}%' 
    ORDER BY quantity DESC`,
    trigger_words: JSON.stringify(['{factory}工厂库存', '{factory}的库存', '工厂{factory}', '{factory}工厂']),
    example_query: '查询深圳工厂的库存',
    priority: 8
  },

  // === 状态组合查询 ===
  {
    intent_name: '异常状态库存',
    description: '查询所有异常状态的库存',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      material_name as '物料名称',
      supplier_name as '供应商',
      quantity as '数量',
      status as '状态',
      risk_level as '风险等级',
      SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as '入库时间'
    FROM inventory 
    WHERE status != 'normal' OR risk_level = 'high'
    ORDER BY 
      CASE WHEN risk_level = 'high' THEN 1 
           WHEN status = 'frozen' THEN 2 
           ELSE 3 END`,
    trigger_words: JSON.stringify(['异常库存', '问题库存', '风险库存', '非正常库存']),
    example_query: '查询异常状态的库存',
    priority: 9
  },

  // === 时间段查询 ===
  {
    intent_name: '本月入库统计',
    description: '统计本月入库的物料',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as '入库日期',
      COUNT(*) as '入库批次数',
      SUM(quantity) as '总数量',
      COUNT(DISTINCT material_name) as '物料种类',
      COUNT(DISTINCT supplier_name) as '供应商数量'
    FROM inventory 
    WHERE MONTH(inbound_time) = MONTH(NOW()) AND YEAR(inbound_time) = YEAR(NOW())
    GROUP BY DATE_FORMAT(inbound_time, '%Y-%m-%d')
    ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['本月入库', '当月入库', '月度入库', '入库统计']),
    example_query: '查询本月入库统计',
    priority: 6
  },

  // === 检验结果分析 ===
  {
    intent_name: '检验合格率统计',
    description: '统计检验合格率',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      material_name as '物料名称',
      COUNT(*) as '检验次数',
      SUM(CASE WHEN test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) as '合格次数',
      ROUND(SUM(CASE WHEN test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as '合格率%'
    FROM lab_tests 
    WHERE material_name IS NOT NULL
    GROUP BY material_name 
    HAVING COUNT(*) >= 2
    ORDER BY COUNT(*) DESC`,
    trigger_words: JSON.stringify(['检验合格率', '合格率统计', '质量合格率', '检验统计']),
    example_query: '查询检验合格率统计',
    priority: 7
  },

  // === 供应商表现分析 ===
  {
    intent_name: '供应商检验表现',
    description: '分析供应商的检验表现',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      l.supplier_name as '供应商',
      COUNT(l.id) as '检验次数',
      SUM(CASE WHEN l.test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) as '合格次数',
      ROUND(SUM(CASE WHEN l.test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) * 100.0 / COUNT(l.id), 2) as '合格率%',
      COUNT(DISTINCT l.material_name) as '涉及物料数'
    FROM lab_tests l
    WHERE l.supplier_name IS NOT NULL
    GROUP BY l.supplier_name 
    HAVING COUNT(l.id) >= 2
    ORDER BY COUNT(l.id) DESC`,
    trigger_words: JSON.stringify(['供应商检验表现', '供应商质量', '供应商合格率', '供应商分析']),
    example_query: '分析供应商检验表现',
    priority: 6
  },

  // === 生产效率分析 ===
  {
    intent_name: '工厂生产效率',
    description: '分析各工厂的生产效率',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      factory as '工厂',
      COUNT(*) as '生产批次',
      AVG(defect_rate * 100) as '平均不良率%',
      SUM(exception_count) as '总异常数',
      COUNT(DISTINCT material_name) as '生产物料种类'
    FROM online_tracking 
    WHERE factory IS NOT NULL
    GROUP BY factory 
    ORDER BY COUNT(*) DESC`,
    trigger_words: JSON.stringify(['工厂生产效率', '生产效率', '工厂表现', '生产分析']),
    example_query: '分析工厂生产效率',
    priority: 6
  },

  // === 综合数据查询 ===
  {
    intent_name: '物料全生命周期',
    description: '查询物料从库存到生产的全生命周期',
    action_type: 'SQL_QUERY',
    action_target: `SELECT 
      i.material_name as '物料名称',
      i.supplier_name as '供应商',
      i.quantity as '库存数量',
      i.status as '库存状态',
      COUNT(l.id) as '检验次数',
      COUNT(o.id) as '生产次数',
      AVG(o.defect_rate * 100) as '平均不良率%'
    FROM inventory i
    LEFT JOIN lab_tests l ON i.material_code = l.material_code
    LEFT JOIN online_tracking o ON i.material_code = o.material_code
    WHERE i.material_name LIKE '%{material}%'
    GROUP BY i.material_name, i.supplier_name, i.quantity, i.status
    ORDER BY i.quantity DESC`,
    trigger_words: JSON.stringify(['物料全生命周期', '{material}全流程', '物料{material}全过程', '全流程{material}']),
    example_query: '查询电池盖的全生命周期',
    priority: 5
  }
];

async function createAdvancedRules() {
  let connection;
  
  try {
    console.log('🚀 创建高级规则系统...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 插入高级规则
    console.log('📝 插入高级规则...');
    let insertedCount = 0;
    
    for (const rule of ADVANCED_RULES) {
      try {
        await connection.execute(`
          INSERT INTO assistant_rules (
            intent_name, description, action_type, action_target,
            trigger_words, example_query, priority, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.trigger_words,
          rule.example_query,
          rule.priority
        ]);
        
        insertedCount++;
        console.log(`✅ 已插入高级规则: ${rule.intent_name}`);
        
      } catch (error) {
        console.error(`❌ 插入规则失败 [${rule.intent_name}]:`, error.message);
      }
    }
    
    console.log(`\n🎉 高级规则创建完成！共插入 ${insertedCount} 条规则`);
    
    // 统计总规则数
    const [totalRules] = await connection.execute('SELECT COUNT(*) as count FROM assistant_rules WHERE status = "active"');
    console.log(`📊 当前总活跃规则数量: ${totalRules[0].count}`);
    
  } catch (error) {
    console.error('❌ 创建高级规则失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdvancedRules();
