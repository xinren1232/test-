/**
 * 检查数据库中的数据格式
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDbFormat() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查数据库中的数据格式...\n');
    
    const [rules] = await connection.execute(
      'SELECT intent_name, trigger_words, synonyms FROM nlp_intent_rules LIMIT 3'
    );
    
    rules.forEach((rule, index) => {
      console.log(`规则 ${index + 1}: ${rule.intent_name}`);
      console.log(`trigger_words: ${rule.trigger_words}`);
      console.log(`trigger_words type: ${typeof rule.trigger_words}`);
      console.log(`synonyms: ${rule.synonyms}`);
      console.log(`synonyms type: ${typeof rule.synonyms}`);
      console.log('─'.repeat(50));
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkDbFormat().catch(console.error);
