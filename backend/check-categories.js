import mysql from 'mysql2/promise';

async function checkCategories() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    const [rules] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('📊 数据库中的分类统计:');
    rules.forEach(rule => {
      console.log(`  ${rule.category}: ${rule.count} 条规则`);
    });
    
    console.log('\n📋 各分类的具体规则:');
    const [allRules] = await connection.execute(`
      SELECT intent_name, category, sort_order
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY sort_order
    `);
    
    const categoryGroups = {};
    allRules.forEach(rule => {
      if (!categoryGroups[rule.category]) {
        categoryGroups[rule.category] = [];
      }
      categoryGroups[rule.category].push(rule);
    });
    
    Object.keys(categoryGroups).forEach(category => {
      console.log(`\n${category} (${categoryGroups[category].length}条):`);
      categoryGroups[category].forEach((rule, index) => {
        console.log(`  ${rule.sort_order}. ${rule.intent_name}`);
      });
    });

  } finally {
    await connection.end();
  }
}

checkCategories().catch(console.error);
