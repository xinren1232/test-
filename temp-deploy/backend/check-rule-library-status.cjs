// 检查规则库状态
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRuleLibraryStatus() {
  let connection;
  try {
    console.log('🔍 检查规则库状态...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查规则表是否存在
    console.log('1. 检查规则表结构:');
    try {
      const [tableInfo] = await connection.execute(`
        DESCRIBE nlp_intent_rules
      `);
      console.log('✅ nlp_intent_rules表存在，字段:');
      for (const field of tableInfo) {
        console.log(`   ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(可空)' : '(非空)'}`);
      }
    } catch (error) {
      console.log('❌ nlp_intent_rules表不存在:', error.message);
      return;
    }
    
    // 2. 检查规则总数
    console.log('\n2. 检查规则数量:');
    const [countResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM nlp_intent_rules
    `);
    
    console.log(`总规则数: ${countResult[0].total}`);
    console.log(`活跃规则: ${countResult[0].active}`);
    console.log(`禁用规则: ${countResult[0].inactive}`);
    
    if (countResult[0].total === 0) {
      console.log('❌ 规则库为空！需要导入规则数据');
      return;
    }
    
    // 3. 检查规则分类
    console.log('\n3. 检查规则分类:');
    const [categories] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    for (const cat of categories) {
      console.log(`${cat.category || '未分类'}: ${cat.count} 条`);
    }
    
    // 4. 检查示例规则
    console.log('\n4. 检查示例规则:');
    const [sampleRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
      LIMIT 5
    `);
    
    for (const rule of sampleRules) {
      console.log(`规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`  触发词: ${rule.trigger_words || '无'}`);
      console.log(`  SQL: ${rule.action_target ? rule.action_target.substring(0, 50) + '...' : '无'}`);
    }
    
    // 5. 检查常用查询的规则匹配
    console.log('\n5. 检查常用查询的规则匹配:');
    
    const testQueries = ['全测试', '库存查询', '聚龙供应商', '测试结果', '上线情况'];
    
    for (const query of testQueries) {
      console.log(`\n查询: "${query}"`);
      
      // 模拟后端的规则匹配逻辑
      const [matchingRules] = await connection.execute(`
        SELECT id, intent_name, trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND (
          intent_name LIKE ? OR
          trigger_words LIKE ? OR
          JSON_CONTAINS(trigger_words, ?)
        )
        ORDER BY priority DESC
        LIMIT 3
      `, [`%${query}%`, `%${query}%`, `"${query}"`]);
      
      if (matchingRules.length > 0) {
        console.log(`  ✅ 找到 ${matchingRules.length} 条匹配规则:`);
        for (const rule of matchingRules) {
          console.log(`     规则 ${rule.id}: ${rule.intent_name}`);
        }
      } else {
        console.log(`  ❌ 未找到匹配规则`);
      }
    }
    
    // 6. 检查规则库文件
    console.log('\n6. 检查规则库文件:');
    const fs = require('fs');
    
    const ruleFiles = [
      'rules-for-frontend.json',
      '../ai-inspection-dashboard/src/data/rules.json',
      '../frontend/rules.json'
    ];
    
    for (const file of ruleFiles) {
      try {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          console.log(`✅ ${file}: ${(stats.size/1024).toFixed(1)}KB (${stats.mtime})`);
        } else {
          console.log(`❌ ${file}: 文件不存在`);
        }
      } catch (error) {
        console.log(`❌ ${file}: 检查失败`);
      }
    }
    
    // 7. 建议
    console.log('\n💡 建议:');
    if (countResult[0].active === 0) {
      console.log('❌ 没有活跃规则，需要:');
      console.log('   1. 导入规则库数据');
      console.log('   2. 激活规则状态');
    } else if (countResult[0].active < 50) {
      console.log('⚠️  活跃规则较少，建议:');
      console.log('   1. 检查规则导入是否完整');
      console.log('   2. 确认规则状态设置');
    } else {
      console.log('✅ 规则库状态正常');
      console.log('   1. 规则数量充足');
      console.log('   2. 可以正常匹配查询');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    if (connection) await connection.end();
  }
}

checkRuleLibraryStatus();
