// 修复检验规则并创建全测试规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixInspectionRulesAndCreateTestRule() {
  try {
    console.log('🔧 修复检验规则并创建全测试规则...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 修复所有inspection_data相关的错误规则
    console.log('📊 1. 修复inspection_data相关的错误规则:');
    const [inspectionRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words 
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%inspection_data%'
      OR action_target = 'inspection_data'
      ORDER BY id
    `);
    
    console.log(`找到 ${inspectionRules.length} 条需要修复的检验规则`);
    
    for (const rule of inspectionRules) {
      console.log(`\n修复规则 ${rule.id}: ${rule.intent_name}`);
      
      let newSQL = `
        SELECT 
          test_id as 测试编号,
          DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
          material_name as 物料名称,
          supplier_name as 供应商,
          test_result as 测试结果,
          conclusion as 结论,
          COALESCE(defect_desc, '') as 缺陷描述,
          tester as 测试员
        FROM lab_tests 
        WHERE test_result IS NOT NULL
      `;
      
      const triggerWords = (rule.trigger_words || '').toString().toLowerCase();
      
      // 根据供应商添加过滤条件
      if (triggerWords.includes('boe')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%BOE%' AND");
      } else if (triggerWords.includes('天马')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%天马%' AND");
      } else if (triggerWords.includes('华星')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%华星%' AND");
      } else if (triggerWords.includes('聚龙')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%聚龙%' AND");
      } else if (triggerWords.includes('天实')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%天实%' AND");
      } else if (triggerWords.includes('深奥')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%深奥%' AND");
      } else if (triggerWords.includes('百佳达')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%百佳达%' AND");
      } else if (triggerWords.includes('奥海')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%奥海%' AND");
      } else if (triggerWords.includes('辉阳')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%辉阳%' AND");
      } else if (triggerWords.includes('理威')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%理威%' AND");
      } else if (triggerWords.includes('风华')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%风华%' AND");
      } else if (triggerWords.includes('维科')) {
        newSQL = newSQL.replace('WHERE', "WHERE supplier_name LIKE '%维科%' AND");
      }
      
      // 清理SQL格式
      newSQL = newSQL.trim().replace(/\s+/g, ' ');
      
      try {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ? 
          WHERE id = ?
        `, [newSQL, rule.id]);
        
        console.log(`✅ 规则 ${rule.id} 已修复`);
        
        // 测试新SQL
        const [testResults] = await connection.execute(newSQL);
        console.log(`   测试结果: ${testResults.length} 条数据`);
      } catch (error) {
        console.log(`❌ 规则 ${rule.id} 修复失败: ${error.message}`);
      }
    }
    
    // 2. 创建"全测试"规则
    console.log('\n🆕 2. 创建"全测试"规则:');
    
    // 检查是否已存在全测试规则
    const [existingTestRules] = await connection.execute(`
      SELECT id FROM nlp_intent_rules 
      WHERE intent_name LIKE '%全测试%' 
      OR trigger_words LIKE '%全测试%'
    `);
    
    if (existingTestRules.length > 0) {
      console.log('✅ 全测试规则已存在，跳过创建');
    } else {
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
      `;
      
      try {
        await connection.execute(`
          INSERT INTO nlp_intent_rules 
          (intent_name, trigger_words, action_target, priority, status, category, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
          '全测试_综合查询',
          '全测试,测试,全部测试,综合测试,全部数据',
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
          console.log(`   第一条数据:`, testNewRule[0]);
        }
      } catch (error) {
        console.log(`❌ 创建全测试规则失败: ${error.message}`);
      }
    }
    
    // 3. 验证修复结果
    console.log('\n✅ 3. 验证修复结果:');
    
    // 测试"全测试"查询
    const [testRuleMatch] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (trigger_words LIKE '%全测试%' OR trigger_words LIKE '%测试%')
      ORDER BY priority DESC
      LIMIT 1
    `);
    
    if (testRuleMatch.length > 0) {
      const rule = testRuleMatch[0];
      console.log(`✅ 找到全测试规则: ${rule.intent_name}`);
      
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ 全测试查询成功: ${results.length} 条数据`);
        if (results.length > 0) {
          console.log(`   数据示例:`, results[0]);
        }
      } catch (error) {
        console.log(`❌ 全测试查询失败: ${error.message}`);
      }
    } else {
      console.log('❌ 未找到全测试规则');
    }
    
    // 4. 测试其他常用查询
    console.log('\n🧪 4. 测试其他常用查询:');
    
    const testQueries = ['聚龙供应商', '库存查询', '上线情况'];
    
    for (const query of testQueries) {
      const [rules] = await connection.execute(`
        SELECT id, intent_name, action_target
        FROM nlp_intent_rules 
        WHERE status = 'active' 
        AND (trigger_words LIKE ? OR intent_name LIKE ?)
        ORDER BY priority DESC
        LIMIT 1
      `, [`%${query}%`, `%${query}%`]);
      
      if (rules.length > 0) {
        const rule = rules[0];
        try {
          const [results] = await connection.execute(rule.action_target);
          console.log(`✅ "${query}": ${results.length} 条数据`);
        } catch (error) {
          console.log(`❌ "${query}": ${error.message}`);
        }
      } else {
        console.log(`❌ "${query}": 未找到匹配规则`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 修复和创建完成！');
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }
}

fixInspectionRulesAndCreateTestRule().catch(console.error);
