/**
 * 数据库连接测试脚本
 * 用于验证MySQL数据库连接是否正常
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testDatabaseConnection() {
  console.log('🔍 开始测试数据库连接...');
  console.log('数据库配置:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    password: '***' // 隐藏密码
  });

  try {
    // 1. 测试基本连接（不指定数据库）
    console.log('\n1️⃣ 测试MySQL服务连接...');

    // 使用正确的密码连接
    const basicConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: 'root',
      password: 'Zxylsy.99'
    });

    const [rows] = await basicConnection.execute('SELECT VERSION() as version');
    console.log('✅ MySQL服务连接成功！版本:', rows[0].version);
    await basicConnection.end();

    // 2. 检查数据库是否存在
    console.log('\n2️⃣ 检查数据库是否存在...');
    const checkDbConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: 'root',
      password: 'Zxylsy.99'
    });

    const [databases] = await checkDbConnection.execute(
      'SHOW DATABASES LIKE ?', [dbConfig.database]
    );
    
    if (databases.length === 0) {
      console.log('⚠️  数据库不存在，正在创建...');
      await checkDbConnection.execute(
        `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log('✅ 数据库创建成功！');
    } else {
      console.log('✅ 数据库已存在');
    }
    await checkDbConnection.end();

    // 3. 测试完整连接
    console.log('\n3️⃣ 测试完整数据库连接...');
    const fullConnection = await mysql.createConnection(dbConfig);
    
    const [tables] = await fullConnection.execute('SHOW TABLES');
    console.log('✅ 数据库连接成功！');
    console.log('📊 当前数据表:', tables.map(t => Object.values(t)[0]));
    
    await fullConnection.end();
    
    console.log('\n🎉 数据库连接测试完成！所有测试通过。');
    return true;

  } catch (error) {
    console.error('\n❌ 数据库连接测试失败:');
    console.error('错误类型:', error.code);
    console.error('错误信息:', error.message);
    
    // 提供常见错误的解决建议
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 解决建议:');
      console.log('1. 检查MySQL服务是否已启动');
      console.log('2. 确认端口号是否正确 (默认3306)');
      console.log('3. 检查防火墙设置');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 解决建议:');
      console.log('1. 检查用户名和密码是否正确');
      console.log('2. 确认用户是否有足够的权限');
      console.log('3. 可能需要创建数据库用户');
    }
    
    return false;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

export default testDatabaseConnection;
