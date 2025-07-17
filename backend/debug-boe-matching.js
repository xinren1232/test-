import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugBOEMatching() {
  console.log('🐛 调试BOE匹配问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const query = 'BOE供应商上线情况';
    console.log(`🔍 调试查询: "${query}"`);
    
    // 1. 提取关键词
    const keywords = query.toLowerCase().match(/[\u4e00-\u9fa5a-zA-Z0-9]+/g) || [];
    console.log(`\n1. 提取的关键词: [${keywords.join(', ')}]`);
    
    // 2. 测试每个关键词的匹配
    console.log('\n2. 逐个关键词测试:');
    
    for (const keyword of keywords) {
      console.log(`\n   关键词: "${keyword}"`);
      
      const [matches] = await connection.execute(`
        SELECT intent_name, trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND (intent_name LIKE ? OR trigger_words LIKE ?)
        LIMIT 3
      `, [`%${keyword}%`, `%${keyword}%`]);
      
      if (matches.length > 0) {
        console.log(`     匹配到 ${matches.length} 条规则:`);
        matches.forEach(match => {
          console.log(`       - ${match.intent_name}`);
        });
      } else {
        console.log(`     ❌ 无匹配`);
      }
    }
    
    // 3. 测试组合匹配
    console.log('\n3. 组合匹配测试:');
    
    // 测试BOE + 上线
    const [boeOnlineMatch] = await connection.execute(`
      SELECT intent_name, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND trigger_words LIKE '%BOE%'
      AND trigger_words LIKE '%上线%'
    `);
    
    if (boeOnlineMatch.length > 0) {
      console.log('   ✅ BOE+上线匹配成功:');
      boeOnlineMatch.forEach(match => {
        console.log(`     - ${match.intent_name} (优先级:${match.priority})`);
        console.log(`       触发词: ${match.trigger_words}`);
      });
    } else {
      console.log('   ❌ BOE+上线匹配失败');
    }
    
    // 4. 测试完整匹配算法
    console.log('\n4. 完整匹配算法测试:');
    
    const conditions = [];
    const params = [];
    
    keywords.forEach(keyword => {
      conditions.push('(intent_name LIKE ? OR trigger_words LIKE ? OR example_query LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    });
    
    const sql = `
      SELECT 
        intent_name, 
        category, 
        priority, 
        trigger_words,
        (
          CASE WHEN intent_name LIKE ? THEN 100 ELSE 0 END +
          CASE WHEN trigger_words LIKE ? THEN 50 ELSE 0 END +
          CASE WHEN example_query LIKE ? THEN 30 ELSE 0 END
        ) as match_score
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (${conditions.join(' OR ')})
      ORDER BY match_score DESC, priority DESC, sort_order ASC
      LIMIT 10
    `;
    
    const scoreParams = [`%${query}%`, `%${query}%`, `%${query}%`];
    const allParams = [...scoreParams, ...params];
    
    const [fullMatches] = await connection.execute(sql, allParams);
    
    if (fullMatches.length > 0) {
      console.log('   匹配结果:');
      fullMatches.forEach((match, index) => {
        console.log(`     ${index + 1}. ${match.intent_name} (分数:${match.match_score}, 优先级:${match.priority})`);
        console.log(`        分类: ${match.category}`);
        console.log(`        触发词: ${match.trigger_words}`);
      });
    } else {
      console.log('   ❌ 完整算法匹配失败');
    }
    
    // 5. 直接查找BOE上线规则
    console.log('\n5. 直接查找BOE上线规则:');
    
    const [directBOE] = await connection.execute(`
      SELECT intent_name, trigger_words, example_query, priority, sort_order
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND intent_name = 'BOE供应商上线查询'
    `);
    
    if (directBOE.length > 0) {
      const rule = directBOE[0];
      console.log('   ✅ 找到BOE上线规则:');
      console.log(`     规则名: ${rule.intent_name}`);
      console.log(`     触发词: ${rule.trigger_words}`);
      console.log(`     示例: ${rule.example_query}`);
      console.log(`     优先级: ${rule.priority}`);
      console.log(`     排序: ${rule.sort_order}`);
      
      // 检查触发词是否包含查询关键词
      const triggerWords = JSON.parse(rule.trigger_words);
      console.log('\n   触发词分析:');
      keywords.forEach(keyword => {
        const found = triggerWords.some(tw => tw.includes(keyword) || keyword.includes(tw));
        console.log(`     "${keyword}": ${found ? '✅' : '❌'}`);
      });
      
    } else {
      console.log('   ❌ 未找到BOE上线规则');
    }
    
    // 6. 问题诊断
    console.log('\n6. 🔧 问题诊断:');
    
    if (directBOE.length === 0) {
      console.log('   ❌ 规则不存在');
    } else if (boeOnlineMatch.length === 0) {
      console.log('   ❌ 触发词设置问题');
    } else if (fullMatches.length === 0) {
      console.log('   ❌ 匹配算法问题');
    } else {
      // 检查BOE规则是否在结果中
      const boeInResults = fullMatches.some(m => m.intent_name === 'BOE供应商上线查询');
      if (boeInResults) {
        console.log('   ✅ 规则匹配正常，可能是排序问题');
      } else {
        console.log('   ❌ 规则未被匹配到');
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugBOEMatching();
