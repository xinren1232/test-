// 快速检查规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function quickRuleCheck() {
  let connection;
  try {
    console.log('🔍 快速检查规则...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 获取规则总数
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    console.log(`📊 总共 ${countResult[0].total} 条活跃规则`);
    
    // 2. 检查有问题的规则
    console.log('\n🔍 检查有问题的规则:');
    
    // 检查SQL为空的规则
    const [emptySQL] = await connection.execute(`
      SELECT COUNT(*) as count FROM nlp_intent_rules 
      WHERE status = 'active' AND (action_target IS NULL OR action_target = '' OR action_target = 'inspection_data')
    `);
    console.log(`❌ SQL为空或错误: ${emptySQL[0].count} 条`);
    
    // 检查触发词为空的规则
    const [emptyTrigger] = await connection.execute(`
      SELECT COUNT(*) as count FROM nlp_intent_rules 
      WHERE status = 'active' AND (trigger_words IS NULL OR trigger_words = '')
    `);
    console.log(`⚠️  触发词为空: ${emptyTrigger[0].count} 条`);
    
    // 3. 测试前5条规则
    console.log('\n🧪 测试前5条规则:');
    
    const [testRules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words
      FROM nlp_intent_rules 
      WHERE status = 'active' AND action_target IS NOT NULL AND action_target != '' AND action_target != 'inspection_data'
      ORDER BY id ASC
      LIMIT 5
    `);
    
    for (const rule of testRules) {
      console.log(`\n规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`SQL: ${rule.action_target.substring(0, 100)}...`);
      
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ 执行成功: ${results.length} 条数据`);
      } catch (error) {
        console.log(`❌ 执行失败: ${error.message.substring(0, 50)}...`);
      }
    }
    
    // 4. 检查数据表
    console.log('\n📊 检查数据表:');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking', 'frontend_data_sync'];
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${count[0].count} 条数据`);
      } catch (error) {
        console.log(`${table}: 表不存在或错误`);
      }
    }
    
    console.log('\n✅ 快速检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickRuleCheck();
