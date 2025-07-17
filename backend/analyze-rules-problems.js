import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function analyzeRulesProblems() {
  console.log('🔍 全面检查规则部分问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查规则数量和状态
    console.log('1. 📊 规则数量和状态检查:');
    const [ruleStats] = await connection.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY status
    `);
    
    ruleStats.forEach(row => {
      console.log(`   - ${row.status}: ${row.count} 条规则`);
    });
    
    // 2. 检查规则匹配逻辑问题
    console.log('\n2. 🎯 规则匹配逻辑问题检查:');
    
    // 检查关键词匹配
    const [keywordRules] = await connection.execute(`
      SELECT 
        intent_name,
        keywords,
        trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (keywords IS NULL OR keywords = '' OR trigger_words IS NULL)
      LIMIT 5
    `);
    
    if (keywordRules.length > 0) {
      console.log('   ❌ 发现关键词缺失的规则:');
      keywordRules.forEach(rule => {
        console.log(`     - ${rule.intent_name}: keywords="${rule.keywords}", trigger_words="${rule.trigger_words}"`);
      });
    } else {
      console.log('   ✅ 关键词配置正常');
    }
    
    // 3. 检查SQL模板问题
    console.log('\n3. 🗄️ SQL模板问题检查:');
    
    // 检查包含参数占位符的规则
    const [parameterRules] = await connection.execute(`
      SELECT 
        intent_name,
        action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND action_target LIKE '%?%'
      LIMIT 5
    `);
    
    if (parameterRules.length > 0) {
      console.log('   ❌ 发现包含参数占位符的规则:');
      parameterRules.forEach(rule => {
        console.log(`     - ${rule.intent_name}`);
        console.log(`       SQL: ${rule.action_target.substring(0, 100)}...`);
      });
    } else {
      console.log('   ✅ 无参数占位符问题');
    }
    
    // 检查字段映射问题
    const [fieldRules] = await connection.execute(`
      SELECT 
        intent_name,
        action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (action_target LIKE '%supplier%' AND action_target NOT LIKE '%supplier_name%')
      LIMIT 5
    `);
    
    if (fieldRules.length > 0) {
      console.log('   ❌ 发现字段映射错误的规则:');
      fieldRules.forEach(rule => {
        console.log(`     - ${rule.intent_name}`);
      });
    } else {
      console.log('   ✅ 字段映射正常');
    }
    
    // 4. 检查具体的聚龙供应商规则
    console.log('\n4. 🏢 聚龙供应商相关规则检查:');
    
    const [julongRules] = await connection.execute(`
      SELECT 
        intent_name,
        keywords,
        trigger_words,
        action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (intent_name LIKE '%聚龙%' 
           OR keywords LIKE '%聚龙%' 
           OR trigger_words LIKE '%聚龙%')
    `);
    
    console.log(`   找到 ${julongRules.length} 条聚龙相关规则:`);
    julongRules.forEach(rule => {
      console.log(`     - ${rule.intent_name}`);
      console.log(`       关键词: ${rule.keywords}`);
      console.log(`       触发词: ${rule.trigger_words ? rule.trigger_words.substring(0, 50) + '...' : '无'}`);
    });
    
    // 5. 检查库存查询规则
    console.log('\n5. 📦 库存查询规则检查:');
    
    const [inventoryRules] = await connection.execute(`
      SELECT 
        intent_name,
        keywords,
        action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (intent_name LIKE '%库存%' OR keywords LIKE '%库存%')
      LIMIT 3
    `);
    
    console.log(`   找到 ${inventoryRules.length} 条库存相关规则:`);
    inventoryRules.forEach(rule => {
      console.log(`     - ${rule.intent_name}`);
      console.log(`       关键词: ${rule.keywords}`);
      
      // 检查SQL是否正确
      if (rule.action_target.includes('FROM inventory')) {
        console.log(`       ✅ SQL表名正确`);
      } else {
        console.log(`       ❌ SQL表名错误`);
      }
      
      if (rule.action_target.includes('supplier_name')) {
        console.log(`       ✅ 字段名正确`);
      } else if (rule.action_target.includes('supplier')) {
        console.log(`       ❌ 字段名错误 (应为supplier_name)`);
      }
    });
    
    // 6. 测试规则匹配算法
    console.log('\n6. 🧠 规则匹配算法测试:');
    
    const testQueries = [
      '查询聚龙供应商的库存',
      '查询物料库存信息',
      '查看所有物料',
      '聚龙库存'
    ];
    
    for (const query of testQueries) {
      console.log(`\n   测试查询: "${query}"`);
      
      // 简单关键词匹配测试
      const [matchedRules] = await connection.execute(`
        SELECT 
          intent_name,
          keywords,
          priority
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND (
          keywords LIKE '%${query.includes('聚龙') ? '聚龙' : ''}%'
          OR keywords LIKE '%${query.includes('库存') ? '库存' : ''}%'
          OR keywords LIKE '%${query.includes('物料') ? '物料' : ''}%'
        )
        ORDER BY priority DESC
        LIMIT 3
      `);
      
      if (matchedRules.length > 0) {
        console.log(`     找到 ${matchedRules.length} 条匹配规则:`);
        matchedRules.forEach(rule => {
          console.log(`       - ${rule.intent_name} (优先级:${rule.priority})`);
        });
      } else {
        console.log(`     ❌ 未找到匹配规则`);
      }
    }
    
    // 7. 检查规则优先级设计
    console.log('\n7. ⚖️ 规则优先级设计检查:');
    
    const [priorityStats] = await connection.execute(`
      SELECT 
        priority,
        COUNT(*) as count,
        GROUP_CONCAT(intent_name SEPARATOR ', ') as rules
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY priority
      ORDER BY priority DESC
      LIMIT 10
    `);
    
    priorityStats.forEach(row => {
      console.log(`   优先级 ${row.priority}: ${row.count} 条规则`);
      if (row.count > 5) {
        console.log(`     ⚠️ 优先级冲突过多`);
      }
    });
    
    // 8. 问题总结
    console.log('\n📋 问题总结:');
    
    const issues = [];
    
    if (parameterRules.length > 0) {
      issues.push('SQL参数占位符问题');
    }
    
    if (fieldRules.length > 0) {
      issues.push('字段映射错误');
    }
    
    if (keywordRules.length > 0) {
      issues.push('关键词配置缺失');
    }
    
    if (julongRules.length === 0) {
      issues.push('缺少聚龙供应商专用规则');
    }
    
    if (issues.length > 0) {
      console.log('   发现的问题:');
      issues.forEach((issue, index) => {
        console.log(`     ${index + 1}. ${issue}`);
      });
    } else {
      console.log('   ✅ 未发现明显问题');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

analyzeRulesProblems();
