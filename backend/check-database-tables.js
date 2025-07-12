/**
 * 检查数据库表结构
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDatabaseTables() {
  console.log('🔍 检查数据库表结构...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有表
    const [tables] = await connection.execute('SHOW TABLES');
    
    console.log('\n📊 数据库中的表:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });
    
    // 检查每个表的结构
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`\n📋 ${tableName} 表结构:`);
        columns.forEach(col => {
          console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // 检查数据量
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  📊 数据量: ${count[0].count} 条记录`);
        
      } catch (error) {
        console.log(`❌ 无法检查表 ${tableName}: ${error.message}`);
      }
    }
    
    return tables.map(table => Object.values(table)[0]);
    
  } finally {
    await connection.end();
  }
}

checkDatabaseTables().catch(console.error);
