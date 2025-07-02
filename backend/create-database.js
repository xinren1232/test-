import mysql from 'mysql2/promise';

async function createDatabase() {
  console.log('🔍 创建IQE数据库...');
  
  try {
    // 连接到MySQL服务器
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99'
    });
    
    console.log('✅ 连接到MySQL服务器成功！');
    
    // 创建数据库
    await connection.execute('CREATE DATABASE IF NOT EXISTS `iqe_inspection` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 数据库 iqe_inspection 创建成功！');
    
    // 检查数据库是否存在
    const [databases] = await connection.execute('SHOW DATABASES LIKE "iqe_inspection"');
    if (databases.length > 0) {
      console.log('✅ 数据库验证成功！');
    }
    
    await connection.end();
    console.log('🎉 数据库创建完成！');
    
  } catch (error) {
    console.error('❌ 数据库创建失败:', error.message);
    process.exit(1);
  }
}

createDatabase();
