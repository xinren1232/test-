import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRulesCount() {
  let connection;
  
  try {
    console.log('📊 检查规则库状态...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查总规则数量
    const [totalCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
    console.log(`总规则数量: ${totalCount[0].count}`);
    
    // 检查各状态规则数量
    const [statusCount] = await connection.execute('SELECT status, COUNT(*) as count FROM nlp_intent_rules GROUP BY status');
    console.log('\n各状态规则数量:');
    statusCount.forEach(row => {
      console.log(`  ${row.status}: ${row.count}条`);
    });
    
    // 检查各类别规则数量
    const [categoryCount] = await connection.execute('SELECT category, COUNT(*) as count FROM nlp_intent_rules GROUP BY category ORDER BY count DESC');
    console.log('\n各类别规则数量:');
    categoryCount.forEach(row => {
      console.log(`  ${row.category}: ${row.count}条`);
    });
    
    // 显示所有规则名称
    const [allRules] = await connection.execute('SELECT id, intent_name, category, status FROM nlp_intent_rules ORDER BY id');
    console.log('\n所有规则列表:');
    allRules.forEach(rule => {
      console.log(`  [${rule.id}] ${rule.intent_name} (${rule.category}) - ${rule.status}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkRulesCount().catch(console.error);
