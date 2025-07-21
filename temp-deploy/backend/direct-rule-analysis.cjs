// 直接分析规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function directRuleAnalysis() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 基础统计
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_rules,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_rules,
        SUM(CASE WHEN action_target IS NULL OR action_target = '' OR action_target = 'inspection_data' THEN 1 ELSE 0 END) as empty_sql,
        SUM(CASE WHEN trigger_words IS NULL OR trigger_words = '' THEN 1 ELSE 0 END) as empty_triggers
      FROM nlp_intent_rules
    `);
    
    console.log('📊 规则统计:');
    console.log(`总规则数: ${stats[0].total_rules}`);
    console.log(`活跃规则: ${stats[0].active_rules}`);
    console.log(`SQL为空: ${stats[0].empty_sql}`);
    console.log(`触发词为空: ${stats[0].empty_triggers}`);
    
    // 2. 分类统计
    const [categories] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📋 分类统计:');
    for (const cat of categories) {
      console.log(`${cat.category || '未分类'}: ${cat.count} 条`);
    }
    
    // 3. 问题规则示例
    const [problemRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND (action_target IS NULL OR action_target = '' OR action_target = 'inspection_data')
      LIMIT 5
    `);
    
    console.log('\n❌ 问题规则示例:');
    for (const rule of problemRules) {
      console.log(`规则 ${rule.id}: ${rule.intent_name} - SQL: ${rule.action_target || '空'}`);
    }
    
    // 4. 正常规则示例
    const [goodRules] = await connection.execute(`
      SELECT id, intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      AND action_target IS NOT NULL 
      AND action_target != '' 
      AND action_target != 'inspection_data'
      AND action_target LIKE 'SELECT%'
      LIMIT 3
    `);
    
    console.log('\n✅ 正常规则示例:');
    for (const rule of goodRules) {
      console.log(`规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`SQL: ${rule.action_target.substring(0, 80)}...`);
    }
    
    // 5. 测试一个正常规则
    if (goodRules.length > 0) {
      console.log('\n🧪 测试第一个正常规则:');
      const testRule = goodRules[0];
      try {
        const [results] = await connection.execute(testRule.action_target);
        console.log(`✅ 规则 ${testRule.id} 执行成功: ${results.length} 条数据`);
        if (results.length > 0) {
          console.log(`字段: ${Object.keys(results[0]).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ 规则 ${testRule.id} 执行失败: ${error.message}`);
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    if (connection) await connection.end();
  }
}

// 直接执行
directRuleAnalysis().then(() => {
  console.log('\n🎉 分析完成');
}).catch(error => {
  console.error('❌ 执行失败:', error.message);
});
