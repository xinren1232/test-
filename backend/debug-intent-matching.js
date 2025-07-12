import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugIntentMatching() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 调试意图匹配问题...\n');
    
    const testQuery = "查询电池的在线跟踪";
    console.log(`测试查询: "${testQuery}"\n`);
    
    // 1. 检查相关规则的优先级和触发词
    console.log('1. 检查相关规则的优先级和触发词:');
    const [rules] = await connection.execute(`
      SELECT intent_name, trigger_words, priority, description
      FROM nlp_intent_rules 
      WHERE intent_name IN ('在线跟踪查询', '物料库存信息查询', '在线跟踪相关查询')
      ORDER BY priority ASC
    `);
    
    rules.forEach(rule => {
      console.log(`规则: ${rule.intent_name}`);
      console.log(`优先级: ${rule.priority}`);
      console.log(`描述: ${rule.description}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log('---');
    });
    
    // 2. 模拟意图匹配逻辑
    console.log('\n2. 模拟意图匹配逻辑:');
    
    const [allRules] = await connection.execute(`
      SELECT intent_name, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority ASC
    `);
    
    const matchResults = [];
    
    for (const rule of allRules) {
      let triggerWords = [];
      try {
        triggerWords = JSON.parse(rule.trigger_words);
      } catch (e) {
        triggerWords = rule.trigger_words.split(',').map(w => w.trim());
      }
      
      let score = 0;
      const matchedWords = [];
      
      for (const word of triggerWords) {
        if (testQuery.includes(word)) {
          score += 10;
          matchedWords.push(word);
        }
      }
      
      // 检查规则名称匹配
      if (testQuery.includes('在线') && rule.intent_name.includes('在线')) {
        score += 5;
        matchedWords.push('规则名称匹配:在线');
      }
      
      if (testQuery.includes('跟踪') && rule.intent_name.includes('跟踪')) {
        score += 5;
        matchedWords.push('规则名称匹配:跟踪');
      }
      
      if (testQuery.includes('库存') && rule.intent_name.includes('库存')) {
        score += 5;
        matchedWords.push('规则名称匹配:库存');
      }
      
      if (score > 0) {
        matchResults.push({
          intent_name: rule.intent_name,
          priority: rule.priority,
          score: score,
          matchedWords: matchedWords
        });
      }
    }
    
    // 按分数排序
    matchResults.sort((a, b) => b.score - a.score);
    
    console.log('匹配结果 (按分数排序):');
    matchResults.slice(0, 5).forEach((result, index) => {
      console.log(`${index + 1}. ${result.intent_name}`);
      console.log(`   分数: ${result.score}, 优先级: ${result.priority}`);
      console.log(`   匹配词: ${result.matchedWords.join(', ')}`);
      console.log('');
    });
    
    // 3. 检查"在线跟踪查询"规则的触发词
    console.log('3. 检查"在线跟踪查询"规则的触发词:');
    const [trackingRule] = await connection.execute(`
      SELECT trigger_words FROM nlp_intent_rules WHERE intent_name = '在线跟踪查询'
    `);
    
    if (trackingRule.length > 0) {
      const triggerWords = JSON.parse(trackingRule[0].trigger_words);
      console.log(`当前触发词: ${triggerWords.join(', ')}`);
      
      const hasMatch = triggerWords.some(word => testQuery.includes(word));
      console.log(`是否匹配查询"${testQuery}": ${hasMatch ? '是' : '否'}`);
      
      if (!hasMatch) {
        console.log('❌ 问题发现: "在线跟踪查询"规则的触发词不包含"在线"或"跟踪"');
        console.log('💡 建议: 需要更新触发词列表');
      }
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await connection.end();
  }
}

debugIntentMatching();
