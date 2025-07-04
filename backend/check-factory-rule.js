/**
 * 检查工厂查询规则
 */
import mysql from 'mysql2/promise';

async function checkFactoryRule() {
  console.log('🏭 检查工厂查询规则\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    const [rules] = await connection.query('SELECT intent_name, trigger_words, synonyms FROM nlp_intent_rules WHERE intent_name LIKE "%工厂%"');
    
    for (const rule of rules) {
      console.log('规则名称:', rule.intent_name);
      console.log('触发词:', rule.trigger_words);
      console.log('同义词:', rule.synonyms);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

checkFactoryRule();
