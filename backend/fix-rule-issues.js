/**
 * 修复规则问题，基于实际数据优化规则设计
 */

import mysql from 'mysql2/promise';

async function fixRuleIssues() {
  console.log('🔧 修复规则问题，基于实际数据优化\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 1. 分析实际测试数据的结果值
    console.log('📊 步骤1: 分析实际测试数据...');
    
    const [testResults] = await connection.query(`
      SELECT test_result, COUNT(*) as count 
      FROM lab_tests 
      GROUP BY test_result 
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('实际测试结果分布:');
    console.table(testResults);
    
    // 2. 分析实际生产数据的字段
    console.log('\n📊 步骤2: 分析实际生产数据...');
    
    const [productionSample] = await connection.query(`
      SELECT * FROM online_tracking LIMIT 3
    `);
    
    console.log('生产数据样本:');
    console.table(productionSample);
    
    // 3. 修复工厂查询规则的参数提取问题
    console.log('\n🔧 步骤3: 修复工厂查询规则...');
    
    // 更新工厂查询规则，改进参数提取和SQL模板
    await connection.query(`
      UPDATE nlp_intent_rules
      SET
        action_target = ?,
        trigger_words = ?,
        synonyms = ?,
        description = ?
      WHERE intent_name LIKE '%工厂%' AND id = 82
    `, [
      'SELECT * FROM inventory WHERE storage_location LIKE CONCAT("%", ?, "%") ORDER BY inbound_time DESC',
      '["重庆工厂","深圳工厂","南昌工厂","宜宾工厂","重庆","深圳","南昌","宜宾","工厂","库存"]',
      '{"重庆": ["重庆工厂", "重庆厂区"], "深圳": ["深圳工厂", "深圳厂区"], "南昌": ["南昌工厂", "南昌厂区"], "宜宾": ["宜宾工厂", "宜宾厂区"]}',
      '查询特定工厂的库存详情，支持工厂名称参数提取'
    ]);
    console.log('✅ 工厂查询规则已更新');
    
    // 4. 修复测试查询规则，使用实际的测试结果值
    console.log('\n🔧 步骤4: 修复测试查询规则...');
    
    // 更新测试结果规则，使用PASS/FAIL而不是OK/NG
    await connection.query(`
      UPDATE nlp_intent_rules
      SET
        trigger_words = ?,
        synonyms = ?,
        action_target = ?,
        description = ?
      WHERE intent_name LIKE '%测试%' AND id = 81
    `, [
      '["PASS","FAIL","测试","结果","统计","合格","不合格","通过","失败"]',
      '{"PASS": ["合格", "通过", "OK"], "FAIL": ["不合格", "失败", "NG"], "测试": ["检验", "检测", "质检"]}',
      'SELECT * FROM lab_tests WHERE test_result LIKE CONCAT("%", ?, "%") ORDER BY test_date DESC',
      '统计真实测试结果分布，支持PASS/FAIL状态查询'
    ]);
    console.log('✅ 测试查询规则已更新');
    
    // 5. 优化生产查询规则
    console.log('\n🔧 步骤5: 优化生产查询规则...');
    
    await connection.query(`
      UPDATE nlp_intent_rules
      SET
        trigger_words = ?,
        synonyms = ?,
        action_target = ?,
        description = ?
      WHERE intent_name LIKE '%生产%' AND id = 80
    `, [
      '["车间","生产","分析","工厂","产线","制造","加工","生产线","产能","效率"]',
      '{"车间": ["生产车间", "制造车间"], "产线": ["生产线", "生产流水线"], "工厂": ["厂区", "制造厂"]}',
      'SELECT * FROM online_tracking WHERE factory LIKE CONCAT("%", ?, "%") ORDER BY online_date DESC',
      '分析真实工厂的生产情况，包括产线效率和车间统计'
    ]);
    console.log('✅ 生产查询规则已更新');
    
    // 6. 添加新的综合查询规则
    console.log('\n🔧 步骤6: 添加新的综合查询规则...');
    
    // 添加测试结果统计规则
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, trigger_words, synonyms,
        action_target, action_type, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '测试结果统计分析',
      '统计和分析测试结果的分布情况',
      '["PASS","FAIL","测试统计","结果分析","合格率","不合格率"]',
      '{"统计": ["分析", "汇总"], "合格": ["PASS", "通过"], "不合格": ["FAIL", "失败"]}',
      'SELECT test_result, COUNT(*) as count, ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as percentage FROM lab_tests GROUP BY test_result',
      'SQL_QUERY',
      10,
      'active'
    ]);
    console.log('✅ 测试结果统计规则已添加');
    
    // 添加工厂生产效率规则
    await connection.query(`
      INSERT INTO nlp_intent_rules (
        intent_name, description, trigger_words, synonyms,
        action_target, action_type, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      '工厂生产效率分析',
      '分析各工厂的生产效率和缺陷率',
      '["生产效率","缺陷率","工厂效率","产能分析"]',
      '{"效率": ["产能", "生产力"], "缺陷": ["不良", "问题"]}',
      'SELECT factory, COUNT(*) as production_count, AVG(defect_rate) as avg_defect_rate FROM online_tracking GROUP BY factory ORDER BY avg_defect_rate ASC',
      'SQL_QUERY',
      9,
      'active'
    ]);
    console.log('✅ 工厂生产效率规则已添加');
    
    // 7. 验证修复效果
    console.log('\n✅ 步骤7: 验证修复效果...');
    
    const [updatedRules] = await connection.query(`
      SELECT id, intent_name, description, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC
    `);
    
    console.log(`\n📋 更新后的规则列表 (共${updatedRules.length}条):`);
    for (const rule of updatedRules) {
      console.log(`${rule.id}. ${rule.intent_name} (优先级: ${rule.priority})`);
      console.log(`   描述: ${rule.description}`);
      const triggerWords = typeof rule.trigger_words === 'string' ?
        rule.trigger_words.substring(0, 50) :
        JSON.stringify(rule.trigger_words).substring(0, 50);
      console.log(`   触发词: ${triggerWords}...`);
      console.log('');
    }
    
    await connection.end();
    
    console.log('🎉 规则修复完成！');
    console.log('\n💡 修复内容总结:');
    console.log('1. ✅ 修复工厂查询的参数提取问题');
    console.log('2. ✅ 更新测试查询使用实际的PASS/FAIL值');
    console.log('3. ✅ 优化生产查询的触发词和SQL模板');
    console.log('4. ✅ 添加测试结果统计分析规则');
    console.log('5. ✅ 添加工厂生产效率分析规则');
    console.log('\n🔄 建议重新运行测试验证修复效果');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

fixRuleIssues();
