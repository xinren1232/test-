const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function cleanDuplicateRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 查找重复的规则
    const [duplicates] = await connection.execute(`
      SELECT intent_name, COUNT(*) as count 
      FROM assistant_rules 
      GROUP BY intent_name 
      HAVING COUNT(*) > 1
    `);
    
    console.log('🔍 发现重复规则:');
    for (const dup of duplicates) {
      console.log(`  ${dup.intent_name}: ${dup.count} 条`);
      
      // 保留最新的一条，删除其他的
      await connection.execute(`
        DELETE FROM assistant_rules 
        WHERE intent_name = ? 
        AND id NOT IN (
          SELECT * FROM (
            SELECT MAX(id) 
            FROM assistant_rules 
            WHERE intent_name = ?
          ) as temp
        )
      `, [dup.intent_name, dup.intent_name]);
      
      console.log(`  ✅ 清理完成: ${dup.intent_name}`);
    }
    
    // 显示清理后的规则列表
    const [rules] = await connection.execute(`
      SELECT intent_name, priority, status 
      FROM assistant_rules 
      ORDER BY priority DESC, intent_name
    `);
    
    console.log('\n📋 清理后的规则列表:');
    rules.forEach(rule => {
      console.log(`  ${rule.intent_name} (优先级: ${rule.priority})`);
    });
    
    console.log(`\n🎯 总计: ${rules.length} 条规则`);
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanDuplicateRules();
