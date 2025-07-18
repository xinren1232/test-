// 检查表结构详细信息
const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查表结构详细信息...\n');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const tableName of tables) {
      console.log(`📋 ${tableName} 表结构:`);
      
      // 获取表结构
      const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
      structure.forEach(field => {
        console.log(`   ${field.Field}: ${field.Type} | ${field.Null} | ${field.Key} | ${field.Default} | ${field.Extra}`);
      });
      
      // 获取创建表的SQL
      const [createTable] = await connection.execute(`SHOW CREATE TABLE ${tableName}`);
      console.log(`\n创建表SQL:\n${createTable[0]['Create Table']}\n`);
      console.log('---\n');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkTableStructure();
