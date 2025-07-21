import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkTriggerWords() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute('SELECT intent_name, trigger_words FROM nlp_intent_rules LIMIT 10');
    
    console.log('规则触发词检查:');
    rules.forEach(rule => {
      console.log(`${rule.intent_name}: ${rule.trigger_words}`);
    });
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTriggerWords().catch(console.error);
