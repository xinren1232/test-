/**
 * 检查触发词格式
 */
import mysql from 'mysql2/promise';

async function checkTriggerWordsFormat() {
  console.log('🔍 检查触发词格式\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 查看触发词字段
    console.log('📋 触发词字段内容:');
    const [rules] = await connection.query('SELECT id, intent_name, trigger_words, synonyms FROM nlp_intent_rules WHERE trigger_words IS NOT NULL LIMIT 3');
    
    for (const rule of rules) {
      console.log(`规则 ${rule.id}: ${rule.intent_name}`);
      console.log('触发词类型:', typeof rule.trigger_words);
      console.log('触发词内容:', rule.trigger_words);
      console.log('同义词类型:', typeof rule.synonyms);
      console.log('同义词内容:', rule.synonyms);
      console.log('---');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

checkTriggerWordsFormat();
