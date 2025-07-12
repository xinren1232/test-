import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDataStatus() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查各表的数据量
    const tables = ['inventory', 'online_tracking', 'testing_records', 'batch_management'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}: ${rows[0].count} 条记录`);
        
        if (rows[0].count > 0) {
          // 显示前3条记录的字段
          const [sample] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
          console.log(`   示例字段: ${Object.keys(sample[0] || {}).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${table}: 表不存在或查询失败 - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDataStatus();
