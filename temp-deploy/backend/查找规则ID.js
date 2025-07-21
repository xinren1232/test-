import mysql from 'mysql2/promise';

async function findRuleIds() {
  let connection;
  
  try {
    console.log('🔍 查找规则ID...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 查找所有数据探索规则
    console.log('\n📋 数据探索规则:');
    const [explorationRules] = await connection.execute(`
      SELECT id, intent_name, category, status, priority
      FROM nlp_intent_rules 
      WHERE category = '数据探索'
      ORDER BY id
    `);
    
    explorationRules.forEach(rule => {
      console.log(`  ID: ${rule.id} - ${rule.intent_name} (${rule.status}) - 优先级: ${rule.priority}`);
    });
    
    // 2. 查找供应商相关规则
    console.log('\n🏭 供应商相关规则:');
    const [supplierRules] = await connection.execute(`
      SELECT id, intent_name, category, status, priority
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%供应商%'
      ORDER BY id
    `);
    
    supplierRules.forEach(rule => {
      console.log(`  ID: ${rule.id} - ${rule.intent_name} (${rule.category}) - 优先级: ${rule.priority}`);
    });
    
    // 3. 查找"查看所有供应商"规则
    console.log('\n🔍 查找"查看所有供应商"规则:');
    const [specificRule] = await connection.execute(`
      SELECT id, intent_name, trigger_words, action_target, category, status, priority
      FROM nlp_intent_rules 
      WHERE intent_name = '查看所有供应商'
    `);
    
    if (specificRule.length > 0) {
      const rule = specificRule[0];
      console.log(`  ID: ${rule.id}`);
      console.log(`  名称: ${rule.intent_name}`);
      console.log(`  分类: ${rule.category}`);
      console.log(`  状态: ${rule.status}`);
      console.log(`  优先级: ${rule.priority}`);
      console.log(`  触发词: ${rule.trigger_words}`);
      console.log(`  SQL: ${rule.action_target.substring(0, 100)}...`);
      
      // 测试这个规则
      console.log('\n🧪 测试规则执行:');
      try {
        const testResponse = await fetch(`http://localhost:3001/api/rules/test/${rule.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          if (testResult.success) {
            console.log(`✅ 规则测试成功: ${testResult.data.resultCount}条记录`);
            if (testResult.data.fields) {
              console.log(`   字段: ${testResult.data.fields.join(', ')}`);
            }
          } else {
            console.log(`❌ 规则测试失败: ${testResult.data.error}`);
          }
        } else {
          console.log(`❌ 规则测试请求失败: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ 规则测试异常: ${error.message}`);
      }
      
    } else {
      console.log('❌ 未找到"查看所有供应商"规则');
    }
    
    // 4. 测试规则匹配逻辑
    console.log('\n🎯 测试规则匹配逻辑:');
    
    const testQueries = [
      '查看所有供应商',
      '系统里有哪些供应商',
      '供应商列表',
      '所有供应商'
    ];
    
    for (const query of testQueries) {
      console.log(`\n测试查询: "${query}"`);
      
      // 获取所有活跃规则
      const [allRules] = await connection.execute(`
        SELECT id, intent_name, trigger_words, category, priority
        FROM nlp_intent_rules 
        WHERE status = 'active'
        ORDER BY priority DESC, id
      `);
      
      let bestMatch = null;
      let maxScore = 0;
      
      for (const rule of allRules) {
        if (!rule.trigger_words) continue;
        
        try {
          const triggers = JSON.parse(rule.trigger_words);
          if (!Array.isArray(triggers)) continue;
          
          let score = 0;
          const queryLower = query.toLowerCase();
          
          for (const trigger of triggers) {
            const triggerLower = trigger.toLowerCase();
            
            // 完全匹配
            if (queryLower === triggerLower) {
              score += 100;
            }
            // 包含匹配
            else if (queryLower.includes(triggerLower)) {
              score += 50;
            }
            // 被包含匹配
            else if (triggerLower.includes(queryLower)) {
              score += 30;
            }
          }
          
          if (score > maxScore) {
            maxScore = score;
            bestMatch = rule;
          }
        } catch (error) {
          // 忽略JSON解析错误
        }
      }
      
      if (bestMatch && maxScore > 5) {
        console.log(`  ✅ 匹配规则: ${bestMatch.intent_name} (得分: ${maxScore})`);
        console.log(`     分类: ${bestMatch.category}, 优先级: ${bestMatch.priority}`);
      } else {
        console.log(`  ❌ 未找到匹配规则 (最高得分: ${maxScore})`);
      }
    }
    
  } catch (error) {
    console.error('❌ 查找规则ID失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

findRuleIds().catch(console.error);
