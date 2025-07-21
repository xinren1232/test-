/**
 * 检查数据库表结构
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function checkTables() {
  let connection = null;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 查看所有表
    console.log('\n📋 数据库中的所有表:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${Object.values(table)[0]}`);
    });

    // 检查nlp_rules表
    console.log('\n🔍 检查nlp_rules表:');
    try {
      const [nlpRules] = await connection.execute('SELECT COUNT(*) as count FROM nlp_rules');
      console.log(`  nlp_rules表中有 ${nlpRules[0].count} 条记录`);
      
      if (nlpRules[0].count > 0) {
        const [sampleRules] = await connection.execute('SELECT id, intent, category FROM nlp_rules LIMIT 5');
        console.log('  示例规则:');
        sampleRules.forEach(rule => {
          console.log(`    ${rule.id}. ${rule.intent} (${rule.category})`);
        });
      }
    } catch (error) {
      console.log(`  nlp_rules表不存在或查询失败: ${error.message}`);
    }

    // 检查nlp_intent_rules表
    console.log('\n🔍 检查nlp_intent_rules表:');
    try {
      const [intentRules] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
      console.log(`  nlp_intent_rules表中有 ${intentRules[0].count} 条记录`);
      
      if (intentRules[0].count > 0) {
        const [sampleRules] = await connection.execute('SELECT id, intent_name, category FROM nlp_intent_rules LIMIT 5');
        console.log('  示例规则:');
        sampleRules.forEach(rule => {
          console.log(`    ${rule.id}. ${rule.intent_name} (${rule.category})`);
        });
      }
    } catch (error) {
      console.log(`  nlp_intent_rules表不存在或查询失败: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

checkTables();
