/**
 * 数据设计确认和规则库修正脚本
 * 基于实际前端页面字段映射，修正MySQL规则库
 */

import mysql from 'mysql2/promise';

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 实际前端页面字段映射（基于用户提供的截图）
const ACTUAL_FRONTEND_FIELDS = {
  // 物料库存页面字段
  inventory: {
    display_fields: ['工厂', '仓库', '物料类型', '供应商名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    db_mapping: {
      '工厂': 'storage_location',
      '仓库': 'storage_location', // 注意：工厂和仓库在数据库中都映射到storage_location
      '物料类型': 'material_type', // 修正：应该是material_type而不是material_name
      '供应商名称': 'supplier_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'inbound_time',
      '到期时间': 'DATE_ADD(inbound_time, INTERVAL 365 DAY)', // 计算字段
      '备注': 'notes'
    }
  },
  
  // 物料上线页面字段
  online: {
    display_fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '数量', '不良率', '本周异常', '检验日期'],
    db_mapping: {
      '工厂': 'factory',
      '基线': 'project', // 注意：基线在数据库中对应project字段
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '不良率': 'defect_rate',
      '本周异常': 'exception_count',
      '检验日期': 'online_date'
    }
  },
  
  // 物料测试页面字段
  testing: {
    display_fields: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注'],
    db_mapping: {
      '测试编号': 'test_id',
      '日期': 'test_date',
      '项目': 'project_id',
      '基线': 'baseline_id',
      '物料类型': 'material_name', // 注意：物料类型在测试页面对应material_name
      '数量': 'COUNT(*)', // 聚合字段
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '不合格描述': 'defect_desc',
      '备注': 'notes'
    }
  },
  
  // 批次管理页面字段
  batch: {
    display_fields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常'],
    db_mapping: {
      '批次号': 'batch_code',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '入库日期': 'inbound_time',
      '产线异常': 'line_exceptions', // 统计字段
      '测试异常': 'test_exceptions'  // 统计字段
    }
  }
};

