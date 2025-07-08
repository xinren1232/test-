import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('正在测试数据库连接...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
    });
    
    console.log('数据库连接成功！');
    await connection.end();
    console.log('连接已关闭');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    console.error('错误代码:', error.code);
  }
}

testConnection();
