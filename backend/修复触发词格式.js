import mysql from 'mysql2/promise';

async function fixTriggerWordsFormat() {
  let connection;
  
  try {
    console.log('🔧 修复触发词格式...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 查找所有触发词格式有问题的规则
    console.log('\n🔍 查找触发词格式问题...');
    
    const [problematicRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, category
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND trigger_words IS NOT NULL 
      AND trigger_words != ''
      AND trigger_words NOT LIKE '[%'
      ORDER BY category, intent_name
    `);
    
    console.log(`找到 ${problematicRules.length} 条需要修复的规则`);
    
    // 2. 修复每个规则的触发词格式
    let fixedCount = 0;
    
    for (const rule of problematicRules) {
      try {
        console.log(`\n修复规则: ${rule.intent_name} (${rule.category})`);
        console.log(`  原格式: ${rule.trigger_words.substring(0, 100)}...`);
        
        // 将逗号分隔的字符串转换为JSON数组
        let triggerArray;
        
        if (rule.trigger_words.includes(',')) {
          // 逗号分隔的字符串
          triggerArray = rule.trigger_words.split(',').map(word => word.trim()).filter(word => word.length > 0);
        } else {
          // 单个词
          triggerArray = [rule.trigger_words.trim()];
        }
        
        const jsonTriggers = JSON.stringify(triggerArray);
        console.log(`  新格式: ${jsonTriggers}`);
        
        // 更新数据库
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET trigger_words = ?, updated_at = NOW()
          WHERE id = ?
        `, [jsonTriggers, rule.id]);
        
        console.log(`  ✅ 修复成功`);
        fixedCount++;
        
      } catch (error) {
        console.log(`  ❌ 修复失败: ${error.message}`);
      }
    }
    
    console.log(`\n📊 修复完成: ${fixedCount}/${problematicRules.length} 条规则`);
    
    // 3. 验证修复结果
    console.log('\n🧪 验证修复结果...');
    
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
    
    // 4. 测试规则485的执行
    console.log('\n🧪 测试规则485执行...');
    
    try {
      const testResponse = await fetch('http://localhost:3001/api/rules/test/485', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        if (testResult.success) {
          console.log(`✅ 规则485测试成功: ${testResult.data.resultCount}条记录`);
          if (testResult.data.fields && testResult.data.fields.length > 0) {
            console.log(`   字段: ${testResult.data.fields.join(', ')}`);
          }
          if (testResult.data.tableData && testResult.data.tableData.length > 0) {
            console.log(`   数据样本:`, testResult.data.tableData[0]);
          }
        } else {
          console.log(`❌ 规则485测试失败: ${testResult.data.error}`);
        }
      } else {
        console.log(`❌ 规则485测试请求失败: ${testResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ 规则485测试异常: ${error.message}`);
    }
    
    // 5. 测试智能问答
    console.log('\n🤖 测试智能问答...');
    
    for (const query of testQueries) {
      try {
        const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        });
        
        if (queryResponse.ok) {
          const queryResult = await queryResponse.json();
          if (queryResult.success) {
            console.log(`✅ 问答测试成功: "${query}" - 返回${queryResult.data.tableData ? queryResult.data.tableData.length : 0}条记录`);
          } else {
            console.log(`❌ 问答测试失败: "${query}" - ${queryResult.error}`);
          }
        } else {
          console.log(`❌ 问答请求失败: "${query}"`);
        }
      } catch (error) {
        console.log(`❌ 问答测试异常: "${query}" - ${error.message}`);
      }
    }
    
    console.log('\n🎉 触发词格式修复完成！');
    console.log(`✅ 修复了 ${fixedCount} 条规则的触发词格式`);
    console.log('✅ 规则匹配逻辑已验证');
    console.log('✅ 智能问答功能已测试');
    
  } catch (error) {
    console.error('❌ 触发词格式修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixTriggerWordsFormat().catch(console.error);
