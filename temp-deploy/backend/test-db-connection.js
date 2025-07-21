/**
 * 测试数据库连接
 */
import mysql from 'mysql2/promise';
import dbConfig from './src/config/db.config.js';

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...');
  console.log('📊 数据库配置:', {
    host: dbConfig.host,
    username: dbConfig.username,
    database: dbConfig.database,
    dialect: dbConfig.dialect
  });

  try {
    // 创建连接
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database
    });

    console.log('✅ 数据库连接成功');

    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ 测试查询成功:', rows);

    // 检查表是否存在
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 数据库表列表:', tables.map(t => Object.values(t)[0]));

    await connection.end();
    console.log('✅ 数据库连接测试完成');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('🔧 请检查:');
    console.error('   1. MySQL服务是否启动');
    console.error('   2. 数据库配置是否正确');
    console.error('   3. 数据库是否存在');
    process.exit(1);
  }
}

testDatabaseConnection();
