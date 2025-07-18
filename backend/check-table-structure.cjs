// 检查表结构
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkTableStructure() {
  let connection;
  try {
    console.log('🔍 检查表结构...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查数据库连接
    console.log('✅ 数据库连接成功');
    
    // 2. 检查表是否存在
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'nlp_intent_rules'
    `);
    
    if (tables.length === 0) {
      console.log('❌ nlp_intent_rules表不存在，正在创建...');
      
      // 创建表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS nlp_intent_rules (
          id INT PRIMARY KEY AUTO_INCREMENT,
          intent_name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          example_query TEXT,
          trigger_words JSON,
          action_target TEXT,
          status VARCHAR(20) DEFAULT 'active',
          priority INT DEFAULT 50,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ nlp_intent_rules表创建成功');
    } else {
      console.log('✅ nlp_intent_rules表存在');
    }
    
    // 3. 检查表结构
    const [structure] = await connection.execute(`
      DESCRIBE nlp_intent_rules
    `);
    
    console.log('\n📋 表结构:');
    for (const field of structure) {
      console.log(`${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(可空)' : '(非空)'} ${field.Key ? `[${field.Key}]` : ''}`);
    }
    
    // 4. 检查现有数据
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules
    `);
    
    console.log(`\n📊 现有数据: ${count[0].total} 条`);
    
    // 5. 如果没有数据，直接插入测试规则
    if (count[0].total === 0) {
      console.log('\n🔧 插入测试规则...');
      
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, description, category, example_query, 
          trigger_words, action_target, status, priority
        ) VALUES 
        ('库存查询_测试', '测试库存查询', '库存场景', '库存查询',
         '["库存查询", "库存", "查库存"]',
         'SELECT material_name, supplier_name, quantity, status FROM inventory LIMIT 10',
         'active', 100)
      `);
      
      console.log('✅ 插入测试规则成功');
      
      // 验证插入
      const [newCount] = await connection.execute(`
        SELECT COUNT(*) as total FROM nlp_intent_rules
      `);
      
      console.log(`📊 插入后数据: ${newCount[0].total} 条`);
      
      // 显示插入的规则
      const [rules] = await connection.execute(`
        SELECT id, intent_name, trigger_words, status FROM nlp_intent_rules
      `);
      
      console.log('\n📋 规则列表:');
      for (const rule of rules) {
        console.log(`${rule.id}. ${rule.intent_name} (${rule.status})`);
        console.log(`   触发词: ${rule.trigger_words}`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error('错误详情:', error);
    if (connection) await connection.end();
  }
}

checkTableStructure();
