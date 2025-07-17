import mysql from 'mysql2/promise';

async function checkSpecificRule() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('=== 检查"供应商库存查询_优化"规则 ===');
    const [rules] = await connection.execute(`
      SELECT intent_name, description, action_target, trigger_words 
      FROM nlp_intent_rules 
      WHERE intent_name = '供应商库存查询_优化'
    `);
    
    if (rules.length > 0) {
      const rule = rules[0];
      console.log('规则名称:', rule.intent_name);
      console.log('描述:', rule.description);
      console.log('触发词:', rule.trigger_words);
      console.log('\n完整SQL:');
      console.log(rule.action_target);
    } else {
      console.log('未找到该规则');
    }
    
    await connection.end();
  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkSpecificRule();
