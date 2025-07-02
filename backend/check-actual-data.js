/**
 * 检查数据库中的实际数据结构和内容
 */
import mysql from 'mysql2/promise';

async function checkActualData() {
  console.log('🔍 检查数据库中的实际数据结构和内容...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 连接到数据库成功！');
    
    // 1. 检查所有表
    console.log('\n📊 数据库表列表:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // 2. 检查每个表的结构和数据
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n🔍 表 ${tableName} 的结构:`);
      
      // 显示表结构
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // 显示数据样本
      const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 3`);
      if (rows.length > 0) {
        console.log(`\n📋 表 ${tableName} 的数据样本 (前3条):`);
        rows.forEach((row, index) => {
          console.log(`  记录 ${index + 1}:`, JSON.stringify(row, null, 2));
        });
      } else {
        console.log(`\n⚠️  表 ${tableName} 没有数据`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 数据库检查完成！');
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error);
    process.exit(1);
  }
}

checkActualData();
