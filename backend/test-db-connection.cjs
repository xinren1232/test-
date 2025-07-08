const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function testConnection() {
  try {
    console.log('🔍 测试数据库连接...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`📊 库存记录数量: ${rows[0].count}`);
    
    await connection.end();
    console.log('✅ 连接已关闭');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

testConnection();
