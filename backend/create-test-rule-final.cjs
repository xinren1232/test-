// 最终正确创建全测试规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function createTestRuleFinal() {
  try {
    console.log('🆕 最终正确创建全测试规则...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 先测试各个子查询
    console.log('🧪 1. 测试各个子查询:');
    
    // 测试库存查询
    const inventorySQL = `
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
    `;
    
    try {
      const [inventoryResults] = await connection.execute(inventorySQL);
      console.log(`✅ 库存查询: ${inventoryResults.length} 条数据`);
    } catch (error) {
      console.log(`❌ 库存查询失败: ${error.message}`);
    }
    
    // 测试检验查询
    const labTestSQL = `
      SELECT 
        '检验数据' as 数据类型,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 数值,
        conclusion as 状态,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期
      FROM lab_tests 
      LIMIT 3
    `;
    
    try {
      const [labResults] = await connection.execute(labTestSQL);
      console.log(`✅ 检验查询: ${labResults.length} 条数据`);
    } catch (error) {
      console.log(`❌ 检验查询失败: ${error.message}`);
    }
    
    // 测试上线查询
    const onlineSQL = `
      SELECT 
        '上线数据' as 数据类型,
        material_name as 物料名称,
        factory as 供应商,
        CAST(defect_rate AS CHAR) as 数值,
        '正常' as 状态,
        DATE_FORMAT(online_date, '%Y-%m-%d') as 日期
      FROM online_tracking 
      LIMIT 3
    `;
    
    try {
      const [onlineResults] = await connection.execute(onlineSQL);
      console.log(`✅ 上线查询: ${onlineResults.length} 条数据`);
    } catch (error) {
      console.log(`❌ 上线查询失败: ${error.message}`);
    }
    
    // 2. 测试完整的UNION查询
    console.log('\n🧪 2. 测试完整的UNION查询:');

    let finalSQL = `
      SELECT 
        '库存数据' as 数据类型,
        material_name as 物料名称,
        supplier_name as 供应商,
        CAST(quantity AS CHAR) as 数值,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 日期
      FROM inventory 
      WHERE status = '正常'
      LIMIT 2
      UNION ALL
      SELECT 
        '检验数据' as 数据类型,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 数值,
        conclusion as 状态,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期
      FROM lab_tests 
      LIMIT 2
      UNION ALL
      SELECT 
        '上线数据' as 数据类型,
        material_name as 物料名称,
        factory as 供应商,
        CAST(defect_rate AS CHAR) as 数值,
        '正常' as 状态,
        DATE_FORMAT(online_date, '%Y-%m-%d') as 日期
      FROM online_tracking 
      LIMIT 2
    `;
    
    try {
      const [unionResults] = await connection.execute(finalSQL);
      console.log(`✅ UNION查询成功: ${unionResults.length} 条数据`);
      if (unionResults.length > 0) {
        console.log(`   第一条数据:`, unionResults[0]);
      }
    } catch (error) {
      console.log(`❌ UNION查询失败: ${error.message}`);

      // 如果UNION失败，使用简单的库存查询作为备选
      console.log('\n使用简单的库存查询作为备选...');
      const simpleSQL = `
        SELECT
          material_name as 物料名称,
          supplier_name as 供应商,
          CAST(quantity AS CHAR) as 数量,
          status as 状态,
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期
        FROM inventory
        WHERE status = '正常'
        ORDER BY inbound_time DESC
        LIMIT 10
      `;

      try {
        const [simpleResults] = await connection.execute(simpleSQL);
        console.log(`✅ 简单查询成功: ${simpleResults.length} 条数据`);
        // 使用简单查询作为最终SQL
        finalSQL = simpleSQL;
      } catch (simpleError) {
        console.log(`❌ 简单查询也失败: ${simpleError.message}`);
        return;
      }
    }
    
    // 3. 创建全测试规则
    console.log('\n🆕 3. 创建全测试规则:');
    
    // 准备JSON格式的trigger_words
    const triggerWordsArray = ['全测试', '测试', '全部测试', '综合测试', '全部数据'];
    const triggerWordsJSON = JSON.stringify(triggerWordsArray);
    
    console.log(`触发词JSON: ${triggerWordsJSON}`);
    console.log(`SQL长度: ${finalSQL.length} 字符`);

    try {
      const [insertResult] = await connection.execute(`
        INSERT INTO nlp_intent_rules
        (intent_name, description, category, action_type, action_target, trigger_words, example_query, priority, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        '全测试_综合查询',
        '查询所有类型的测试数据，包括库存、检验、上线等综合信息',
        '综合查询',
        'SQL_QUERY',
        finalSQL.trim(),
        triggerWordsJSON,
        '全测试',
        100,
        'active'
      ]);
      
      console.log(`✅ 成功创建规则，ID: ${insertResult.insertId}`);
      
    } catch (error) {
      console.log(`❌ 创建失败: ${error.message}`);
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
    const testQueries = ['全测试', '测试', '综合测试'];
    
    for (const testQuery of testQueries) {
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
        
        try {
          const [results] = await connection.execute(rule.action_target);
          console.log(`   执行成功: ${results.length} 条数据`);
        } catch (error) {
          console.log(`   执行失败: ${error.message}`);
        }
      } else {
        console.log(`❌ 查询"${testQuery}"未匹配到任何规则`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 创建完成！');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
  }
}

createTestRuleFinal().catch(console.error);
