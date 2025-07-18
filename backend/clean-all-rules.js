import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function cleanAllRules() {
  let connection;
  
  try {
    console.log('🧹 清理所有规则...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 删除所有规则
    await connection.execute('DELETE FROM nlp_intent_rules');
    console.log('✅ 所有规则已清理');
    
    // 验证清理结果
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
    console.log(`📊 当前规则数量: ${count[0].count}`);
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanAllRules().catch(console.error);
