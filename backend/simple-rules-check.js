import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function simpleRulesCheck() {
  console.log('🔍 简单规则检查...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查表结构
    console.log('1. 🏗️ 表结构:');
    const [columns] = await connection.execute('DESCRIBE nlp_intent_rules');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    // 2. 检查规则总数
    console.log('\n2. 📊 规则统计:');
    const [total] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    console.log(`   活跃规则总数: ${total[0].count}`);
    
    // 3. 检查库存相关规则
    console.log('\n3. 📦 库存相关规则:');
    const [inventoryRules] = await connection.execute(`
      SELECT intent_name, example_query
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (intent_name LIKE '%库存%' OR trigger_words LIKE '%库存%')
      LIMIT 5
    `);
    
    inventoryRules.forEach(rule => {
      console.log(`   - ${rule.intent_name}: ${rule.example_query}`);
    });
    
    // 4. 检查聚龙相关规则
    console.log('\n4. 🏢 聚龙相关规则:');
    const [julongRules] = await connection.execute(`
      SELECT intent_name, example_query
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (intent_name LIKE '%聚龙%' OR trigger_words LIKE '%聚龙%')
    `);
    
    if (julongRules.length > 0) {
      julongRules.forEach(rule => {
        console.log(`   - ${rule.intent_name}: ${rule.example_query}`);
      });
    } else {
      console.log('   ❌ 未找到聚龙专用规则');
    }
    
    // 5. 检查SQL问题
    console.log('\n5. 🗄️ SQL问题检查:');
    const [sqlProblems] = await connection.execute(`
      SELECT intent_name
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (action_target LIKE '%?%' OR action_target LIKE '%CONCAT%')
      LIMIT 3
    `);
    
    if (sqlProblems.length > 0) {
      console.log('   ❌ 发现SQL问题:');
      sqlProblems.forEach(rule => {
        console.log(`     - ${rule.intent_name}`);
      });
    } else {
      console.log('   ✅ SQL模板正常');
    }
    
    // 6. 测试规则匹配
    console.log('\n6. 🧠 规则匹配测试:');
    const testQuery = '查询聚龙供应商的库存';
    console.log(`   测试查询: "${testQuery}"`);
    
    // 检查库存关键词匹配
    const [matches] = await connection.execute(`
      SELECT intent_name, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND trigger_words LIKE '%库存%'
      ORDER BY priority DESC
      LIMIT 3
    `);
    
    if (matches.length > 0) {
      console.log('   匹配到的规则:');
      matches.forEach(rule => {
        console.log(`     - ${rule.intent_name} (优先级:${rule.priority})`);
      });
    } else {
      console.log('   ❌ 未找到匹配规则');
    }
    
    // 7. 问题总结
    console.log('\n📋 问题总结:');
    
    const issues = [];
    
    if (julongRules.length === 0) {
      issues.push('缺少聚龙供应商专用规则');
    }
    
    if (sqlProblems.length > 0) {
      issues.push(`SQL模板错误 (${sqlProblems.length}条)`);
    }
    
    if (matches.length === 0) {
      issues.push('规则匹配失效');
    }
    
    if (issues.length > 0) {
      console.log('   🚨 发现问题:');
      issues.forEach((issue, index) => {
        console.log(`     ${index + 1}. ${issue}`);
      });
    } else {
      console.log('   ✅ 规则系统基本正常');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

simpleRulesCheck();
