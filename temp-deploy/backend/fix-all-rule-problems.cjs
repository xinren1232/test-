// 修复所有规则问题
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixAllRuleProblems() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔧 开始修复所有规则问题...\n');
    
    // 1. 删除SQL为空或错误的规则
    console.log('1. 删除SQL为空或错误的规则:');
    
    const [emptyRules] = await connection.execute(`
      SELECT id, intent_name FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (action_target IS NULL OR action_target = '' OR action_target = 'inspection_data')
    `);
    
    console.log(`找到 ${emptyRules.length} 条SQL为空或错误的规则`);
    
    if (emptyRules.length > 0) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET status = 'inactive' 
        WHERE status = 'active' 
        AND (action_target IS NULL OR action_target = '' OR action_target = 'inspection_data')
      `);
      console.log(`✅ 已禁用 ${emptyRules.length} 条问题规则`);
    }
    
    // 2. 修复触发词格式问题
    console.log('\n2. 修复触发词格式问题:');
    
    const [triggerIssues] = await connection.execute(`
      SELECT id, intent_name, trigger_words FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND trigger_words IS NOT NULL 
      AND trigger_words != ''
      AND trigger_words NOT LIKE '[%'
      LIMIT 10
    `);
    
    console.log(`找到 ${triggerIssues.length} 条触发词格式问题`);
    
    for (const rule of triggerIssues) {
      let fixedTriggers = rule.trigger_words;
      
      // 如果不是JSON格式，转换为JSON数组
      if (!fixedTriggers.startsWith('[')) {
        const words = fixedTriggers.split(',').map(w => w.trim()).filter(w => w);
        fixedTriggers = JSON.stringify(words);
      }
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET trigger_words = ? 
        WHERE id = ?
      `, [fixedTriggers, rule.id]);
    }
    
    if (triggerIssues.length > 0) {
      console.log(`✅ 已修复 ${triggerIssues.length} 条触发词格式`);
    }
    
    // 3. 测试所有活跃规则的SQL
    console.log('\n3. 测试所有活跃规则的SQL:');
    
    const [activeRules] = await connection.execute(`
      SELECT id, intent_name, action_target FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND action_target IS NOT NULL 
      AND action_target != '' 
      AND action_target != 'inspection_data'
      ORDER BY id ASC
    `);
    
    console.log(`测试 ${activeRules.length} 条活跃规则...`);
    
    let successCount = 0;
    let errorCount = 0;
    const errorRules = [];
    
    for (const rule of activeRules) {
      try {
        await connection.execute(rule.action_target);
        successCount++;
      } catch (error) {
        errorCount++;
        errorRules.push({
          id: rule.id,
          name: rule.intent_name,
          error: error.message
        });
        
        // 禁用有SQL错误的规则
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET status = 'inactive' 
          WHERE id = ?
        `, [rule.id]);
      }
    }
    
    console.log(`✅ SQL测试完成: ${successCount} 成功, ${errorCount} 失败`);
    if (errorCount > 0) {
      console.log(`❌ 已禁用 ${errorCount} 条SQL错误的规则`);
    }
    
    // 4. 统计最终结果
    console.log('\n4. 最终统计:');
    
    const [finalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_rules,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_rules,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_rules
      FROM nlp_intent_rules
    `);
    
    console.log(`总规则数: ${finalStats[0].total_rules}`);
    console.log(`活跃规则: ${finalStats[0].active_rules}`);
    console.log(`禁用规则: ${finalStats[0].inactive_rules}`);
    
    // 5. 显示分类统计
    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📋 活跃规则分类:');
    for (const cat of categoryStats) {
      console.log(`${cat.category || '未分类'}: ${cat.count} 条`);
    }
    
    // 6. 创建测试查询
    console.log('\n6. 测试常用查询:');
    
    const testQueries = [
      { query: '全测试', expected: '全测试_综合查询' },
      { query: '库存查询', expected: '库存场景' },
      { query: '聚龙供应商', expected: '聚龙' },
      { query: '测试结果', expected: '测试' },
      { query: '上线情况', expected: '上线' }
    ];
    
    for (const test of testQueries) {
      const [matchedRules] = await connection.execute(`
        SELECT id, intent_name, trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND (
          intent_name LIKE ? OR
          trigger_words LIKE ? OR
          JSON_CONTAINS(trigger_words, ?)
        )
        LIMIT 1
      `, [`%${test.expected}%`, `%${test.query}%`, `"${test.query}"`]);
      
      if (matchedRules.length > 0) {
        console.log(`✅ "${test.query}" → 规则 ${matchedRules[0].id}: ${matchedRules[0].intent_name}`);
      } else {
        console.log(`❌ "${test.query}" → 未找到匹配规则`);
      }
    }
    
    await connection.end();
    
    console.log('\n🎉 规则修复完成！');
    console.log('\n💡 建议:');
    console.log('1. 重启后端服务以应用修复');
    console.log('2. 测试前端查询功能');
    console.log('3. 检查规则匹配效果');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    if (connection) await connection.end();
  }
}

// 执行修复
fixAllRuleProblems();
