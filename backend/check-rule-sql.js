import mysql from 'mysql2/promise';

async function checkRuleSQL() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('🔍 检查结构件类库存查询规则的SQL...\n');
    
    const [rules] = await connection.execute(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%结构件%' OR intent_name LIKE '%库存%'
      LIMIT 5
    `);
    
    console.log('📋 库存相关规则的SQL:');
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. 规则: ${rule.intent_name}`);
      console.log(`   SQL: ${rule.action_target}`);
      console.log('');
    });
    
    // 测试执行结构件类库存查询的SQL
    const structuralRule = rules.find(rule => rule.intent_name.includes('结构件'));
    if (structuralRule) {
      console.log('🧪 测试执行结构件类库存查询SQL...');
      console.log(`SQL: ${structuralRule.action_target}`);
      
      try {
        const [testResults] = await connection.execute(structuralRule.action_target);
        console.log(`✅ 查询成功，返回 ${testResults.length} 条记录`);
        
        if (testResults.length > 0) {
          console.log('📊 第一条记录的字段:');
          Object.keys(testResults[0]).forEach(key => {
            console.log(`  ${key}: ${testResults[0][key]}`);
          });
        }
      } catch (error) {
        console.log(`❌ SQL执行失败: ${error.message}`);
      }
    }
    
  } finally {
    await connection.end();
  }
}

checkRuleSQL().catch(console.error);
