/**
 * 创建完整的规则系统
 * 基于实际数据库结构和前端页面字段要求
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际前端页面的字段映射
const FIELD_MAPPINGS = {
  // 库存页面字段: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
  inventory: {
    table: 'inventory',
    fields: {
      '工厂': 'SUBSTRING_INDEX(storage_location, \'-\', 1)',
      '仓库': 'SUBSTRING_INDEX(storage_location, \'-\', -1)',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'DATE_FORMAT(inbound_time, \'%Y-%m-%d\')',
      '到期时间': 'DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), \'%Y-%m-%d\')',
      '备注': 'COALESCE(notes, \'\')'
    }
  },
  
  // 上线页面字段: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
  online: {
    table: 'online_tracking',
    fields: {
      '工厂': 'COALESCE(factory, \'未知工厂\')',
      '基线': 'COALESCE(project, \'未知基线\')',
      '项目': 'COALESCE(project, \'未知项目\')',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '不良率': 'CONCAT(ROUND(COALESCE(defect_rate, 0) * 100, 2), \'%\')',
      '本周异常': 'COALESCE(exception_count, 0)',
      '检验日期': 'DATE_FORMAT(COALESCE(online_date, inspection_date), \'%Y-%m-%d\')',
      '备注': 'COALESCE(notes, \'\')'
    }
  },
  
  // 测试页面字段: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
  testing: {
    table: 'lab_tests',
    fields: {
      '测试编号': 'COALESCE(test_id, id)',
      '日期': 'DATE_FORMAT(test_date, \'%Y-%m-%d\')',
      '项目': 'COALESCE(project_id, \'未知项目\')',
      '基线': 'COALESCE(baseline_id, \'未知基线\')',
      '物料编码': 'material_code',
      '数量': 'COALESCE(quantity, 1)',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'COALESCE(test_result, conclusion)',
      '不合格描述': 'COALESCE(defect_desc, \'\')',
      '备注': 'COALESCE(notes, \'\')'
    }
  }
};

// 生成SQL查询模板
function generateSQLTemplate(scenario, conditions = '', orderBy = '', limit = 50) {
  const mapping = FIELD_MAPPINGS[scenario];
  if (!mapping) return null;
  
  const selectFields = Object.entries(mapping.fields)
    .map(([chinese, english]) => `${english} as ${chinese}`)
    .join(',\n  ');
  
  let sql = `SELECT\n  ${selectFields}\nFROM ${mapping.table}`;
  
  if (conditions) {
    sql += `\nWHERE ${conditions}`;
  }
  
  if (orderBy) {
    sql += `\nORDER BY ${orderBy}`;
  } else {
    // 默认排序
    if (scenario === 'inventory') {
      sql += '\nORDER BY inbound_time DESC';
    } else if (scenario === 'testing') {
      sql += '\nORDER BY test_date DESC';
    } else if (scenario === 'online') {
      sql += '\nORDER BY online_date DESC';
    }
  }
  
  sql += `\nLIMIT ${limit}`;
  
  return sql;
}

// 完整的规则定义
const COMPREHENSIVE_RULES = [
  // ===== 基础查询规则 =====
  {
    intent_name: '物料库存查询',
    description: '查询物料库存基本信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory'),
    trigger_words: JSON.stringify(['库存', '物料库存', '库存查询', '库存信息']),
    example_query: '查询物料库存情况',
    category: '库存场景',
    priority: 10
  },
  
  {
    intent_name: '供应商库存查询',
    description: '按供应商查询库存信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'supplier_name LIKE CONCAT(\'%\', ?, \'%\')'),
    parameters: JSON.stringify([{name: 'supplier', type: 'string', required: true}]),
    trigger_words: JSON.stringify(['供应商库存', '供应商', '聚龙', '欣冠', '广正', '天马', 'BOE']),
    example_query: '查询聚龙供应商的库存',
    category: '库存场景',
    priority: 15
  },
  
  {
    intent_name: '物料名称库存查询',
    description: '按物料名称查询库存',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'material_name LIKE CONCAT(\'%\', ?, \'%\')'),
    parameters: JSON.stringify([{name: 'material', type: 'string', required: true}]),
    trigger_words: JSON.stringify(['电池', '电池盖', '中框', '显示屏', '摄像头', '喇叭', '听筒']),
    example_query: '查询电池的库存情况',
    category: '库存场景',
    priority: 20
  },
  
  {
    intent_name: '库存状态查询',
    description: '按状态查询库存',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'status = ?'),
    parameters: JSON.stringify([{name: 'status', type: 'string', required: true}]),
    trigger_words: JSON.stringify(['正常库存', '冻结库存', '风险库存', '状态']),
    example_query: '查询正常状态的库存',
    category: '库存场景',
    priority: 12
  },
  
  // ===== 测试场景规则 =====
  {
    intent_name: '物料测试结果查询',
    description: '查询物料测试结果',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('testing'),
    trigger_words: JSON.stringify(['测试结果', '测试', '检测', '实验室']),
    example_query: '查询物料测试结果',
    category: '测试场景',
    priority: 10
  },
  
  {
    intent_name: 'NG测试结果查询',
    description: '查询不合格测试结果',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('testing', 'test_result = \'NG\' OR conclusion = \'NG\''),
    trigger_words: JSON.stringify(['NG', '不合格', '失败', '异常']),
    example_query: '查询NG测试结果',
    category: '测试场景',
    priority: 15
  },
  
  {
    intent_name: '供应商测试结果查询',
    description: '按供应商查询测试结果',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('testing', 'supplier_name LIKE CONCAT(\'%\', ?, \'%\')'),
    parameters: JSON.stringify([{name: 'supplier', type: 'string', required: true}]),
    trigger_words: JSON.stringify(['供应商测试', '测试供应商']),
    example_query: '查询聚龙供应商的测试结果',
    category: '测试场景',
    priority: 18
  },
  
  // ===== 上线场景规则 =====
  {
    intent_name: '物料上线跟踪查询',
    description: '查询物料上线跟踪信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('online'),
    trigger_words: JSON.stringify(['上线', '上线跟踪', '生产', '产线']),
    example_query: '查询物料上线情况',
    category: '上线场景',
    priority: 10
  },
  
  {
    intent_name: '高不良率物料查询',
    description: '查询不良率较高的物料',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('online', 'defect_rate > 0.05', 'defect_rate DESC'),
    trigger_words: JSON.stringify(['高不良率', '不良率', '质量问题']),
    example_query: '查询不良率较高的物料',
    category: '上线场景',
    priority: 20
  },
  
  {
    intent_name: '异常物料上线查询',
    description: '查询有异常的上线物料',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('online', 'exception_count > 0', 'exception_count DESC'),
    trigger_words: JSON.stringify(['异常', '本周异常', '异常物料']),
    example_query: '查询有异常的上线物料',
    category: '上线场景',
    priority: 18
  },

  // ===== 批次场景规则 =====
  {
    intent_name: '批次综合信息查询',
    description: '查询特定批次的综合信息',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  '库存' as 数据来源,
  batch_code as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE batch_code LIKE CONCAT('%', ?, '%')
UNION ALL
SELECT
  '测试' as 数据来源,
  batch_code as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  '1' as 数量,
  test_result as 状态,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(defect_desc, '') as 备注
FROM lab_tests
WHERE batch_code LIKE CONCAT('%', ?, '%')
UNION ALL
SELECT
  '上线' as 数据来源,
  batch_code as 批次号,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  CAST(exception_count as CHAR) as 数量,
  CONCAT(ROUND(defect_rate * 100, 2), '%') as 状态,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 日期,
  COALESCE(project, '') as 备注
FROM online_tracking
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY 日期 DESC
LIMIT 50`,
    parameters: JSON.stringify([
      {name: 'batch1', type: 'string', required: true},
      {name: 'batch2', type: 'string', required: true},
      {name: 'batch3', type: 'string', required: true}
    ]),
    trigger_words: JSON.stringify(['批次', '批次信息', '批次查询', '批号']),
    example_query: '查询批次123456的信息',
    category: '批次场景',
    priority: 15
  },

  // ===== 对比分析规则 =====
  {
    intent_name: '供应商对比分析',
    description: '对比不同供应商的质量表现',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  supplier_name as 供应商,
  COUNT(*) as 测试次数,
  SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 合格次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不合格次数,
  ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 合格率,
  GROUP_CONCAT(DISTINCT material_name) as 涉及物料
FROM lab_tests
WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY supplier_name
ORDER BY 合格率 DESC
LIMIT 20`,
    trigger_words: JSON.stringify(['供应商对比', '供应商分析', '质量对比', '供应商质量']),
    example_query: '对比各供应商的质量表现',
    category: '分析场景',
    priority: 20
  },

  {
    intent_name: '物料质量趋势分析',
    description: '分析物料质量趋势',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  material_name as 物料名称,
  DATE_FORMAT(test_date, '%Y-%m') as 月份,
  COUNT(*) as 测试次数,
  SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不合格次数,
  ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率
FROM lab_tests
WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
  AND material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
GROUP BY material_name, DATE_FORMAT(test_date, '%Y-%m')
ORDER BY material_name, 月份 DESC
LIMIT 50`,
    parameters: JSON.stringify([{name: 'material', type: 'string', required: false}]),
    trigger_words: JSON.stringify(['质量趋势', '趋势分析', '月度分析', '质量变化']),
    example_query: '分析电池的质量趋势',
    category: '分析场景',
    priority: 18
  },

  // ===== 风险预警规则 =====
  {
    intent_name: '高风险物料识别',
    description: '识别高风险物料',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT
  i.material_name as 物料名称,
  i.supplier_name as 供应商,
  i.quantity as 库存数量,
  i.status as 库存状态,
  COALESCE(t.ng_count, 0) as 近期NG次数,
  COALESCE(o.avg_defect_rate, 0) as 平均不良率,
  CASE
    WHEN i.status = '冻结' THEN '库存冻结'
    WHEN COALESCE(t.ng_count, 0) > 3 THEN '测试异常频发'
    WHEN COALESCE(o.avg_defect_rate, 0) > 0.05 THEN '不良率偏高'
    ELSE '正常'
  END as 风险等级
FROM inventory i
LEFT JOIN (
  SELECT material_name, supplier_name, COUNT(*) as ng_count
  FROM lab_tests
  WHERE test_result = 'NG' AND test_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  GROUP BY material_name, supplier_name
) t ON i.material_name = t.material_name AND i.supplier_name = t.supplier_name
LEFT JOIN (
  SELECT material_name, supplier_name, AVG(defect_rate) as avg_defect_rate
  FROM online_tracking
  WHERE online_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  GROUP BY material_name, supplier_name
) o ON i.material_name = o.material_name AND i.supplier_name = o.supplier_name
WHERE i.status = '冻结' OR COALESCE(t.ng_count, 0) > 3 OR COALESCE(o.avg_defect_rate, 0) > 0.05
ORDER BY
  CASE
    WHEN i.status = '冻结' THEN 1
    WHEN COALESCE(t.ng_count, 0) > 3 THEN 2
    WHEN COALESCE(o.avg_defect_rate, 0) > 0.05 THEN 3
    ELSE 4
  END
LIMIT 30`,
    trigger_words: JSON.stringify(['高风险', '风险物料', '风险识别', '异常物料', '问题物料']),
    example_query: '识别高风险物料',
    category: '风险场景',
    priority: 25
  },

  // ===== 具体物料类别规则 =====
  {
    intent_name: '结构件类物料查询',
    description: '查询结构件类物料信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'material_name IN (\'电池盖\', \'中框\', \'手机卡托\', \'侧键\', \'装饰件\')'),
    trigger_words: JSON.stringify(['结构件', '电池盖', '中框', '手机卡托', '侧键', '装饰件']),
    example_query: '查询结构件类物料',
    category: '物料类别',
    priority: 15
  },

  {
    intent_name: '光学类物料查询',
    description: '查询光学类物料信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'material_name IN (\'LCD显示屏\', \'OLED显示屏\', \'摄像头(CAM)\')'),
    trigger_words: JSON.stringify(['光学', 'LCD', 'OLED', '显示屏', '摄像头', 'CAM']),
    example_query: '查询光学类物料',
    category: '物料类别',
    priority: 15
  },

  {
    intent_name: '充电类物料查询',
    description: '查询充电类物料信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'material_name IN (\'电池\', \'充电器\')'),
    trigger_words: JSON.stringify(['充电', '电池', '充电器']),
    example_query: '查询充电类物料',
    category: '物料类别',
    priority: 15
  },

  {
    intent_name: '声学类物料查询',
    description: '查询声学类物料信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'material_name IN (\'喇叭\', \'听筒\')'),
    trigger_words: JSON.stringify(['声学', '喇叭', '听筒']),
    example_query: '查询声学类物料',
    category: '物料类别',
    priority: 15
  },

  {
    intent_name: '包材类物料查询',
    description: '查询包材类物料信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'material_name IN (\'保护套\', \'标签\', \'包装盒\')'),
    trigger_words: JSON.stringify(['包材', '保护套', '标签', '包装盒']),
    example_query: '查询包材类物料',
    category: '物料类别',
    priority: 15
  },

  // ===== 特定供应商规则 =====
  {
    intent_name: '聚龙供应商查询',
    description: '查询聚龙供应商相关信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'supplier_name = \'聚龙\''),
    trigger_words: JSON.stringify(['聚龙']),
    example_query: '查询聚龙供应商的物料',
    category: '供应商场景',
    priority: 20
  },

  {
    intent_name: '天马供应商查询',
    description: '查询天马供应商相关信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'supplier_name = \'天马\''),
    trigger_words: JSON.stringify(['天马']),
    example_query: '查询天马供应商的物料',
    category: '供应商场景',
    priority: 20
  },

  {
    intent_name: 'BOE供应商查询',
    description: '查询BOE供应商相关信息',
    action_type: 'SQL_QUERY',
    action_target: generateSQLTemplate('inventory', 'supplier_name = \'BOE\''),
    trigger_words: JSON.stringify(['BOE', 'boe']),
    example_query: '查询BOE供应商的物料',
    category: '供应商场景',
    priority: 20
  }
];

async function createComprehensiveRules() {
  let connection;
  
  try {
    console.log('🚀 开始创建完整规则系统...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查数据库表结构
    console.log('\n📋 检查数据库表结构...');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`\n${table}表字段:`);
        columns.forEach(col => {
          console.log(`  ${col.Field} (${col.Type})`);
        });
      } catch (error) {
        console.log(`❌ ${table}表不存在:`, error.message);
      }
    }
    
    // 2. 检查现有规则数量
    console.log('\n📊 检查现有规则数量...');
    const [existingCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
    console.log(`当前规则数量: ${existingCount[0].count}`);
    
    // 3. 插入新规则
    console.log('\n📝 插入新规则...');
    let insertCount = 0;
    
    for (const rule of COMPREHENSIVE_RULES) {
      try {
        await connection.execute(`
          INSERT INTO nlp_intent_rules (
            intent_name, description, action_type, action_target,
            parameters, trigger_words, example_query, category, priority, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.action_type,
          rule.action_target,
          rule.parameters || null,
          rule.trigger_words,
          rule.example_query,
          rule.category,
          rule.priority
        ]);
        
        insertCount++;
        console.log(`✅ 插入规则: ${rule.intent_name}`);
      } catch (error) {
        console.log(`❌ 插入规则失败 ${rule.intent_name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 规则创建完成! 成功插入 ${insertCount} 条规则`);
    
    // 4. 验证规则
    console.log('\n🔍 验证规则...');
    const [rules] = await connection.execute(`
      SELECT intent_name, category, priority, status
      FROM nlp_intent_rules
      WHERE category IN ('库存场景', '测试场景', '上线场景', '批次场景', '分析场景', '风险场景', '物料类别', '供应商场景')
      ORDER BY category, priority
    `);
    
    console.log('\n📊 规则统计:');
    const stats = {};
    rules.forEach(rule => {
      stats[rule.category] = (stats[rule.category] || 0) + 1;
    });
    
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 条规则`);
    });
    
  } catch (error) {
    console.error('❌ 创建规则失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createComprehensiveRules().catch(console.error);
