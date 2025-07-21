import mysql from 'mysql2/promise';

async function checkCurrentRules() {
  let connection;
  
  try {
    console.log('🔍 检查当前规则数量...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查总规则数量
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
    console.log(`📊 当前规则总数: ${countResult[0].count}`);
    
    // 2. 按状态分组统计
    const [statusResult] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM nlp_intent_rules 
      GROUP BY status
    `);
    
    console.log('\n📋 按状态分组:');
    statusResult.forEach(row => {
      console.log(`  ${row.status}: ${row.count} 条`);
    });
    
    // 3. 按类别分组统计
    const [categoryResult] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📂 按类别分组:');
    categoryResult.forEach(row => {
      console.log(`  ${row.category}: ${row.count} 条`);
    });
    
    // 4. 显示前20条规则名称
    const [rulesResult] = await connection.execute(`
      SELECT intent_name, category, status 
      FROM nlp_intent_rules 
      ORDER BY id 
      LIMIT 20
    `);
    
    console.log('\n📝 前20条规则:');
    rulesResult.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name} (${rule.category || '无分类'}) - ${rule.status}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkCurrentRules();
