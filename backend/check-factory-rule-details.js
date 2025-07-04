/**
 * 检查工厂查询规则详细信息
 */
import mysql from 'mysql2/promise';

async function checkFactoryRuleDetails() {
  console.log('🏭 检查工厂查询规则详细信息\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    const [rules] = await connection.query('SELECT * FROM nlp_intent_rules WHERE intent_name LIKE "%工厂%"');
    
    for (const rule of rules) {
      console.log('规则名称:', rule.intent_name);
      console.log('参数定义:', rule.parameters);
      console.log('SQL模板:', rule.action_target);
      console.log('---');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

checkFactoryRuleDetails();
