import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixBOEMatching() {
  console.log('🔧 修复BOE匹配问题...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查BOE相关规则
    console.log('1. 🔍 检查BOE相关规则:');
    const [boeRules] = await connection.execute(`
      SELECT intent_name, trigger_words, example_query
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND intent_name LIKE '%BOE%'
    `);
    
    console.log(`   找到 ${boeRules.length} 条BOE规则:`);
    boeRules.forEach(rule => {
      console.log(`   - ${rule.intent_name}`);
      console.log(`     触发词: ${rule.trigger_words}`);
      console.log(`     示例: ${rule.example_query}\n`);
    });
    
    // 2. 测试匹配逻辑
    console.log('2. 🧪 测试匹配逻辑:');
    
    const testQuery = 'BOE供应商上线情况';
    console.log(`   测试查询: "${testQuery}"`);
    
    // 方法1: 直接匹配
    const [directMatch] = await connection.execute(`
      SELECT intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND intent_name LIKE '%BOE%上线%'
    `);
    
    if (directMatch.length > 0) {
      console.log('   ✅ 直接匹配成功:');
      directMatch.forEach(rule => {
        console.log(`     - ${rule.intent_name}`);
      });
    } else {
      console.log('   ❌ 直接匹配失败');
    }
    
    // 方法2: 关键词匹配
    const [keywordMatch] = await connection.execute(`
      SELECT intent_name, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (
        trigger_words LIKE '%BOE%' 
        AND trigger_words LIKE '%上线%'
      )
    `);
    
    if (keywordMatch.length > 0) {
      console.log('   ✅ 关键词匹配成功:');
      keywordMatch.forEach(rule => {
        console.log(`     - ${rule.intent_name}`);
      });
    } else {
      console.log('   ❌ 关键词匹配失败');
    }
    
    // 3. 智能匹配测试
    console.log('\n3. 🤖 智能匹配测试:');
    
    const keywords = ['BOE', '供应商', '上线', '情况'];
    const conditions = keywords.map(() => '(intent_name LIKE ? OR trigger_words LIKE ?)').join(' OR ');
    const params = keywords.flatMap(k => [`%${k}%`, `%${k}%`]);
    
    const [smartMatch] = await connection.execute(`
      SELECT intent_name, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (${conditions})
      ORDER BY priority DESC, sort_order ASC
      LIMIT 5
    `, params);
    
    if (smartMatch.length > 0) {
      console.log('   智能匹配结果:');
      smartMatch.forEach((rule, index) => {
        console.log(`     ${index + 1}. ${rule.intent_name} (优先级:${rule.priority})`);
      });
    } else {
      console.log('   ❌ 智能匹配失败');
    }
    
    // 4. 修复建议
    console.log('\n4. 💡 修复建议:');
    
    if (boeRules.length === 0) {
      console.log('   ❌ 缺少BOE规则，需要重新生成');
    } else if (directMatch.length === 0) {
      console.log('   ⚠️  BOE上线规则可能有问题，检查触发词设置');
    } else {
      console.log('   ✅ 规则存在，可能是匹配算法问题');
    }
    
    // 5. 验证所有供应商上线规则
    console.log('\n5. 📋 验证所有供应商上线规则:');
    
    const [allSupplierOnlineRules] = await connection.execute(`
      SELECT intent_name
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND intent_name LIKE '%供应商上线查询'
      ORDER BY intent_name
    `);
    
    console.log(`   找到 ${allSupplierOnlineRules.length} 条供应商上线规则:`);
    allSupplierOnlineRules.forEach(rule => {
      console.log(`     - ${rule.intent_name}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixBOEMatching();
