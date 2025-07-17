import mysql from 'mysql2/promise';

async function checkSupplierRule() {
  let connection;
  
  try {
    console.log('🔍 检查供应商规则...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查所有数据探索规则
    console.log('\n📋 检查所有数据探索规则...');
    
    const [explorationRules] = await connection.execute(`
      SELECT intent_name, trigger_words, status, priority, category
      FROM nlp_intent_rules 
      WHERE category = '数据探索'
      ORDER BY intent_name
    `);
    
    console.log('数据探索规则:');
    explorationRules.forEach(rule => {
      let triggerWords = [];
      try {
        if (typeof rule.trigger_words === 'string') {
          triggerWords = JSON.parse(rule.trigger_words || '[]');
        } else if (Array.isArray(rule.trigger_words)) {
          triggerWords = rule.trigger_words;
        } else {
          triggerWords = [];
        }
      } catch (e) {
        triggerWords = rule.trigger_words ? String(rule.trigger_words).split(',') : [];
      }
      
      console.log(`  ${rule.intent_name} (${rule.status}): ${triggerWords.length}个触发词`);
      console.log(`    触发词: ${triggerWords.slice(0, 5).join(', ')}${triggerWords.length > 5 ? '...' : ''}`);
    });
    
    // 2. 检查是否存在"查看所有供应商"规则
    console.log('\n🔍 检查"查看所有供应商"规则...');
    
    const [supplierRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, status, priority, category
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%供应商%'
      ORDER BY intent_name
    `);
    
    console.log('供应商相关规则:');
    supplierRules.forEach(rule => {
      console.log(`  ${rule.intent_name} (${rule.status}) - 分类: ${rule.category}`);
    });
    
    // 3. 如果没有找到"查看所有供应商"规则，创建它
    const hasSupplierExplorationRule = supplierRules.some(rule => 
      rule.intent_name === '查看所有供应商' && rule.category === '数据探索'
    );
    
    if (!hasSupplierExplorationRule) {
      console.log('\n➕ 创建"查看所有供应商"规则...');
      
      const supplierTriggers = [
        "供应商列表", "所有供应商", "有哪些供应商", "供应商有什么",
        "系统里有哪些供应商", "供应商都有什么", "查看供应商", "显示供应商",
        "供应商信息", "厂商列表", "供货商", "制造商", "供应商", "查看所有供应商"
      ];
      
      const supplierSQL = `SELECT DISTINCT 
  supplier as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE supplier IS NOT NULL AND supplier != ''
GROUP BY supplier
ORDER BY 记录数量 DESC`;
      
      await connection.execute(`
        INSERT INTO nlp_intent_rules 
        (intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, created_at, updated_at)
        VALUES (?, ?, 'SQL_QUERY', ?, ?, ?, ?, 80, 'active', NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        action_target = VALUES(action_target),
        trigger_words = VALUES(trigger_words),
        category = VALUES(category),
        priority = VALUES(priority),
        status = VALUES(status),
        updated_at = NOW()
      `, [
        '查看所有供应商',
        '显示系统中所有供应商的列表',
        supplierSQL,
        JSON.stringify(supplierTriggers),
        '系统里有哪些供应商？',
        '数据探索'
      ]);
      
      console.log('✅ 创建"查看所有供应商"规则');
    } else {
      console.log('✅ "查看所有供应商"规则已存在');
    }
    
    // 4. 测试规则匹配
    console.log('\n🧪 测试规则匹配...');
    
    const testQueries = [
      '系统里有哪些供应商？',
      '查看所有供应商',
      '供应商列表',
      '供应商'
    ];
    
    for (const testQuery of testQueries) {
      const queryLower = testQuery.toLowerCase();
      
      // 获取所有数据探索规则
      const [rules] = await connection.execute(`
        SELECT intent_name, trigger_words, category, priority
        FROM nlp_intent_rules 
        WHERE status = 'active' AND category = '数据探索'
        ORDER BY priority DESC
      `);
      
      let bestMatch = null;
      let maxScore = 0;
      
      for (const rule of rules) {
        let score = 0;
        let triggerWords = [];
        
        try {
          if (typeof rule.trigger_words === 'string') {
            triggerWords = JSON.parse(rule.trigger_words || '[]');
          } else if (Array.isArray(rule.trigger_words)) {
            triggerWords = rule.trigger_words;
          } else {
            triggerWords = [];
          }
        } catch (e) {
          triggerWords = rule.trigger_words ? String(rule.trigger_words).split(',').map(w => w.trim()) : [];
        }
        
        // 检查触发词匹配
        for (const word of triggerWords) {
          if (queryLower.includes(word.toLowerCase())) {
            score += word.length * 2;
          }
        }
        
        // 规则名称匹配
        if (rule.intent_name && queryLower.includes(rule.intent_name.toLowerCase())) {
          score += 50;
        }
        
        if (score > maxScore) {
          maxScore = score;
          bestMatch = rule;
        }
      }
      
      if (bestMatch) {
        console.log(`✅ "${testQuery}" → ${bestMatch.intent_name} (得分: ${maxScore})`);
      } else {
        console.log(`❌ "${testQuery}" → 无匹配规则`);
      }
    }
    
    // 5. 统计最终结果
    console.log('\n📊 最终统计...');
    
    const [finalStats] = await connection.execute(`
      SELECT 
        intent_name,
        JSON_LENGTH(trigger_words) as trigger_count,
        priority,
        status
      FROM nlp_intent_rules 
      WHERE category = '数据探索'
      ORDER BY intent_name
    `);
    
    console.log('数据探索规则统计:');
    finalStats.forEach(rule => {
      console.log(`  ${rule.intent_name}: ${rule.trigger_count}个触发词 (优先级: ${rule.priority}, 状态: ${rule.status})`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkSupplierRule().catch(console.error);
