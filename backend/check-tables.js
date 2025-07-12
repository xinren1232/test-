// 检查数据库表结构
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkTables() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('📋 检查数据库表结构...\n');
    
    // 查看所有表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('🗂️ 数据库中的表:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // 检查每个表的结构和数据量
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📊 表 ${tableName}:`);
      
      // 获取表结构
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      console.log('  字段:');
      columns.forEach(col => {
        console.log(`    - ${col.Field} (${col.Type})`);
      });
      
      // 获取数据量
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  数据量: ${count[0].count} 条记录`);
      
      // 获取示例数据
      if (count[0].count > 0) {
        const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1`);
        console.log('  示例数据:', sample[0]);
      }
    }
    
    await connection.end();
    console.log('\n✅ 表结构检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkTables();
