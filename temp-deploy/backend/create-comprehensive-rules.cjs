// 创建完整的规则系统 - 基于真实数据调取
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际数据库表结构的字段映射
const FIELD_MAPPINGS = {
  inventory: {
    table: 'inventory',
    displayFields: ['工厂', '仓库', '物料编码', '物料名称', '物料类型', '供应商', '数量', '状态', '入库时间', '备注'],
    sqlMapping: {
      '工厂': 'SUBSTRING_INDEX(storage_location, \'-\', 1)',
      '仓库': 'SUBSTRING_INDEX(storage_location, \'-\', -1)', 
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '物料类型': 'material_type',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'DATE_FORMAT(inbound_time, \'%Y-%m-%d %H:%i\')',
      '备注': 'COALESCE(notes, \'\')'
    }
  },
  lab_tests: {
    table: 'lab_tests',
    displayFields: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    sqlMapping: {
      '测试编号': 'test_id',
      '日期': 'DATE_FORMAT(test_date, \'%Y-%m-%d\')',
      '项目': 'COALESCE((SELECT project FROM online_tracking WHERE material_code = lab_tests.material_code LIMIT 1), \'\')',
      '基线': 'COALESCE((SELECT workshop FROM online_tracking WHERE material_code = lab_tests.material_code LIMIT 1), \'\')',
      '物料类型': 'material_name', // 使用物料名称作为类型
      '数量': '1', // 默认数量
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'test_result',
      '不合格描述': 'COALESCE(defect_desc, \'\')',
      '备注': 'COALESCE(conclusion, \'\')'
    }
  },
  online_tracking: {
    table: 'online_tracking',
    displayFields: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注'],
    sqlMapping: {
      '测试编号': 'id',
      '日期': 'DATE_FORMAT(online_date, \'%Y-%m-%d\')',
      '项目': 'project',
      '基线': 'workshop',
      '物料类型': 'material_name', // 使用物料名称作为类型
      '数量': 'COALESCE(exception_count, 1)',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '不合格描述': 'CONCAT(\'不良率: \', ROUND(defect_rate * 100, 2), \'%\')',
      '备注': 'CONCAT(\'工厂: \', factory, \', 车间: \', workshop, \', 产线: \', line)'
    }
  }
};

