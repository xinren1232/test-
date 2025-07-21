import initializeDatabase from './src/models/index.js';

async function fixFactoryRuleActionType() {
  console.log('🔧 修复工厂库存查询规则的动作类型...\n');
  
  try {
    const db = await initializeDatabase();
    const NlpIntentRule = db.NlpIntentRule;
    
    // 1. 查找工厂库存查询规则
    console.log('📝 查找工厂库存查询规则...');
    const factoryRule = await NlpIntentRule.findOne({
      where: { intent_name: '工厂库存查询' }
    });
    
    if (factoryRule) {
      console.log(`✅ 找到规则: ${factoryRule.intent_name}`);
      console.log(`   - 当前动作类型: ${factoryRule.action_type}`);
      console.log(`   - 当前优先级: ${factoryRule.priority}`);
      
      // 2. 更新动作类型从 MEMORY_QUERY 到 SQL_QUERY
      await factoryRule.update({
        action_type: 'SQL_QUERY'
      });
      
      console.log(`✅ 动作类型已更新: ${factoryRule.action_type} -> SQL_QUERY`);
      
      // 3. 验证更新结果
      const updatedRule = await NlpIntentRule.findOne({
        where: { intent_name: '工厂库存查询' }
      });
      
      console.log('\n🔍 验证更新结果:');
      console.log(`   - 规则名称: ${updatedRule.intent_name}`);
      console.log(`   - 动作类型: ${updatedRule.action_type}`);
      console.log(`   - 优先级: ${updatedRule.priority}`);
      console.log(`   - 状态: ${updatedRule.status}`);
      
      console.log('\n🎉 规则修复完成！');
      
    } else {
      console.log('❌ 未找到工厂库存查询规则');
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixFactoryRuleActionType();
