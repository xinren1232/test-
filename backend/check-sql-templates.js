import initializeDatabase from './src/models/index.js';

async function checkSQLTemplates() {
  console.log('📋 检查数据库中的SQL模板...\n');
  
  try {
    const db = await initializeDatabase();
    const rules = await db.NlpIntentRule.findAll({
      where: { status: 'active' },
      attributes: ['intent_name', 'action_target'],
      limit: 5
    });
    
    console.log('📋 数据库中的SQL模板示例:');
    rules.forEach(rule => {
      console.log(`\n🔍 规则: ${rule.intent_name}`);
      console.log(`SQL模板:`);
      console.log(rule.action_target);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkSQLTemplates();
