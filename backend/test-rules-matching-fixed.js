import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testRulesMatchingFixed() {
  console.log('🧪 测试修复后的规则匹配功能...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const testQueries = [
      '查询聚龙供应商的库存',
      '查询结构件类测试情况', 
      'BOE供应商上线情况',
      '查询光学类库存',
      '物料测试情况',
      '查询充电类上线情况'
    ];
    
    for (const query of testQueries) {
      console.log(`🔍 测试查询: "${query}"`);
      
      // 修复后的匹配逻辑 - 直接在SQL中搜索触发词
      const [matches] = await connection.execute(`
        SELECT 
          intent_name, 
          category, 
          priority, 
          example_query,
          trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND (
          intent_name LIKE ? OR
          example_query LIKE ? OR
          trigger_words LIKE ? OR
          trigger_words LIKE ? OR
          trigger_words LIKE ? OR
          trigger_words LIKE ?
        )
        ORDER BY priority DESC, sort_order ASC
        LIMIT 5
      `, [
        `%${query}%`,
        `%${query}%`,
        `%聚龙%`, `%结构件%`, `%BOE%`, `%光学%`
      ]);
      
      if (matches.length > 0) {
        console.log('   匹配结果:');
        matches.forEach((match, index) => {
          console.log(`     ${index + 1}. ${match.intent_name}`);
          console.log(`        分类: ${match.category}, 优先级: ${match.priority}`);
          console.log(`        示例: ${match.example_query}`);
        });
      } else {
        console.log('   ❌ 未找到匹配规则');
      }
      console.log('');
    }
    
    // 检查具体规则内容
    console.log('📋 检查具体规则内容...\n');
    
    const [sampleRules] = await connection.execute(`
      SELECT intent_name, trigger_words, example_query
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (intent_name LIKE '%聚龙%' OR intent_name LIKE '%结构件%')
      LIMIT 5
    `);
    
    console.log('样本规则:');
    sampleRules.forEach(rule => {
      console.log(`- ${rule.intent_name}`);
      console.log(`  触发词: ${rule.trigger_words}`);
      console.log(`  示例: ${rule.example_query}\n`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRulesMatchingFixed();
