import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Flameaway3.',
  database: 'iQE_inspection_db',
  charset: 'utf8mb4'
};

const checkRules = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    const [rules] = await connection.execute('SELECT COUNT(*) as count FROM intelligent_intent_rules WHERE is_active = 1');
    console.log('📊 激活的智能意图规则数量:', rules[0].count);
    
    if (rules[0].count === 0) {
      console.log('❌ 数据库中没有激活的智能意图规则！');
      console.log('💡 这解释了为什么查询使用rule-based而不是intelligent-intent');
    } else {
      const [ruleDetails] = await connection.execute('SELECT intent_name, priority, trigger_words FROM intelligent_intent_rules WHERE is_active = 1 ORDER BY priority DESC');
      console.log('📋 激活的规则:');
      ruleDetails.forEach(rule => {
        console.log('  -', rule.intent_name, '(优先级:', rule.priority + ')');
      });
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
};

checkRules();
