/**
 * 检查数据库中的意图规则
 */
import { getActiveIntentRules } from './backend/src/scripts/initIntentRules.js';

async function checkDatabaseRules() {
  console.log('🔍 检查数据库中的意图规则\n');

  try {
    // 获取数据库中的活跃规则
    const dbRules = await getActiveIntentRules();
    
    if (dbRules && dbRules.length > 0) {
      console.log(`✅ 数据库中有 ${dbRules.length} 条活跃规则:`);
      
      for (let i = 0; i < dbRules.length; i++) {
        const rule = dbRules[i];
        console.log(`\n${i + 1}. ${rule.intent_name}`);
        console.log(`   描述: ${rule.description}`);
        console.log(`   状态: ${rule.status}`);
        console.log(`   优先级: ${rule.priority}`);
        console.log(`   动作类型: ${rule.action_type}`);
        console.log(`   触发词: ${JSON.stringify(rule.trigger_words)}`);
        
        // 检查动作目标
        if (rule.action_target) {
          const preview = rule.action_target.length > 100 
            ? rule.action_target.substring(0, 100) + '...'
            : rule.action_target;
          console.log(`   动作目标: ${preview}`);
        }
      }
      
    } else {
      console.log('❌ 数据库中没有活跃规则');
    }
    
  } catch (error) {
    console.error('❌ 检查数据库规则失败:', error);
  }
}

checkDatabaseRules();
