import mysql from 'mysql2/promise';

async function checkRules() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('🔍 检查上线和测试相关规则...\n');
    
    const [rules] = await connection.execute(`
      SELECT intent_name, trigger_words 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (intent_name LIKE '%上线%' OR intent_name LIKE '%测试%' OR intent_name LIKE '%跟踪%')
      LIMIT 10
    `);
    
    console.log('📋 上线和测试相关规则:');
    rules.forEach(rule => {
      console.log(`- ${rule.intent_name}: ${rule.trigger_words}`);
    });
    
    console.log('\n🔍 检查所有活跃规则数量...');
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    console.log(`总计活跃规则: ${count[0].total} 个`);
    
  } finally {
    await connection.end();
  }
}

checkRules().catch(console.error);
