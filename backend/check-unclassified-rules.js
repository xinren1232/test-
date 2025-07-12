import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkUnclassifiedRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查未分类规则...\n');
    
    // 检查所有规则的分类情况
    const [allRules] = await connection.execute(`
      SELECT 
        id,
        intent_name, 
        description, 
        category,
        status
      FROM nlp_intent_rules 
      ORDER BY intent_name
    `);
    
    console.log(`📊 数据库中规则总数: ${allRules.length}条\n`);
    
    // 查找未分类的规则
    const unclassifiedRules = allRules.filter(rule => 
      !rule.category || 
      rule.category === '' || 
      rule.category === 'null' || 
      rule.category === '未分类'
    );
    
    if (unclassifiedRules.length > 0) {
      console.log(`❌ 发现 ${unclassifiedRules.length} 条未分类规则:`);
      unclassifiedRules.forEach(rule => {
        console.log(`  ID: ${rule.id} - ${rule.intent_name}`);
        console.log(`     分类: "${rule.category}"`);
        console.log(`     描述: ${rule.description}`);
        console.log('');
      });
    } else {
      console.log('✅ 所有规则都已正确分类');
    }
    
    // 显示所有分类统计
    console.log('📊 当前分类统计:');
    const [categoryStats] = await connection.execute(`
      SELECT 
        COALESCE(category, '未分类') as category,
        COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    categoryStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat.count}条`);
    });
    
    // 显示所有规则的详细信息
    console.log('\n📋 所有规则详情:');
    allRules.forEach(rule => {
      const categoryDisplay = rule.category || '未分类';
      console.log(`  ${rule.intent_name} - 分类: ${categoryDisplay}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkUnclassifiedRules();
