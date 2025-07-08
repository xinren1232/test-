import initializeDatabase from './src/models/index.js';

async function checkAllRuleNames() {
  console.log('🔍 检查所有规则名称...\n');
  
  try {
    const db = await initializeDatabase();
    const NlpIntentRule = db.NlpIntentRule;
    
    const rules = await NlpIntentRule.findAll({
      attributes: ['intent_name', 'description', 'priority', 'status'],
      order: [['priority', 'DESC']]
    });
    
    console.log(`📋 找到 ${rules.length} 条规则:\n`);
    
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   - 描述: ${rule.description}`);
      console.log(`   - 优先级: ${rule.priority}`);
      console.log(`   - 状态: ${rule.status}`);
      console.log('');
    });
    
    // 查找包含"工厂"的规则
    console.log('🏭 包含"工厂"的规则:');
    const factoryRules = rules.filter(rule => 
      rule.intent_name.includes('工厂') || 
      rule.description.includes('工厂')
    );
    
    factoryRules.forEach(rule => {
      console.log(`   - ${rule.intent_name} (${rule.description}) - 优先级: ${rule.priority}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkAllRuleNames();
