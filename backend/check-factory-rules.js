/**
 * 检查工厂查询规则配置
 */

import mysql from 'mysql2/promise';

async function checkFactoryRules() {
  console.log('🔍 检查工厂查询规则配置\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 查询所有包含工厂相关的规则
    const [rules] = await connection.query(`
      SELECT id, intent_name, description, trigger_words, synonyms, parameters, action_target, status, priority
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%工厂%' OR trigger_words LIKE '%工厂%' OR description LIKE '%工厂%'
      ORDER BY priority DESC
    `);
    
    console.log(`📋 找到 ${rules.length} 条工厂相关规则:\n`);
    
    for (const rule of rules) {
      console.log(`🏭 规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   状态: ${rule.status} (优先级: ${rule.priority})`);
      
      // 解析触发词
      let triggerWords = rule.trigger_words;
      if (typeof triggerWords === 'string' && triggerWords.startsWith('[')) {
        try {
          triggerWords = JSON.parse(triggerWords);
        } catch (e) {
          console.log(`   触发词解析失败: ${triggerWords}`);
        }
      }
      console.log(`   触发词: ${Array.isArray(triggerWords) ? triggerWords.join(', ') : triggerWords}`);
      
      // 解析同义词
      if (rule.synonyms) {
        try {
          const synonyms = typeof rule.synonyms === 'string' ? JSON.parse(rule.synonyms) : rule.synonyms;
          console.log(`   同义词: ${JSON.stringify(synonyms)}`);
        } catch (e) {
          console.log(`   同义词解析失败: ${rule.synonyms}`);
        }
      }
      
      // 解析参数
      if (rule.parameters) {
        try {
          const params = typeof rule.parameters === 'string' ? JSON.parse(rule.parameters) : rule.parameters;
          console.log(`   参数配置: ${JSON.stringify(params, null, 2)}`);
        } catch (e) {
          console.log(`   参数解析失败: ${rule.parameters}`);
        }
      }
      
      console.log(`   SQL模板: ${rule.action_target}`);
      console.log('');
    }
    
    // 测试触发词匹配
    console.log('🧪 测试触发词匹配:');
    const testQueries = [
      '查询深圳工厂库存',
      '重庆工厂的情况怎么样？',
      '南昌工厂有多少库存？',
      '宜宾工厂库存分析'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试: "${query}"`);
      
      for (const rule of rules) {
        if (rule.status !== 'active') continue;
        
        let triggerWords = rule.trigger_words;
        if (typeof triggerWords === 'string' && triggerWords.startsWith('[')) {
          try {
            triggerWords = JSON.parse(triggerWords);
          } catch (e) {
            continue;
          }
        }
        
        if (Array.isArray(triggerWords)) {
          const matches = triggerWords.filter(word => query.includes(word));
          if (matches.length > 0) {
            console.log(`   ✅ 匹配规则 ${rule.id}: ${rule.intent_name}`);
            console.log(`      匹配词: ${matches.join(', ')}`);
          }
        }
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkFactoryRules();
