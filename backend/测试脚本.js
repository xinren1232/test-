console.log('测试脚本开始执行...');

import mysql from 'mysql2/promise';

console.log('mysql模块导入成功');

async function testConnection() {
  console.log('开始测试数据库连接...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('数据库连接成功');
    
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log('inventory表记录数:', result[0].count);
    
    await connection.end();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
}

testConnection().then(() => {
  console.log('测试完成');
}).catch(error => {
  console.error('测试失败:', error);
});
