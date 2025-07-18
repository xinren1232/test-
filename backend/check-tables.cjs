// 检查数据库中的表
const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查数据库中的表...\n');
    
    // 查看所有表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 数据库中的表:');
    tables.forEach(table => {
      console.log(`   ${Object.values(table)[0]}`);
    });
    
    // 检查是否有规则相关的表
    console.log('\n🔍 查找规则相关的表...');
    const rulesTables = tables.filter(table => {
      const tableName = Object.values(table)[0].toLowerCase();
      return tableName.includes('rule') || tableName.includes('nlp') || tableName.includes('assistant');
    });
    
    if (rulesTables.length > 0) {
      console.log('📋 找到规则相关的表:');
      rulesTables.forEach(table => {
        console.log(`   ${Object.values(table)[0]}`);
      });
    } else {
      console.log('❌ 没有找到规则相关的表');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkTables();
