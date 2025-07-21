import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkExampleQueries() {
  let connection;
  
  try {
    console.log('📋 检查规则示例问题...');
    
    connection = await mysql.createConnection(dbConfig);
    
    const [rules] = await connection.execute(`
      SELECT intent_name, example_query, category, description 
      FROM nlp_intent_rules 
      ORDER BY category, priority DESC
    `);
    
    console.log('\n规则示例问题检查:');
    let hasExample = 0;
    let noExample = 0;
    
    rules.forEach(rule => {
      if (rule.example_query) {
        console.log(`✅ ${rule.intent_name} (${rule.category}): ${rule.example_query}`);
        hasExample++;
      } else {
        console.log(`❌ ${rule.intent_name} (${rule.category}): 无示例问题`);
        noExample++;
      }
    });
    
    console.log(`\n📊 统计: ${hasExample}条有示例, ${noExample}条无示例`);
    
    // 检查前端API字段映射
    console.log('\n🔍 检查前端API字段映射...');
    const [sampleRule] = await connection.execute('SELECT * FROM nlp_intent_rules LIMIT 1');
    if (sampleRule.length > 0) {
      console.log('数据库字段:', Object.keys(sampleRule[0]).join(', '));
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkExampleQueries().catch(console.error);
