/**
 * 检查nlp_intent_rules表结构
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function checkStructure() {
  let connection = null;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 查看nlp_intent_rules表结构
    console.log('\n📋 nlp_intent_rules表结构:');
    const [columns] = await connection.execute('DESCRIBE nlp_intent_rules');
    columns.forEach((column, index) => {
      console.log(`  ${index + 1}. ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key ? `[${column.Key}]` : ''} ${column.Default !== null ? `默认: ${column.Default}` : ''}`);
    });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

checkStructure();
