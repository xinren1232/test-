// 分析所有规则的状态
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function analyzeAllRules() {
  try {
    console.log('🔍 分析所有规则的状态...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取所有活跃规则
    console.log('📊 1. 获取所有活跃规则:');
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, category, action_type, trigger_words, priority, status,
             LENGTH(action_target) as sql_length,
             SUBSTRING(action_target, 1, 100) as sql_preview
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, priority DESC, id
    `);
    
    console.log(`总共找到 ${allRules.length} 条活跃规则\n`);
    
    // 按类别分组统计
    const categoryStats = {};
    for (const rule of allRules) {
      const category = rule.category || '未分类';
      if (!categoryStats[category]) {
        categoryStats[category] = [];
      }
      categoryStats[category].push(rule);
    }
    
    console.log('📈 按类别统计:');
    for (const [category, rules] of Object.entries(categoryStats)) {
      console.log(`  ${category}: ${rules.length} 条规则`);
    }
    console.log('');
    
    // 2. 测试每个规则的SQL执行
    console.log('🧪 2. 测试每个规则的SQL执行:');
    
    let successCount = 0;
    let errorCount = 0;
    const errorRules = [];
    const emptyRules = [];
    
    for (const rule of allRules) {
      console.log(`\n测试规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`  类别: ${rule.category}, 优先级: ${rule.priority}`);
      console.log(`  触发词: ${JSON.stringify(rule.trigger_words)}`);
      console.log(`  SQL预览: ${rule.sql_preview}...`);
      
      try {
        // 获取完整的SQL
        const [sqlResult] = await connection.execute(`
          SELECT action_target FROM nlp_intent_rules WHERE id = ?
        `, [rule.id]);
        
        if (sqlResult.length === 0) {
          console.log(`  ❌ 无法获取SQL内容`);
          errorRules.push({...rule, error: '无法获取SQL内容'});
          errorCount++;
          continue;
        }
        
        const sql = sqlResult[0].action_target;
        
        // 检查SQL是否为空或无效
        if (!sql || sql.trim().length === 0) {
          console.log(`  ❌ SQL为空`);
          errorRules.push({...rule, error: 'SQL为空'});
          errorCount++;
          continue;
        }
        
        // 检查是否包含错误的内容
        if (sql.includes('inspection_data') && !sql.includes('SELECT')) {
          console.log(`  ❌ SQL包含错误内容: inspection_data`);
          errorRules.push({...rule, error: 'SQL包含错误内容'});
          errorCount++;
          continue;
        }
        
        // 执行SQL
        const [results] = await connection.execute(sql);
        
        if (results.length === 0) {
          console.log(`  ⚠️  SQL执行成功但返回0条数据`);
          emptyRules.push(rule);
        } else {
          console.log(`  ✅ SQL执行成功: ${results.length} 条数据`);
          successCount++;
        }
        
      } catch (error) {
        console.log(`  ❌ SQL执行失败: ${error.message}`);
        errorRules.push({...rule, error: error.message});
        errorCount++;
      }
    }
    
    // 3. 统计结果
    console.log('\n📊 3. 测试结果统计:');
    console.log(`✅ 成功执行: ${successCount} 条规则`);
    console.log(`⚠️  返回空数据: ${emptyRules.length} 条规则`);
    console.log(`❌ 执行失败: ${errorCount} 条规则`);
    console.log(`📊 总计: ${allRules.length} 条规则\n`);
    
    // 4. 详细列出有问题的规则
    if (errorRules.length > 0) {
      console.log('❌ 4. 执行失败的规则详情:');
      for (const rule of errorRules) {
        console.log(`\n规则 ${rule.id}: ${rule.intent_name}`);
        console.log(`  错误: ${rule.error}`);
        console.log(`  类别: ${rule.category}`);
        console.log(`  SQL预览: ${rule.sql_preview}...`);
      }
    }
    
    if (emptyRules.length > 0) {
      console.log('\n⚠️  5. 返回空数据的规则:');
      for (const rule of emptyRules) {
        console.log(`\n规则 ${rule.id}: ${rule.intent_name}`);
        console.log(`  类别: ${rule.category}`);
        console.log(`  触发词: ${JSON.stringify(rule.trigger_words)}`);
      }
    }
    
    // 5. 检查数据库表的数据情况
    console.log('\n📊 6. 检查数据库表的数据情况:');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${count[0].count} 条数据`);
        
        if (count[0].count > 0) {
          const [sample] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
          console.log(`  字段: ${Object.keys(sample[0]).join(', ')}`);
        }
      } catch (error) {
        console.log(`${table}: 查询失败 - ${error.message}`);
      }
    }
    
    // 6. 提供修复建议
    console.log('\n💡 7. 修复建议:');
    
    if (errorRules.length > 0) {
      console.log(`\n🔧 需要修复 ${errorRules.length} 条错误规则:`);
      
      // 按错误类型分组
      const errorTypes = {};
      for (const rule of errorRules) {
        const errorType = rule.error.includes('inspection_data') ? 'SQL内容错误' : 
                         rule.error.includes('syntax') ? 'SQL语法错误' : 
                         rule.error.includes('Table') ? '表不存在' : '其他错误';
        
        if (!errorTypes[errorType]) {
          errorTypes[errorType] = [];
        }
        errorTypes[errorType].push(rule);
      }
      
      for (const [errorType, rules] of Object.entries(errorTypes)) {
        console.log(`\n  ${errorType}: ${rules.length} 条规则`);
        for (const rule of rules.slice(0, 3)) { // 只显示前3条
          console.log(`    - 规则 ${rule.id}: ${rule.intent_name}`);
        }
        if (rules.length > 3) {
          console.log(`    - 还有 ${rules.length - 3} 条...`);
        }
      }
    }
    
    if (emptyRules.length > 0) {
      console.log(`\n📊 ${emptyRules.length} 条规则返回空数据，可能需要:`);
      console.log(`  - 检查查询条件是否过于严格`);
      console.log(`  - 确认数据库中是否有对应的数据`);
      console.log(`  - 调整SQL查询逻辑`);
    }
    
    await connection.end();
    console.log('\n🎉 分析完成！');
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  }
}

analyzeAllRules().catch(console.error);
