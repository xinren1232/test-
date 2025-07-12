import mysql from 'mysql2/promise';

async function checkRules() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('🔍 检查规则库中的示例查询...');
    const [rules] = await connection.execute('SELECT intent_name, example_query, description FROM nlp_intent_rules LIMIT 10');
    
    rules.forEach((rule, i) => {
      console.log(`${i+1}. ${rule.intent_name}`);
      console.log(`   示例查询: ${rule.example_query}`);
      console.log(`   描述: ${rule.description}`);
      console.log('');
    });
    
    // 检查是否有重复的示例查询
    console.log('🔍 检查重复的示例查询...');
    const [allRules] = await connection.execute('SELECT example_query, COUNT(*) as count FROM nlp_intent_rules GROUP BY example_query HAVING count > 1');
    
    if (allRules.length > 0) {
      console.log('⚠️ 发现重复的示例查询:');
      allRules.forEach(rule => {
        console.log(`   "${rule.example_query}" - ${rule.count} 个规则使用`);
      });
    } else {
      console.log('✅ 没有重复的示例查询');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkRules();
