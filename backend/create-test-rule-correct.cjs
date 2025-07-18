// 正确创建全测试规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function createTestRuleCorrect() {
  try {
    console.log('🆕 正确创建全测试规则...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查表结构
    console.log('📊 1. 检查nlp_intent_rules表结构:');
    const [columns] = await connection.execute(`SHOW COLUMNS FROM nlp_intent_rules`);
    
    console.log('表字段:');
    for (const col of columns) {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(必填)'} ${col.Default ? `默认值: ${col.Default}` : ''}`);
    }
    
    // 2. 查看现有规则的完整结构
    console.log('\n📊 2. 查看现有规则的完整结构:');
    const [sampleRule] = await connection.execute(`
      SELECT * FROM nlp_intent_rules 
      WHERE trigger_words IS NOT NULL 
      LIMIT 1
    `);
    
    if (sampleRule.length > 0) {
      console.log('样本规则结构:');
      for (const [key, value] of Object.entries(sampleRule[0])) {
        console.log(`  ${key}: ${value} (${typeof value})`);
      }
    }
    
    // 3. 创建全测试规则 - 包含所有必需字段
    console.log('\n🆕 3. 创建全测试规则:');
    
    const generalTestSQL = `
      SELECT 
        '库存数据' as 数据类型,
        material_name as 物料名称,
        supplier_name as 供应商,
        CAST(quantity AS CHAR) as 数值,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期
      FROM inventory 
      WHERE status = '正常'
      LIMIT 3
      UNION ALL
      SELECT 
        '检验数据' as 数据类型,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 数值,
        conclusion as 状态,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期
      FROM lab_tests 
      LIMIT 3
      UNION ALL
      SELECT 
        '上线数据' as 数据类型,
        material_name as 物料名称,
        factory as 供应商,
        CAST(defect_rate AS CHAR) as 数值,
        '正常' as 状态,
        DATE_FORMAT(online_date, '%Y-%m-%d') as 日期
      FROM online_tracking 
      LIMIT 3
    `.trim().replace(/\s+/g, ' ');
    
    // 准备JSON格式的trigger_words
    const triggerWordsArray = ['全测试', '测试', '全部测试', '综合测试', '全部数据'];
    const triggerWordsJSON = JSON.stringify(triggerWordsArray);
    
    console.log(`触发词JSON: ${triggerWordsJSON}`);
    
    try {
      // 先测试SQL是否正确
      console.log('\n测试SQL查询...');
      const [testSQL] = await connection.execute(generalTestSQL);
      console.log(`✅ SQL测试成功: ${testSQL.length} 条数据`);
      
      // 创建规则，包含所有必需字段
      const [insertResult] = await connection.execute(`
        INSERT INTO nlp_intent_rules 
        (intent_name, trigger_words, action_target, action_type, priority, status, category, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        '全测试_综合查询',
        triggerWordsJSON,
        generalTestSQL,
        'query', // 添加action_type
        100,
        'active',
        '综合查询'
      ]);
      
      console.log(`✅ 成功创建规则，ID: ${insertResult.insertId}`);
      
    } catch (error) {
      console.log(`❌ 创建失败: ${error.message}`);
      
      // 如果还是失败，尝试查看action_type的可能值
      console.log('\n查看action_type的可能值...');
      const [actionTypes] = await connection.execute(`
        SELECT DISTINCT action_type FROM nlp_intent_rules 
        WHERE action_type IS NOT NULL
      `);
      
      console.log('现有的action_type值:');
      for (const type of actionTypes) {
        console.log(`  ${type.action_type}`);
      }
      
      // 尝试使用现有的action_type
      if (actionTypes.length > 0) {
        const existingActionType = actionTypes[0].action_type;
        console.log(`\n尝试使用现有的action_type: ${existingActionType}`);
        
        try {
          const [insertResult2] = await connection.execute(`
            INSERT INTO nlp_intent_rules 
            (intent_name, trigger_words, action_target, action_type, priority, status, category, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            '全测试_综合查询',
            triggerWordsJSON,
            generalTestSQL,
            existingActionType,
            100,
            'active',
            '综合查询'
          ]);
          
          console.log(`✅ 成功创建规则，ID: ${insertResult2.insertId}`);
          
        } catch (error2) {
          console.log(`❌ 第二次尝试也失败: ${error2.message}`);
        }
      }
    }
    
    // 4. 验证创建结果
    console.log('\n✅ 4. 验证创建结果:');
    const [verifyRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, priority, status, action_type
      FROM nlp_intent_rules 
      WHERE intent_name = '全测试_综合查询'
      ORDER BY created_at DESC
    `);
    
    if (verifyRules.length > 0) {
      console.log(`✅ 找到 ${verifyRules.length} 条全测试规则:`);
      for (const rule of verifyRules) {
        console.log(`   规则 ${rule.id}: ${rule.intent_name}`);
        console.log(`   触发词: ${JSON.stringify(rule.trigger_words)}`);
        console.log(`   优先级: ${rule.priority}, 状态: ${rule.status}, 类型: ${rule.action_type}`);
      }
      
      // 测试规则执行
      const rule = verifyRules[0];
      try {
        const [ruleResults] = await connection.execute(`
          SELECT action_target FROM nlp_intent_rules WHERE id = ?
        `, [rule.id]);
        
        if (ruleResults.length > 0) {
          const [testResults] = await connection.execute(ruleResults[0].action_target);
          console.log(`✅ 规则执行成功: ${testResults.length} 条数据`);
          if (testResults.length > 0) {
            console.log(`   第一条数据:`, testResults[0]);
          }
        }
      } catch (error) {
        console.log(`❌ 规则执行失败: ${error.message}`);
      }
    } else {
      console.log('❌ 未找到全测试规则');
    }
    
    // 5. 测试规则匹配
    console.log('\n🧪 5. 测试规则匹配:');
    const testQuery = '全测试';
    
    // 使用JSON_CONTAINS函数进行匹配
    const [matchedRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (
        JSON_CONTAINS(trigger_words, ?) 
        OR intent_name LIKE ?
      )
      ORDER BY priority DESC
      LIMIT 1
    `, [JSON.stringify(testQuery), `%${testQuery}%`]);
    
    if (matchedRules.length > 0) {
      const rule = matchedRules[0];
      console.log(`✅ 查询"${testQuery}"匹配到规则: ${rule.intent_name}`);
      console.log(`   触发词: ${JSON.stringify(rule.trigger_words)}`);
      
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ 执行成功: ${results.length} 条数据`);
        if (results.length > 0) {
          console.log(`   第一条数据:`, results[0]);
        }
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
      }
    } else {
      console.log(`❌ 查询"${testQuery}"未匹配到任何规则`);
    }
    
    await connection.end();
    console.log('\n🎉 创建完成！');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
  }
}

createTestRuleCorrect().catch(console.error);