// 规则模板
const RULE_TEMPLATES = [
  // === 库存查询规则 ===
  {
    intent_name: '库存基础查询',
    description: '查询库存基础信息',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.inventory.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.inventory.table} ORDER BY inbound_time DESC LIMIT 20`,
    trigger_words: JSON.stringify(['库存', '库存信息', '库存查询', '库存状态', '物料库存']),
    example_query: '查询库存信息',
    priority: 10
  },
  
  {
    intent_name: '按供应商查询库存',
    description: '根据供应商名称查询库存',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.inventory.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.inventory.table} WHERE supplier_name LIKE '%{supplier}%' ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['供应商库存', '供应商', '{supplier}供应商', '{supplier}的库存']),
    example_query: '查询聚龙供应商的库存',
    priority: 8
  },

  {
    intent_name: '按物料名称查询库存',
    description: '根据物料名称查询库存',
    action_type: 'SQL_QUERY', 
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.inventory.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.inventory.table} WHERE material_name LIKE '%{material}%' ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['物料库存', '{material}库存', '{material}的库存', '查询{material}']),
    example_query: '查询电池盖的库存',
    priority: 8
  },

  {
    intent_name: '按状态查询库存',
    description: '根据状态查询库存',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.inventory.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.inventory.table} WHERE status = '{status}' ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['{status}状态库存', '{status}的库存', '状态为{status}', '查询{status}状态']),
    example_query: '查询正常状态的库存',
    priority: 7
  },

  // === 检验数据查询规则 ===
  {
    intent_name: '检验数据基础查询',
    description: '查询检验数据基础信息',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.lab_tests.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.lab_tests.table} ORDER BY test_date DESC LIMIT 20`,
    trigger_words: JSON.stringify(['检验数据', '检验信息', '检验查询', '测试数据', '实验室数据']),
    example_query: '查询检验数据',
    priority: 10
  },

  {
    intent_name: '按测试结果查询检验数据',
    description: '根据测试结果查询检验数据',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.lab_tests.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.lab_tests.table} WHERE test_result = '{result}' ORDER BY test_date DESC`,
    trigger_words: JSON.stringify(['{result}的检验', '测试结果{result}', '{result}测试', '检验{result}']),
    example_query: '查询合格的检验数据',
    priority: 8
  },

  // === 生产数据查询规则 ===
  {
    intent_name: '生产数据基础查询',
    description: '查询生产跟踪数据',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.online_tracking.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.online_tracking.table} ORDER BY online_date DESC LIMIT 20`,
    trigger_words: JSON.stringify(['生产数据', '生产信息', '上线数据', '生产跟踪', '在线跟踪']),
    example_query: '查询生产数据',
    priority: 10
  },

  {
    intent_name: '按工厂查询生产数据',
    description: '根据工厂查询生产数据',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.online_tracking.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.online_tracking.table} WHERE factory LIKE '%{factory}%' ORDER BY online_date DESC`,
    trigger_words: JSON.stringify(['{factory}工厂', '{factory}生产', '{factory}的生产数据']),
    example_query: '查询深圳工厂的生产数据',
    priority: 8
  },

  // === 数据统计规则 ===
  {
    intent_name: '库存数量统计',
    description: '统计库存总数量',
    action_type: 'SQL_QUERY',
    action_target: `SELECT '库存统计' as '统计类型', COUNT(*) as '总记录数', SUM(quantity) as '总数量', COUNT(DISTINCT supplier_name) as '供应商数量', COUNT(DISTINCT material_name) as '物料种类' FROM ${FIELD_MAPPINGS.inventory.table}`,
    trigger_words: JSON.stringify(['库存统计', '库存总数', '库存数量', '有多少库存']),
    example_query: '统计库存数量',
    priority: 6
  },

  {
    intent_name: '供应商统计',
    description: '统计系统中的供应商',
    action_type: 'SQL_QUERY',
    action_target: `SELECT supplier_name as '供应商', COUNT(*) as '库存记录数', SUM(quantity) as '总数量' FROM ${FIELD_MAPPINGS.inventory.table} WHERE supplier_name IS NOT NULL GROUP BY supplier_name ORDER BY COUNT(*) DESC`,
    trigger_words: JSON.stringify(['供应商统计', '有哪些供应商', '供应商列表', '系统里有哪些供应商']),
    example_query: '系统里有哪些供应商？',
    priority: 6
  },

  // === 物料分析规则 ===
  {
    intent_name: '物料种类统计',
    description: '统计系统中的物料种类',
    action_type: 'SQL_QUERY',
    action_target: `SELECT material_name as '物料名称', COUNT(*) as '库存记录数', SUM(quantity) as '总数量', COUNT(DISTINCT supplier_name) as '供应商数量' FROM ${FIELD_MAPPINGS.inventory.table} WHERE material_name IS NOT NULL GROUP BY material_name ORDER BY COUNT(*) DESC`,
    trigger_words: JSON.stringify(['物料统计', '有哪些物料', '物料种类', '物料列表']),
    example_query: '系统里有哪些物料？',
    priority: 6
  },

  {
    intent_name: '高风险物料查询',
    description: '查询高风险等级的物料',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.inventory.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.inventory.table} WHERE risk_level = 'high' ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['高风险物料', '风险物料', '高风险', '风险库存']),
    example_query: '查询高风险物料',
    priority: 7
  },

  // === 质量分析规则 ===
  {
    intent_name: '不合格检验数据',
    description: '查询不合格的检验数据',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.lab_tests.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.lab_tests.table} WHERE test_result IN ('不合格', 'fail', 'failed', '失败') ORDER BY test_date DESC`,
    trigger_words: JSON.stringify(['不合格检验', '失败检验', '检验不合格', '质量问题']),
    example_query: '查询不合格的检验数据',
    priority: 8
  },

  {
    intent_name: '高不良率生产数据',
    description: '查询高不良率的生产数据',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.online_tracking.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.online_tracking.table} WHERE defect_rate > 0.05 ORDER BY defect_rate DESC`,
    trigger_words: JSON.stringify(['高不良率', '不良率高', '质量问题', '生产问题']),
    example_query: '查询高不良率的生产数据',
    priority: 8
  },

  // === 时间范围查询规则 ===
  {
    intent_name: '最近入库物料',
    description: '查询最近入库的物料',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.inventory.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.inventory.table} WHERE inbound_time >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY inbound_time DESC`,
    trigger_words: JSON.stringify(['最近入库', '近期入库', '本周入库', '最新库存']),
    example_query: '查询最近入库的物料',
    priority: 7
  },

  {
    intent_name: '最近检验数据',
    description: '查询最近的检验数据',
    action_type: 'SQL_QUERY',
    action_target: `SELECT ${Object.entries(FIELD_MAPPINGS.lab_tests.sqlMapping).map(([display, sql]) => `${sql} as '${display}'`).join(', ')} FROM ${FIELD_MAPPINGS.lab_tests.table} WHERE test_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY test_date DESC`,
    trigger_words: JSON.stringify(['最近检验', '近期检验', '本周检验', '最新检验']),
    example_query: '查询最近的检验数据',
    priority: 7
  },

  // === 综合分析规则 ===
  {
    intent_name: '供应商质量分析',
    description: '分析供应商的质量表现',
    action_type: 'SQL_QUERY',
    action_target: `SELECT
      i.supplier_name as '供应商',
      COUNT(i.id) as '库存记录数',
      COUNT(l.id) as '检验记录数',
      SUM(CASE WHEN l.test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) as '合格数',
      ROUND(SUM(CASE WHEN l.test_result IN ('合格', 'pass', 'passed') THEN 1 ELSE 0 END) * 100.0 / COUNT(l.id), 2) as '合格率%'
    FROM ${FIELD_MAPPINGS.inventory.table} i
    LEFT JOIN ${FIELD_MAPPINGS.lab_tests.table} l ON i.material_code = l.material_code
    WHERE i.supplier_name IS NOT NULL
    GROUP BY i.supplier_name
    ORDER BY COUNT(i.id) DESC`,
    trigger_words: JSON.stringify(['供应商质量', '供应商分析', '质量分析', '供应商表现']),
    example_query: '分析供应商质量表现',
    priority: 5
  }
];

async function createComprehensiveRules() {
  let connection;
  
  try {
    console.log('🚀 开始创建完整规则系统...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 清空现有规则
    console.log('🗑️ 清空现有规则...');
    await connection.execute('DELETE FROM assistant_rules');
    
    // 插入新规则
    console.log('📝 插入新规则...');
    let insertedCount = 0;
    
    for (const rule of RULE_TEMPLATES) {
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
        console.log(`✅ 已插入规则: ${rule.intent_name}`);
        
      } catch (error) {
        console.error(`❌ 插入规则失败 [${rule.intent_name}]:`, error.message);
      }
    }
    
    console.log(`\n🎉 规则创建完成！共插入 ${insertedCount} 条规则`);
    
    // 验证规则
    const [rules] = await connection.execute('SELECT COUNT(*) as count FROM assistant_rules WHERE status = "active"');
    console.log(`📊 当前活跃规则数量: ${rules[0].count}`);
    
  } catch (error) {
    console.error('❌ 创建规则失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createComprehensiveRules();
