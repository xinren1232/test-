// 调试规则匹配问题
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugRuleMatching() {
  let connection;
  try {
    console.log('🔍 调试规则匹配问题...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查规则数据
    console.log('1. 检查规则数据:');
    
    const [rules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, status
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
    `);
    
    console.log(`活跃规则数: ${rules.length}`);
    
    if (rules.length === 0) {
      console.log('❌ 没有活跃规则！');
      return;
    }
    
    console.log('\n前5条规则:');
    for (let i = 0; i < Math.min(5, rules.length); i++) {
      const rule = rules[i];
      console.log(`规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`  触发词: ${rule.trigger_words}`);
      console.log(`  状态: ${rule.status}`);
      
      // 尝试解析触发词
      try {
        const parsed = JSON.parse(rule.trigger_words);
        console.log(`  解析后: ${JSON.stringify(parsed)}`);
      } catch (e) {
        console.log(`  解析失败: ${e.message}`);
      }
      console.log('');
    }
    
    // 2. 测试规则匹配逻辑
    console.log('\n2. 测试规则匹配逻辑:');
    
    const testQuery = '库存查询';
    console.log(`测试查询: "${testQuery}"`);
    
    for (const rule of rules) {
      let triggerWords = [];

      try {
        if (Array.isArray(rule.trigger_words)) {
          triggerWords = rule.trigger_words;
        } else if (typeof rule.trigger_words === 'string') {
          // 尝试解析JSON
          try {
            const parsed = JSON.parse(rule.trigger_words);
            triggerWords = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            // 如果不是JSON，按逗号分割
            triggerWords = rule.trigger_words.split(',').map(w => w.trim());
          }
        } else {
          triggerWords = [rule.trigger_words.toString()];
        }
      } catch (error) {
        console.log(`⚠️ 规则 ${rule.id} 触发词解析失败:`, error.message);
        triggerWords = [];
      }

      // 检查匹配
      const isMatch = triggerWords.some(word => {
        const trimmedWord = word.toString().trim();
        return testQuery.includes(trimmedWord) || trimmedWord.includes(testQuery);
      });
      
      // 也检查规则名称匹配
      const nameMatch = rule.intent_name.includes(testQuery) || testQuery.includes(rule.intent_name.split('_')[0]);
      
      if (isMatch || nameMatch) {
        console.log(`✅ 规则 ${rule.id} 匹配成功:`);
        console.log(`   规则名: ${rule.intent_name}`);
        console.log(`   触发词: ${JSON.stringify(triggerWords)}`);
        console.log(`   匹配方式: ${isMatch ? '触发词匹配' : '规则名匹配'}`);
        break;
      } else {
        console.log(`❌ 规则 ${rule.id} 不匹配: ${rule.intent_name}`);
        console.log(`   触发词: ${JSON.stringify(triggerWords)}`);
      }
    }
    
    // 3. 测试JSON_CONTAINS查询
    console.log('\n3. 测试JSON_CONTAINS查询:');
    
    const [jsonMatches] = await connection.execute(`
      SELECT id, intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND JSON_CONTAINS(trigger_words, ?)
      LIMIT 3
    `, [`"${testQuery}"`]);
    
    console.log(`JSON_CONTAINS匹配结果: ${jsonMatches.length} 条`);
    for (const match of jsonMatches) {
      console.log(`  规则 ${match.id}: ${match.intent_name}`);
    }
    
    // 4. 测试LIKE查询
    console.log('\n4. 测试LIKE查询:');
    
    const [likeMatches] = await connection.execute(`
      SELECT id, intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (trigger_words LIKE ? OR intent_name LIKE ?)
      LIMIT 3
    `, [`%${testQuery}%`, `%${testQuery}%`]);
    
    console.log(`LIKE匹配结果: ${likeMatches.length} 条`);
    for (const match of likeMatches) {
      console.log(`  规则 ${match.id}: ${match.intent_name}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
    if (connection) await connection.end();
  }
}

debugRuleMatching();
