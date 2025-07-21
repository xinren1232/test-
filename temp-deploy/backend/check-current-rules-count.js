// 检查当前规则数量和分布
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkCurrentRules() {
  let connection;
  
  try {
    console.log('🔍 检查当前规则数量和分布...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 总规则数量
    const [totalCount] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules
    `);
    console.log(`📊 总规则数量: ${totalCount[0].total} 条`);
    
    // 2. 按状态分布
    const [statusCount] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM nlp_intent_rules 
      GROUP BY status
      ORDER BY count DESC
    `);
    
    console.log('\n📋 按状态分布:');
    statusCount.forEach(row => {
      console.log(`  ${row.status}: ${row.count} 条`);
    });
    
    // 3. 按场景分布
    const [categoryCount] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n🎯 按场景分布:');
    categoryCount.forEach(row => {
      console.log(`  ${row.category}: ${row.count} 条`);
    });
    
    // 4. 最近添加的规则
    const [recentRules] = await connection.execute(`
      SELECT intent_name, category, created_at
      FROM nlp_intent_rules 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\n🕒 最近添加的规则:');
    recentRules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name} (${rule.category || '无分类'})`);
      console.log(`     创建时间: ${rule.created_at}`);
    });
    
    // 5. 检查三个场景的规则
    const scenarios = ['库存场景', '测试场景', '上线场景'];
    
    console.log('\n🎯 三个核心场景规则检查:');
    for (const scenario of scenarios) {
      const [scenarioRules] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM nlp_intent_rules 
        WHERE category = ?
      `, [scenario]);
      
      console.log(`  ${scenario}: ${scenarioRules[0].count} 条规则`);
      
      // 显示该场景的示例规则
      const [sampleRules] = await connection.execute(`
        SELECT intent_name, example_query
        FROM nlp_intent_rules 
        WHERE category = ?
        ORDER BY priority DESC
        LIMIT 3
      `, [scenario]);
      
      sampleRules.forEach((rule, index) => {
        console.log(`    ${index + 1}. ${rule.intent_name}`);
        console.log(`       示例: ${rule.example_query}`);
      });
    }
    
    // 6. 检查是否有重复规则
    const [duplicates] = await connection.execute(`
      SELECT intent_name, COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY intent_name
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️ 发现重复规则:');
      duplicates.forEach(dup => {
        console.log(`  ${dup.intent_name}: ${dup.count} 条重复`);
      });
    } else {
      console.log('\n✅ 没有发现重复规则');
    }
    
    console.log('\n🎉 规则检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkCurrentRules().catch(console.error);
