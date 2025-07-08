import mysql from 'mysql2/promise';

async function debugCategories() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 调试分类API逻辑...\n');
    
    const [rules] = await connection.execute(`
      SELECT 
        intent_name,
        description,
        category,
        sort_order,
        status
      FROM nlp_intent_rules 
      ORDER BY sort_order ASC
    `);
    
    console.log('📋 从数据库获取的规则:');
    rules.forEach(rule => {
      console.log(`  ${rule.sort_order}. ${rule.intent_name} - 分类: ${rule.category}`);
    });
    
    console.log('\n🔧 按分类分组:');
    
    // 按分类分组
    const categories = {
      '基础查询': rules.filter(r => r.category === '基础查询'),
      '单场景分析': rules.filter(r => r.category === '单场景分析'),
      '多场景分析': rules.filter(r => r.category === '多场景分析')
    };
    
    Object.keys(categories).forEach(category => {
      console.log(`\n${category}:`);
      console.log(`  数量: ${categories[category].length}`);
      console.log(`  规则:`);
      categories[category].forEach(rule => {
        console.log(`    - ${rule.intent_name}`);
      });
    });
    
    console.log('\n📊 最终结果:');
    const result = Object.keys(categories).map(category => ({
      name: category,
      count: categories[category].length,
      rules: categories[category].map(rule => ({
        name: rule.intent_name,
        description: rule.description,
        sort_order: rule.sort_order,
        status: rule.status
      }))
    })).filter(cat => cat.count > 0);
    
    result.forEach(cat => {
      console.log(`  ${cat.name}: ${cat.count} 条规则`);
    });

  } finally {
    await connection.end();
  }
}

debugCategories().catch(console.error);
