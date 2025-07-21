/**
 * 添加基础NLP规则到数据库
 */
import mysql from 'mysql2/promise';
import dbConfig from './src/config/db.config.js';

const basicRules = [
  {
    intent: 'inventory_query',
    trigger_words: JSON.stringify(['库存', '库存查询', '物料库存', '剩余数量', '库存状态']),
    sql_template: 'SELECT * FROM inventory WHERE material_name LIKE "%{material}%" OR material_code LIKE "%{material}%"',
    description: '查询物料库存信息',
    category: '库存管理',
    priority: 10,
    is_active: true
  },
  {
    intent: 'quality_inspection',
    trigger_words: JSON.stringify(['质量检测', '检验结果', '质检报告', '不良率', '合格率']),
    sql_template: 'SELECT * FROM lab_tests WHERE test_type LIKE "%{test_type}%" AND test_date >= "{start_date}"',
    description: '查询质量检测相关信息',
    category: '质量检测',
    priority: 9,
    is_active: true
  },
  {
    intent: 'supplier_query',
    trigger_words: JSON.stringify(['供应商', '供应商查询', '厂商信息', '供货商']),
    sql_template: 'SELECT * FROM inventory WHERE supplier_name LIKE "%{supplier}%"',
    description: '查询供应商相关信息',
    category: '供应商管理',
    priority: 8,
    is_active: true
  },
  {
    intent: 'material_search',
    trigger_words: JSON.stringify(['物料', '物料查询', '材料', '零件', '组件']),
    sql_template: 'SELECT * FROM inventory WHERE material_name LIKE "%{keyword}%" OR material_code LIKE "%{keyword}%"',
    description: '搜索物料信息',
    category: '物料管理',
    priority: 7,
    is_active: true
  },
  {
    intent: 'production_tracking',
    trigger_words: JSON.stringify(['生产', '生产进度', '制造', '产量', '生产状态']),
    sql_template: 'SELECT * FROM production_tracking WHERE status = "{status}" OR product_name LIKE "%{product}%"',
    description: '查询生产跟踪信息',
    category: '生产跟踪',
    priority: 6,
    is_active: true
  },
  {
    intent: 'batch_management',
    trigger_words: JSON.stringify(['批次', '批次管理', '批号', '生产批次']),
    sql_template: 'SELECT * FROM batch_management WHERE batch_code LIKE "%{batch}%" OR product_name LIKE "%{product}%"',
    description: '查询批次管理信息',
    category: '批次管理',
    priority: 5,
    is_active: true
  },
  {
    intent: 'data_cleaning_query',
    trigger_words: JSON.stringify(['数据清洗', '8D报告', '问题分析', '根因分析', '纠正措施']),
    sql_template: 'SELECT * FROM data_cleaning_results WHERE file_type = "8D" OR content LIKE "%{keyword}%"',
    description: '查询数据清洗和8D报告相关信息',
    category: '数据清洗',
    priority: 8,
    is_active: true
  },
  {
    intent: 'general_help',
    trigger_words: JSON.stringify(['帮助', '使用说明', '功能介绍', '如何使用']),
    sql_template: 'SELECT "帮助信息" as help_info',
    description: '提供系统使用帮助',
    category: '系统帮助',
    priority: 1,
    is_active: true
  }
];

async function addBasicRules() {
  let connection = null;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database
    });

    console.log('✅ 数据库连接成功');

    // 检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'nlp_rules'"
    );

    if (tables.length === 0) {
      console.log('📋 创建nlp_rules表...');
      await connection.execute(`
        CREATE TABLE nlp_rules (
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
      console.log('✅ nlp_rules表创建成功');
    }

    // 清空现有规则
    console.log('🧹 清空现有规则...');
    await connection.execute('DELETE FROM nlp_rules');

    // 添加基础规则
    console.log('📝 添加基础规则...');
    for (const rule of basicRules) {
      await connection.execute(
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
      console.log(`✅ 添加规则: ${rule.intent} (${rule.category})`);
    }

    // 验证添加结果
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM nlp_rules WHERE is_active = 1');
    console.log(`🎉 成功添加 ${count[0].total} 条基础规则`);

    // 显示规则列表
    const [rules] = await connection.execute('SELECT intent, category, priority FROM nlp_rules ORDER BY priority DESC');
    console.log('\n📋 规则列表:');
    rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent} (${rule.category}) - 优先级: ${rule.priority}`);
    });

  } catch (error) {
    console.error('❌ 添加规则失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  addBasicRules()
    .then(() => {
      console.log('✅ 基础规则添加完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export default addBasicRules;
