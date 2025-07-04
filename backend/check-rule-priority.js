/**
 * 检查规则优先级
 */
import mysql from 'mysql2/promise';

async function checkRulePriority() {
  console.log('🔍 检查规则优先级\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 查看所有规则的优先级
    const [rules] = await connection.query('SELECT intent_name, priority FROM nlp_intent_rules ORDER BY priority DESC');
    
    console.log('📋 规则优先级排序:');
    for (const rule of rules) {
      console.log(`优先级 ${rule.priority || 'NULL'}: ${rule.intent_name}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

checkRulePriority();
