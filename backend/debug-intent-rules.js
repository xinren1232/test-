import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function debugIntentRules() {
  console.log('🔍 调试意图规则加载和匹配...\n');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查数据库中的规则
    console.log('1. 检查数据库中的规则:');
    const [rules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, status, priority, description
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority ASC
      LIMIT 10
    `);
    
    console.log(`找到 ${rules.length} 条活跃规则:`);
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
      console.log(`   状态: ${rule.status}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log('');
    });
    
    // 2. 测试具体的查询匹配
    console.log('2. 测试查询匹配:');
    const testQueries = [
      '查询电池库存',
      '查询BOE供应商的物料',
      '深圳工厂库存情况',
      '查询风险库存'
    ];
    
    for (const query of testQueries) {
      console.log(`\n测试查询: "${query}"`);
      
      let bestMatch = null;
      let bestScore = 0;
      
      for (const rule of rules) {
        let triggerWords = [];
        try {
          // 检查触发词的类型和格式
          if (typeof rule.trigger_words === 'string') {
            if (rule.trigger_words.startsWith('[')) {
              triggerWords = JSON.parse(rule.trigger_words);
            } else {
              triggerWords = rule.trigger_words.split(',').map(w => w.trim());
            }
          } else if (Array.isArray(rule.trigger_words)) {
            triggerWords = rule.trigger_words;
          } else {
            console.log(`⚠️ 未知的触发词格式: ${typeof rule.trigger_words}`, rule.trigger_words);
            continue;
          }
        } catch (e) {
          console.log(`⚠️ 解析触发词失败: ${rule.intent_name}`, e.message);
          continue;
        }
        
        let score = 0;
        const matchedWords = [];
        
        for (const word of triggerWords) {
          if (query.includes(word)) {
            score += word.length * 2; // 长词权重更高
            matchedWords.push(word);
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            rule: rule,
            score: score,
            matchedWords: matchedWords
          };
        }
      }
      
      if (bestMatch) {
        console.log(`  ✅ 最佳匹配: ${bestMatch.rule.intent_name}`);
        console.log(`     分数: ${bestMatch.score}`);
        console.log(`     匹配词: ${bestMatch.matchedWords.join(', ')}`);
      } else {
        console.log(`  ❌ 没有找到匹配的规则`);
      }
    }
    
    // 3. 检查特定的库存相关规则
    console.log('\n3. 检查库存相关规则:');
    const [inventoryRules] = await connection.execute(`
      SELECT intent_name, trigger_words, description
      FROM nlp_intent_rules 
      WHERE (intent_name LIKE '%库存%' OR trigger_words LIKE '%库存%')
      AND status = 'active'
    `);
    
    console.log(`找到 ${inventoryRules.length} 条库存相关规则:`);
    inventoryRules.forEach(rule => {
      console.log(`- ${rule.intent_name}: ${rule.trigger_words}`);
    });
    
    // 4. 检查供应商相关规则
    console.log('\n4. 检查供应商相关规则:');
    const [supplierRules] = await connection.execute(`
      SELECT intent_name, trigger_words, description
      FROM nlp_intent_rules 
      WHERE (intent_name LIKE '%供应商%' OR trigger_words LIKE '%供应商%' OR trigger_words LIKE '%BOE%')
      AND status = 'active'
    `);
    
    console.log(`找到 ${supplierRules.length} 条供应商相关规则:`);
    supplierRules.forEach(rule => {
      console.log(`- ${rule.intent_name}: ${rule.trigger_words}`);
    });
    
    // 5. 检查是否有重复或冲突的规则
    console.log('\n5. 检查规则冲突:');
    const [allActiveRules] = await connection.execute(`
      SELECT intent_name, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority ASC
    `);
    
    const triggerWordMap = new Map();
    
    allActiveRules.forEach(rule => {
      let triggerWords = [];
      try {
        if (rule.trigger_words.startsWith('[')) {
          triggerWords = JSON.parse(rule.trigger_words);
        } else {
          triggerWords = rule.trigger_words.split(',').map(w => w.trim());
        }
      } catch (e) {
        triggerWords = rule.trigger_words.split(',').map(w => w.trim());
      }
      
      triggerWords.forEach(word => {
        if (!triggerWordMap.has(word)) {
          triggerWordMap.set(word, []);
        }
        triggerWordMap.get(word).push({
          intent: rule.intent_name,
          priority: rule.priority
        });
      });
    });
    
    console.log('重复的触发词:');
    let hasConflicts = false;
    for (const [word, rules] of triggerWordMap.entries()) {
      if (rules.length > 1) {
        hasConflicts = true;
        console.log(`  "${word}": ${rules.map(r => `${r.intent}(${r.priority})`).join(', ')}`);
      }
    }
    
    if (!hasConflicts) {
      console.log('  没有发现重复的触发词');
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugIntentRules();
