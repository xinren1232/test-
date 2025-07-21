import mysql from 'mysql2/promise';

async function testConnection() {
  let connection;
  
  try {
    console.log('🔍 测试数据库连接...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 测试查询
    const [rules] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
    console.log(`📊 规则总数: ${rules[0].count}`);
    
    // 测试几个基础规则
    const testRules = [243, 480, 485];
    
    for (const ruleId of testRules) {
      console.log(`\n🔍 测试规则${ruleId}:`);
      
      const [rule] = await connection.execute(
        'SELECT id, intent_name, category, action_target FROM nlp_intent_rules WHERE id = ?',
        [ruleId]
      );
      
      if (rule.length > 0) {
        const ruleData = rule[0];
        console.log(`   名称: ${ruleData.intent_name}`);
        console.log(`   分类: ${ruleData.category}`);
        
        try {
          let sql = ruleData.action_target;
          if (sql.includes('?')) {
            sql = sql.replace(/\?/g, "'电池'");
          }
          
          const [results] = await connection.execute(sql);
          console.log(`   ✅ 执行成功: ${results.length}条记录`);
          
          if (results.length > 0) {
            const fields = Object.keys(results[0]);
            console.log(`   字段: ${fields.join(', ')}`);
          }
        } catch (error) {
          console.log(`   ❌ 执行失败: ${error.message}`);
        }
      } else {
        console.log(`   ❌ 规则不存在`);
      }
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

testConnection().catch(console.error);
