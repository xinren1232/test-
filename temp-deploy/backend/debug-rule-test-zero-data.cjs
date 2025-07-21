// 调试规则测试返回0条数据的问题
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugRuleTestZeroData() {
  try {
    console.log('🔍 调试规则测试返回0条数据的问题...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查"全测试"相关的规则
    console.log('📊 1. 检查"全测试"相关的规则:');
    const [testRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words, priority, status
      FROM nlp_intent_rules 
      WHERE (trigger_words LIKE '%测试%' 
      OR trigger_words LIKE '%全测试%'
      OR intent_name LIKE '%测试%'
      OR intent_name LIKE '%全测试%')
      AND status = 'active'
      ORDER BY priority DESC
      LIMIT 10
    `);
    
    console.log(`找到 ${testRules.length} 条"测试"相关规则:`);
    for (const rule of testRules) {
      console.log(`\n规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log(`优先级: ${rule.priority}`);
      console.log(`SQL: ${rule.action_target.substring(0, 100)}...`);
      
      // 测试SQL执行
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ SQL执行成功: ${results.length} 条数据`);
        if (results.length > 0) {
          console.log(`   字段: ${Object.keys(results[0]).join(', ')}`);
        }
      } catch (sqlError) {
        console.log(`❌ SQL执行失败: ${sqlError.message}`);
      }
    }
    
    // 2. 检查规则匹配逻辑
    console.log('\n🔍 2. 测试规则匹配逻辑:');
    const testQuery = '全测试';
    
    // 模拟前端的规则匹配逻辑
    const [matchedRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (
        trigger_words LIKE ? 
        OR intent_name LIKE ?
        OR ? LIKE CONCAT('%', SUBSTRING_INDEX(trigger_words, ',', 1), '%')
      )
      ORDER BY priority DESC
      LIMIT 5
    `, [`%${testQuery}%`, `%${testQuery}%`, testQuery]);
    
    console.log(`查询"${testQuery}"匹配到 ${matchedRules.length} 条规则:`);
    for (const rule of matchedRules) {
      console.log(`\n匹配规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`触发词: ${rule.trigger_words}`);
      console.log(`优先级: ${rule.priority}`);
      
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ 执行结果: ${results.length} 条数据`);
        if (results.length > 0) {
          console.log(`   第一条数据:`, results[0]);
        }
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
      }
    }
    
    // 3. 检查数据库中的实际数据
    console.log('\n📊 3. 检查数据库中的实际数据:');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const table of tables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${count[0].count} 条数据`);
      
      if (count[0].count > 0) {
        const [sample] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
        console.log(`   样本数据字段: ${Object.keys(sample[0]).join(', ')}`);
      }
    }
    
    // 4. 测试简单的直接查询
    console.log('\n🧪 4. 测试简单的直接查询:');
    
    // 测试库存查询
    try {
      const [inventoryResults] = await connection.execute(`
        SELECT 
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态
        FROM inventory 
        WHERE status = '正常'
        LIMIT 5
      `);
      console.log(`✅ 库存查询: ${inventoryResults.length} 条数据`);
      if (inventoryResults.length > 0) {
        console.log(`   第一条:`, inventoryResults[0]);
      }
    } catch (error) {
      console.log(`❌ 库存查询失败: ${error.message}`);
    }
    
    // 测试检验查询
    try {
      const [testResults] = await connection.execute(`
        SELECT 
          test_id as 测试编号,
          material_name as 物料名称,
          test_result as 测试结果
        FROM lab_tests 
        LIMIT 5
      `);
      console.log(`✅ 检验查询: ${testResults.length} 条数据`);
      if (testResults.length > 0) {
        console.log(`   第一条:`, testResults[0]);
      }
    } catch (error) {
      console.log(`❌ 检验查询失败: ${error.message}`);
    }
    
    // 测试上线查询
    try {
      const [onlineResults] = await connection.execute(`
        SELECT 
          batch_code as 批次号,
          material_name as 物料名称,
          factory as 工厂
        FROM online_tracking 
        LIMIT 5
      `);
      console.log(`✅ 上线查询: ${onlineResults.length} 条数据`);
      if (onlineResults.length > 0) {
        console.log(`   第一条:`, onlineResults[0]);
      }
    } catch (error) {
      console.log(`❌ 上线查询失败: ${error.message}`);
    }
    
    // 5. 检查是否有通用的"全测试"规则
    console.log('\n🔍 5. 检查是否需要创建"全测试"规则:');
    const [generalTestRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE trigger_words LIKE '%全测试%'
      OR intent_name LIKE '%全测试%'
      ORDER BY priority DESC
    `);
    
    if (generalTestRules.length === 0) {
      console.log('❌ 没有找到"全测试"相关的规则，需要创建');
      
      // 创建一个通用的全测试规则
      const generalTestSQL = `
        SELECT 
          '库存' as 数据类型,
          material_name as 物料名称,
          supplier_name as 供应商,
          quantity as 数量,
          status as 状态
        FROM inventory 
        WHERE status = '正常'
        LIMIT 3
        UNION ALL
        SELECT 
          '检验' as 数据类型,
          material_name as 物料名称,
          supplier_name as 供应商,
          test_result as 数量,
          conclusion as 状态
        FROM lab_tests 
        LIMIT 3
        UNION ALL
        SELECT 
          '上线' as 数据类型,
          material_name as 物料名称,
          factory as 供应商,
          CAST(defect_rate AS CHAR) as 数量,
          '正常' as 状态
        FROM online_tracking 
        LIMIT 3
      `;
      
      try {
        await connection.execute(`
          INSERT INTO nlp_intent_rules 
          (intent_name, trigger_words, action_target, priority, status, category, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
          '全测试_综合查询',
          '全测试,测试,全部测试,综合测试',
          generalTestSQL.trim().replace(/\s+/g, ' '),
          100,
          'active',
          '综合查询'
        ]);
        
        console.log('✅ 已创建"全测试"规则');
        
        // 测试新创建的规则
        const [testNewRule] = await connection.execute(generalTestSQL);
        console.log(`✅ 新规则测试: ${testNewRule.length} 条数据`);
        if (testNewRule.length > 0) {
          console.log(`   第一条:`, testNewRule[0]);
        }
      } catch (error) {
        console.log(`❌ 创建规则失败: ${error.message}`);
      }
    } else {
      console.log(`✅ 找到 ${generalTestRules.length} 条"全测试"规则`);
    }
    
    await connection.end();
    console.log('\n🎉 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugRuleTestZeroData().catch(console.error);
