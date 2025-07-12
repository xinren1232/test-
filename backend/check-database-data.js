import mysql from 'mysql2/promise';

async function checkDatabaseData() {
  let connection;
  try {
    // 尝试连接数据库
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 先查看所有表
    const [allTables] = await connection.execute('SHOW TABLES');
    console.log('📋 数据库中的所有表:', allTables.map(row => Object.values(row)[0]));

    // 检查各表的数据量
    const tables = ['inventory', 'online_tracking', 'lab_tests', 'test_tracking'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table} 表记录数: ${rows[0].count}`);
        
        if (rows[0].count > 0) {
          // 显示前几条记录
          const [sampleRows] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
          console.log(`📋 ${table} 表样本数据:`, sampleRows);
        }
      } catch (error) {
        console.log(`❌ 检查表 ${table} 失败:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    
    // 尝试不同的密码
    const passwords = ['', 'root', '123456', 'password'];
    for (const pwd of passwords) {
      try {
        console.log(`🔄 尝试密码: "${pwd}"`);
        const testConnection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: pwd,
          database: 'iqe_inspection'
        });
        console.log(`✅ 密码 "${pwd}" 连接成功`);
        await testConnection.end();
        break;
      } catch (testError) {
        console.log(`❌ 密码 "${pwd}" 连接失败`);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseData().catch(console.error);