// 修正后的NLP规则定义
const CORRECTED_NLP_RULES = [
  {
    intent_name: '物料库存信息查询',
    description: '查询物料库存的基本信息，严格按照前端库存页面字段显示',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_type as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(["库存查询", "库存信息", "物料库存", "查库存"]),
    synonyms: JSON.stringify({"库存": ["存货", "物料"], "查询": ["查找", "搜索"]}),
    example_query: '查询物料库存信息',
    priority: 10
  },
  
  {
    intent_name: '测试结果查询',
    description: '查询物料测试结果信息，按照前端测试页面字段显示',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  MIN(test_id) as 测试编号,
  DATE_FORMAT(MIN(test_date), '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_name as 物料类型,
  COUNT(*) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  GROUP_CONCAT(DISTINCT CASE WHEN test_result = 'FAIL' THEN defect_desc END SEPARATOR ', ') as 不合格描述,
  '' as 备注
FROM lab_tests 
GROUP BY project_id, baseline_id, material_name, supplier_name
ORDER BY MIN(test_date) DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(["测试结果", "测试查询", "检测结果", "测试信息"]),
    synonyms: JSON.stringify({"测试": ["检测", "检验"], "结果": ["信息", "数据"]}),
    example_query: '查询测试结果',
    priority: 10
  },
  
  {
    intent_name: 'NG测试结果查询',
    description: '查询测试失败(NG)的记录，显示不合格描述',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  project_id as 项目,
  baseline_id as 基线,
  material_name as 物料类型,
  1 as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_desc as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests 
WHERE test_result = 'FAIL'
ORDER BY test_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(["NG测试", "失败测试", "不合格测试", "测试失败"]),
    synonyms: JSON.stringify({"NG": ["失败", "不合格"], "测试": ["检测", "检验"]}),
    example_query: '查询NG测试结果',
    priority: 10
  },
  
  {
    intent_name: '物料上线信息查询',
    description: '查询物料上线的基本信息，按照前端上线页面字段显示',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  COALESCE(quantity, 0) as 数量,
  CONCAT(ROUND(defect_rate * 100, 1), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期
FROM online_tracking 
ORDER BY online_date DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(["上线信息", "物料上线", "上线查询", "生产上线"]),
    synonyms: JSON.stringify({"上线": ["生产", "投产"], "查询": ["查找", "搜索"]}),
    example_query: '查询物料上线信息',
    priority: 10
  },
  
  {
    intent_name: '风险库存查询',
    description: '查询状态为风险的库存物料',
    action_type: 'SQL_QUERY',
    action_target: `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_type as 物料类型,
  supplier_name as 供应商名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
WHERE status LIKE '%风险%' OR risk_level = 'high'
ORDER BY inbound_time DESC
LIMIT 10`,
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(["风险库存", "高风险", "风险物料", "异常库存"]),
    synonyms: JSON.stringify({"风险": ["异常", "问题"], "库存": ["存货", "物料"]}),
    example_query: '查询风险库存',
    priority: 10
  }
];

async function validateAndFixFieldMappings() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 开始验证数据设计和字段映射...\n');
    
    // 1. 验证数据库表结构
    console.log('📊 数据库表结构验证:');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const table of tables) {
      const [fields] = await connection.execute(`DESCRIBE ${table}`);
      console.log(`\n${table}表字段:`, fields.map(f => f.Field).join(', '));
    }
    
    // 2. 检查当前规则库状态
    console.log('\n\n📋 当前NLP规则库状态:');
    const [currentRules] = await connection.execute(
      'SELECT intent_name, description FROM nlp_intent_rules ORDER BY id'
    );
    console.table(currentRules);
    
    // 3. 字段映射验证
    console.log('\n\n🔧 字段映射问题分析:');
    
    const fieldIssues = [];
    
    // 检查库存查询规则
    const [inventoryRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = "物料库存信息查询"'
    );
    
    if (inventoryRule[0]) {
      const sql = inventoryRule[0].action_target;
      if (sql.includes('material_code as 物料编号')) {
        fieldIssues.push('❌ 库存页面应显示"物料类型"而不是"物料编号"');
      }
      if (sql.includes('material_name as 物料类型')) {
        fieldIssues.push('❌ 库存页面"物料类型"应映射到material_type字段');
      }
    }
    
    // 检查测试结果查询规则
    const [testRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = "测试结果查询"'
    );
    
    if (testRule[0]) {
      const sql = testRule[0].action_target;
      if (!sql.includes('不合格描述')) {
        fieldIssues.push('❌ 测试页面缺少"不合格描述"字段显示');
      }
    }
    
    if (fieldIssues.length > 0) {
      console.log('发现字段映射问题:');
      fieldIssues.forEach(issue => console.log(issue));
    } else {
      console.log('✅ 字段映射检查通过');
    }
    
    // 4. 修正规则库
    console.log('\n\n🔧 开始修正NLP规则库...');
    
    for (const rule of CORRECTED_NLP_RULES) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, action_type, action_target,
          parameters, trigger_words, synonyms, example_query, priority, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          description = VALUES(description),
          action_target = VALUES(action_target),
          parameters = VALUES(parameters),
          trigger_words = VALUES(trigger_words),
          synonyms = VALUES(synonyms),
          example_query = VALUES(example_query),
          priority = VALUES(priority),
          updated_at = NOW()
      `, [
        rule.intent_name,
        rule.description,
        rule.action_type,
        rule.action_target,
        rule.parameters,
        rule.trigger_words,
        rule.synonyms,
        rule.example_query,
        rule.priority
      ]);
      
      console.log(`✅ 已修正规则: ${rule.intent_name}`);
    }
    
    // 5. 验证修正结果
    console.log('\n\n📊 修正后的规则库状态:');
    const [updatedRules] = await connection.execute(
      'SELECT intent_name, description FROM nlp_intent_rules WHERE intent_name IN (?, ?, ?, ?, ?) ORDER BY intent_name',
      CORRECTED_NLP_RULES.map(r => r.intent_name)
    );
    console.table(updatedRules);
    
    console.log('\n✅ 数据设计确认和规则库修正完成!');
    
  } catch (error) {
    console.error('❌ 执行过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行验证和修正
validateAndFixFieldMappings();

export {
  ACTUAL_FRONTEND_FIELDS,
  CORRECTED_NLP_RULES,
  validateAndFixFieldMappings
};
