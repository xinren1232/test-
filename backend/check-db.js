import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function checkDatabase() {
  try {
    console.log('连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    
    // 检查所有表
    console.log('\n=== 检查数据库表 ===');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('现有表:', tables.map(t => Object.values(t)[0]));
    
    // 检查每个表的数据量
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`- ${tableName}: ${count[0].count} 条记录`);
      } catch (error) {
        console.log(`- ${tableName}: 查询失败 - ${error.message}`);
      }
    }
    
    // 检查库存表结构和数据
    if (tables.some(t => Object.values(t)[0] === 'inventory')) {
      console.log('\n=== 库存表结构 ===');
      const [columns] = await connection.execute('DESCRIBE inventory');
      console.log('字段:', columns.map(c => `${c.Field} (${c.Type})`));
      
      console.log('\n=== 库存表示例数据 ===');
      const [sample] = await connection.execute('SELECT * FROM inventory LIMIT 3');
      console.log(sample);
    }
    
    await connection.end();
    console.log('\n数据库检查完成');
    
  } catch (error) {
    console.error('数据库检查失败:', error.message);
  }
}

checkDatabase();
