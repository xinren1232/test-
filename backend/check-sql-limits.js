import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Flameaway3.',
  database: 'iQE_database'
};

async function checkSQLLimits() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rules] = await connection.execute('SELECT intent_name, action_target FROM nlp_intent_rules WHERE status = "active" LIMIT 5');
    
    console.log('检查规则SQL中的LIMIT限制:');
    console.log('='.repeat(50));
    
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name}:`);
      
      const sql = rule.action_target;
      const hasLimit = sql.includes('LIMIT');
      
      if (hasLimit) {
        const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          console.log(`   ✅ 有LIMIT限制: ${limitMatch[1]} 条`);
        } else {
          console.log(`   ⚠️ 有LIMIT关键字但格式不标准`);
        }
      } else {
        console.log(`   ❌ 没有LIMIT限制 - 可能返回大量数据`);
      }
      
      // 显示SQL的前100个字符
      console.log(`   SQL预览: ${sql.substring(0, 100)}...`);
      console.log('');
    });
    
  } finally {
    await connection.end();
  }
}

checkSQLLimits().catch(console.error);
