/**
 * 检查NLP规则数据
 */
import initializeDatabase from './src/models/index.js';

async function checkRules() {
  console.log('🔍 检查NLP规则数据...');
  
  try {
    const db = await initializeDatabase();
    const rules = await db.NlpIntentRule.findAll({
      where: { status: 'active' },
      raw: true,
    });
    
    console.log(`找到 ${rules.length} 条规则:`);
    
    rules.forEach((rule, index) => {
      console.log(`\n规则 ${index + 1}:`);
      console.log(`  意图名称: ${rule.intent_name}`);
      console.log(`  描述: ${rule.description}`);
      console.log(`  动作类型: ${rule.action_type}`);
      console.log(`  动作目标: ${rule.action_target}`);
      console.log(`  参数: ${rule.parameters}`);
      console.log(`  示例查询: ${rule.example_query}`);
    });
    
    await db.sequelize.close();
    
  } catch (error) {
    console.error('❌ 检查规则失败:', error);
  }
}

checkRules();
