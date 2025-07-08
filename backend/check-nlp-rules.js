import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkNLPRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查库存相关的NLP规则...');
    
    const [rules] = await connection.execute(
      'SELECT intent_name, trigger_words, action_target FROM nlp_intent_rules WHERE trigger_words LIKE "%库存%"'
    );
    
    console.log(`找到 ${rules.length} 条库存相关规则:`);
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   查询: ${rule.action_target.substring(0, 100)}...`);
      console.log('');
    });
    
    // 测试查询分析
    console.log('🧪 测试查询分析...');
    const testQueries = ['查询库存', '查询所有库存', '库存查询', '查看库存'];
    
    for (const query of testQueries) {
      console.log(`测试: "${query}"`);
      let matched = false;
      
      for (const rule of rules) {
        const triggers = rule.trigger_words.split(',').map(t => t.trim());
        for (const trigger of triggers) {
          if (query.includes(trigger)) {
            console.log(`  ✅ 匹配规则: ${rule.intent_name} (触发词: ${trigger})`);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
      
      if (!matched) {
        console.log(`  ❌ 未找到匹配规则`);
      }
      console.log('');
    }
    
  } finally {
    await connection.end();
  }
}

checkNLPRules().catch(console.error);
