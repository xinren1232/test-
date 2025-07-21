/**
 * 添加规则到nlp_intent_rules表
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

const intentRules = [
  {
    intent_name: 'inventory_query',
    description: '查询物料库存信息',
    category: '库存管理',
    action_type: 'SQL_QUERY',
    action_target: 'SELECT * FROM inventory WHERE material_name LIKE "%{material}%" OR material_code LIKE "%{material}%" LIMIT 20',
    parameters: JSON.stringify([
      {
        name: 'material',
        type: 'string',
        required: true,
        extract_pattern: '(物料|材料|零件|组件|库存)'
      }
    ]),
    trigger_words: JSON.stringify(['库存', '库存查询', '物料库存', '剩余数量', '库存状态', '物料查询']),
    synonyms: JSON.stringify(['库存', '存货', '物料', '材料']),
    example_query: '查询电池库存',
    priority: 10,
    sort_order: 1,
    status: 'active'
  },
  {
    intent_name: 'quality_inspection',
    description: '查询质量检测相关信息',
    category: '质量检测',
    action_type: 'SQL_QUERY',
    action_target: 'SELECT * FROM lab_tests WHERE test_type LIKE "%{test_type}%" OR sample_id LIKE "%{sample_id}%" LIMIT 20',
    parameters: JSON.stringify([
      {
        name: 'test_type',
        type: 'string',
        required: false,
        extract_pattern: '(质量|检测|检验|测试)'
      },
      {
        name: 'sample_id',
        type: 'string',
        required: false,
        extract_pattern: '([A-Z0-9]{6,})'
      }
    ]),
    trigger_words: JSON.stringify(['质量检测', '检验结果', '质检报告', '不良率', '合格率', '测试结果']),
    synonyms: JSON.stringify(['质检', '检测', '检验', '测试']),
    example_query: '查询质量检测结果',
    priority: 9,
    sort_order: 2,
    status: 'active'
  },
  {
    intent_name: 'supplier_query',
    description: '查询供应商相关信息',
    category: '供应商管理',
    action_type: 'SQL_QUERY',
    action_target: 'SELECT * FROM inventory WHERE supplier_name LIKE "%{supplier}%" GROUP BY supplier_name LIMIT 20',
    parameters: JSON.stringify([
      {
        name: 'supplier',
        type: 'string',
        required: true,
        extract_pattern: '(供应商|厂商|供货商|华为|小米|苹果)'
      }
    ]),
    trigger_words: JSON.stringify(['供应商', '供应商查询', '厂商信息', '供货商', '供应商管理']),
    synonyms: JSON.stringify(['供应商', '厂商', '供货商', '制造商']),
    example_query: '查询华为供应商信息',
    priority: 8,
    sort_order: 3,
    status: 'active'
  },
  {
    intent_name: 'data_cleaning_query',
    description: '查询数据清洗和8D报告相关信息',
    category: '数据清洗',
    action_type: 'SQL_QUERY',
    action_target: 'SELECT * FROM data_cleaning_results WHERE file_type = "8D" OR content LIKE "%{keyword}%" LIMIT 20',
    parameters: JSON.stringify([
      {
        name: 'keyword',
        type: 'string',
        required: true,
        extract_pattern: '(8D|数据清洗|问题分析|根因|纠正措施)'
      }
    ]),
    trigger_words: JSON.stringify(['数据清洗', '8D报告', '问题分析', '根因分析', '纠正措施', '数据处理']),
    synonyms: JSON.stringify(['数据清洗', '8D', '问题分析', '根因分析']),
    example_query: '查询8D报告数据清洗结果',
    priority: 8,
    sort_order: 4,
    status: 'active'
  },
  {
    intent_name: 'general_help',
    description: '提供系统使用帮助',
    category: '系统帮助',
    action_type: 'RESPONSE',
    action_target: '我是IQE智能质检助手，可以帮您查询库存、质量检测、供应商信息等。您可以问我："查询电池库存"、"华为供应商信息"、"质量检测结果"等问题。',
    parameters: JSON.stringify([]),
    trigger_words: JSON.stringify(['帮助', '使用说明', '功能介绍', '如何使用', '你好', '您好']),
    synonyms: JSON.stringify(['帮助', '说明', '介绍', '指导']),
    example_query: '如何使用系统',
    priority: 1,
    sort_order: 5,
    status: 'active'
  }
];

async function addIntentRules() {
  let connection = null;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 清空现有规则
    console.log('🧹 清空现有规则...');
    await connection.execute('DELETE FROM nlp_intent_rules');

    // 添加规则
    console.log('📝 添加意图规则...');
    for (const rule of intentRules) {
      const result = await connection.execute(
        `INSERT INTO nlp_intent_rules (
          intent_name, description, category, action_type, action_target, 
          parameters, trigger_words, synonyms, example_query, 
          priority, sort_order, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          rule.intent_name,
          rule.description,
          rule.category,
          rule.action_type,
          rule.action_target,
          rule.parameters,
          rule.trigger_words,
          rule.synonyms,
          rule.example_query,
          rule.priority,
          rule.sort_order,
          rule.status
        ]
      );
      console.log(`✅ 添加规则: ${rule.intent_name} (ID: ${result[0].insertId})`);
    }

    // 验证结果
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"');
    console.log(`🎉 成功添加 ${count[0].total} 条规则`);

    // 显示规则列表
    const [rules] = await connection.execute('SELECT id, intent_name, category, priority FROM nlp_intent_rules ORDER BY priority DESC');
    console.log('\n📋 规则列表:');
    rules.forEach((rule) => {
      console.log(`  ${rule.id}. ${rule.intent_name} (${rule.category}) - 优先级: ${rule.priority}`);
    });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

addIntentRules();
