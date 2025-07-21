/**
 * 简单添加基础规则脚本
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

const basicRules = [
  {
    intent: 'inventory_query',
    trigger_words: '["库存", "库存查询", "物料库存", "剩余数量", "库存状态"]',
    sql_template: 'SELECT * FROM inventory WHERE material_name LIKE "%{material}%" OR material_code LIKE "%{material}%"',
    description: '查询物料库存信息',
    category: '库存管理',
    priority: 10,
    is_active: 1
  },
  {
    intent: 'quality_inspection',
    trigger_words: '["质量检测", "检验结果", "质检报告", "不良率", "合格率"]',
    sql_template: 'SELECT * FROM lab_tests WHERE test_type LIKE "%{test_type}%" AND test_date >= "{start_date}"',
    description: '查询质量检测相关信息',
    category: '质量检测',
    priority: 9,
    is_active: 1
  },
  {
    intent: 'supplier_query',
    trigger_words: '["供应商", "供应商查询", "厂商信息", "供货商"]',
    sql_template: 'SELECT * FROM inventory WHERE supplier_name LIKE "%{supplier}%"',
    description: '查询供应商相关信息',
    category: '供应商管理',
    priority: 8,
    is_active: 1
  },
  {
    intent: 'material_search',
    trigger_words: '["物料", "物料查询", "材料", "零件", "组件"]',
    sql_template: 'SELECT * FROM inventory WHERE material_name LIKE "%{keyword}%" OR material_code LIKE "%{keyword}%"',
    description: '搜索物料信息',
    category: '物料管理',
    priority: 7,
    is_active: 1
  },
  {
    intent: 'data_cleaning_query',
    trigger_words: '["数据清洗", "8D报告", "问题分析", "根因分析", "纠正措施"]',
    sql_template: 'SELECT * FROM data_cleaning_results WHERE file_type = "8D" OR content LIKE "%{keyword}%"',
    description: '查询数据清洗和8D报告相关信息',
    category: '数据清洗',
    priority: 8,
    is_active: 1
  }
];

async function addRules() {
  let connection = null;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 检查并创建表
    console.log('📋 检查nlp_rules表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS nlp_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intent VARCHAR(100) NOT NULL,
        trigger_words JSON,
        sql_template TEXT,
        description TEXT,
        category VARCHAR(50),
        priority INT DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_intent (intent),
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 清空现有规则
    console.log('🧹 清空现有规则...');
    await connection.execute('DELETE FROM nlp_rules');

    // 添加基础规则
    console.log('📝 添加基础规则...');
    for (const rule of basicRules) {
      const result = await connection.execute(
        `INSERT INTO nlp_rules (intent, trigger_words, sql_template, description, category, priority, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          rule.intent,
          rule.trigger_words,
          rule.sql_template,
          rule.description,
          rule.category,
          rule.priority,
          rule.is_active
        ]
      );
      console.log(`✅ 添加规则: ${rule.intent} (ID: ${result[0].insertId})`);
    }

    // 验证结果
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM nlp_rules WHERE is_active = 1');
    console.log(`🎉 成功添加 ${count[0].total} 条规则`);

    // 显示规则列表
    const [rules] = await connection.execute('SELECT id, intent, category, priority FROM nlp_rules ORDER BY priority DESC');
    console.log('\n📋 规则列表:');
    rules.forEach((rule) => {
      console.log(`  ${rule.id}. ${rule.intent} (${rule.category}) - 优先级: ${rule.priority}`);
    });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

addRules();
