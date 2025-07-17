import mysql from 'mysql2/promise';
import dbConfig from './src/config/db.config.js';

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database
    });
    
    console.log('🔍 检查数据库表结构...');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 数据库中的表:');
    tables.forEach(table => console.log('  -', Object.values(table)[0]));
    
    // 检查具体需要的表
    const requiredTables = ['inventory_data', 'inspection_data', 'production_data', 'batch_management'];
    
    console.log('\n🎯 检查必需的表:');
    for (const tableName of requiredTables) {
      try {
        const [result] = await connection.execute(`SHOW TABLES LIKE '${tableName}'`);
        if (result.length > 0) {
          console.log(`  ✅ ${tableName} - 存在`);
          
          // 显示表结构
          const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
          console.log(`     字段: ${columns.map(col => col.Field).join(', ')}`);
        } else {
          console.log(`  ❌ ${tableName} - 不存在`);
        }
      } catch (error) {
        console.log(`  ❌ ${tableName} - 检查失败: ${error.message}`);
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
  }
}

checkTables();
