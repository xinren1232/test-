// 直接查询数据库检查规则
const mysql = require('mysql2/promise');

async function directDBCheck() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('📋 查询所有规则:');
    const [rules] = await connection.execute('SELECT * FROM assistant_rules ORDER BY priority DESC');
    
    rules.forEach((rule, index) => {
      console.log(`\n${index + 1}. ${rule.intent_name}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   示例: ${rule.example_query}`);
      console.log(`   状态: ${rule.status}`);
      console.log(`   优先级: ${rule.priority}`);
    });
    
    console.log(`\n总计: ${rules.length} 条规则`);
    
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

directDBCheck();
