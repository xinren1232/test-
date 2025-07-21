// 单独创建全测试规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function createTestRuleOnly() {
  try {
    console.log('🆕 创建全测试规则...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查trigger_words字段的数据类型
    console.log('📊 1. 检查trigger_words字段类型:');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM nlp_intent_rules WHERE Field = 'trigger_words'
    `);
    console.log('trigger_words字段信息:', columns[0]);
    
    // 2. 查看现有规则的trigger_words格式
    console.log('\n📊 2. 查看现有规则的trigger_words格式:');
    const [sampleRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words 
      FROM nlp_intent_rules 
      WHERE trigger_words IS NOT NULL 
      LIMIT 3
    `);
    
    for (const rule of sampleRules) {
      console.log(`规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log(`类型: ${typeof rule.trigger_words}`);
      console.log('---');
    }
    
    // 3. 删除可能存在的全测试规则
    console.log('\n🗑️ 3. 删除可能存在的全测试规则:');
    const [deleteResult] = await connection.execute(`
      DELETE FROM nlp_intent_rules 
      WHERE intent_name LIKE '%全测试%' 
      OR intent_name = '全测试_综合查询'
    `);
    console.log(`删除了 ${deleteResult.affectedRows} 条规则`);
    
    // 4. 创建全测试规则 - 使用简单字符串格式
    console.log('\n🆕 4. 创建全测试规则:');
    
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
    
    // 尝试不同的trigger_words格式
    const triggerWordsFormats = [
      '全测试,测试,全部测试,综合测试,全部数据',
      '["全测试","测试","全部测试","综合测试","全部数据"]',
      JSON.stringify(['全测试','测试','全部测试','综合测试','全部数据'])
    ];
    
    for (let i = 0; i < triggerWordsFormats.length; i++) {
      const triggerWords = triggerWordsFormats[i];
      console.log(`\n尝试格式 ${i + 1}: ${triggerWords}`);
      
      try {
        const [insertResult] = await connection.execute(`
          INSERT INTO nlp_intent_rules 
          (intent_name, trigger_words, action_target, priority, status, category, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
          '全测试_综合查询',
          triggerWords,
          generalTestSQL,
          100,
          'active',
          '综合查询'
        ]);
        
        console.log(`✅ 成功创建规则，ID: ${insertResult.insertId}`);
        
        // 测试新创建的规则
        const [testResults] = await connection.execute(generalTestSQL);
        console.log(`✅ 规则测试成功: ${testResults.length} 条数据`);
        if (testResults.length > 0) {
          console.log(`   第一条数据:`, testResults[0]);
        }
        
        break; // 成功就退出循环
        
      } catch (error) {
        console.log(`❌ 格式 ${i + 1} 失败: ${error.message}`);
        
        // 如果插入失败，删除可能的部分插入
        await connection.execute(`
          DELETE FROM nlp_intent_rules 
          WHERE intent_name = '全测试_综合查询' 
          AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
        `);
      }
    }
    
    // 5. 验证创建结果
    console.log('\n✅ 5. 验证创建结果:');
    const [verifyRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, priority, status
      FROM nlp_intent_rules 
      WHERE intent_name = '全测试_综合查询'
      OR trigger_words LIKE '%全测试%'
      ORDER BY created_at DESC
    `);
    
    if (verifyRules.length > 0) {
      console.log(`✅ 找到 ${verifyRules.length} 条全测试规则:`);
      for (const rule of verifyRules) {
        console.log(`   规则 ${rule.id}: ${rule.intent_name}`);
        console.log(`   触发词: ${rule.trigger_words}`);
        console.log(`   优先级: ${rule.priority}, 状态: ${rule.status}`);
      }
    } else {
      console.log('❌ 未找到全测试规则');
    }
    
    // 6. 测试规则匹配
    console.log('\n🧪 6. 测试规则匹配:');
    const testQuery = '全测试';
    
    const [matchedRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (
        trigger_words LIKE ? 
        OR intent_name LIKE ?
      )
      ORDER BY priority DESC
      LIMIT 1
    `, [`%${testQuery}%`, `%${testQuery}%`]);
    
    if (matchedRules.length > 0) {
      const rule = matchedRules[0];
      console.log(`✅ 查询"${testQuery}"匹配到规则: ${rule.intent_name}`);
      
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

createTestRuleOnly().catch(console.error);
