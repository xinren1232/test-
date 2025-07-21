// 检查数据库中的规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRulesDB() {
  let connection;
  
  try {
    console.log('🔍 检查数据库中的规则...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查assistant_rules表是否存在
    console.log('\n📋 检查assistant_rules表:');
    try {
      const [tables] = await connection.execute("SHOW TABLES LIKE 'assistant_rules'");
      if (tables.length === 0) {
        console.log('❌ assistant_rules表不存在！');
        
        // 创建表
        console.log('🔧 创建assistant_rules表...');
        await connection.execute(`
          CREATE TABLE assistant_rules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            intent_name VARCHAR(255) NOT NULL,
            description TEXT,
            action_type VARCHAR(50) DEFAULT 'SQL_QUERY',
            action_target TEXT,
            trigger_words JSON,
            example_query VARCHAR(255),
            priority INT DEFAULT 5,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ assistant_rules表创建成功');
      } else {
        console.log('✅ assistant_rules表存在');
      }
      
      // 检查表结构
      const [columns] = await connection.execute('DESCRIBE assistant_rules');
      console.log('\n📊 表结构:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
      });
      
      // 检查规则数量
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM assistant_rules');
      console.log(`\n📈 规则总数: ${count[0].count}`);
      
      if (count[0].count > 0) {
        // 检查活跃规则
        const [activeCount] = await connection.execute("SELECT COUNT(*) as count FROM assistant_rules WHERE status = 'active'");
        console.log(`📈 活跃规则数: ${activeCount[0].count}`);
        
        // 显示前5条规则
        const [rules] = await connection.execute('SELECT intent_name, description, priority, status FROM assistant_rules LIMIT 5');
        console.log('\n📋 前5条规则:');
        rules.forEach((rule, index) => {
          console.log(`${index + 1}. ${rule.intent_name} (优先级: ${rule.priority}, 状态: ${rule.status})`);
          console.log(`   描述: ${rule.description}`);
        });
      } else {
        console.log('❌ 数据库中没有规则！需要重新创建规则。');
      }
      
    } catch (error) {
      console.log('❌ 检查表失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkRulesDB();
