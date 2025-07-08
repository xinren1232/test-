import initializeDatabase from './src/models/index.js';

async function checkRulesTable() {
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    console.log('=== nlp_intent_rules表结构 ===');
    const columns = await sequelize.query('DESCRIBE nlp_intent_rules', {
      type: sequelize.QueryTypes.SELECT
    });
    
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? '可空' : '非空'})`);
    });
    
    console.log('\n=== 检查trigger_words字段的实际值 ===');
    const samples = await sequelize.query('SELECT intent_name, trigger_words FROM nlp_intent_rules LIMIT 3', {
      type: sequelize.QueryTypes.SELECT
    });
    
    samples.forEach(sample => {
      console.log(`规则: ${sample.intent_name}`);
      console.log(`trigger_words: ${sample.trigger_words}`);
      console.log(`类型: ${typeof sample.trigger_words}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkRulesTable();
