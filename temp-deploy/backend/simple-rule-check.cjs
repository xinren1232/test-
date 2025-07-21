// 简单检查规则状态
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function simpleRuleCheck() {
  let connection;
  try {
    console.log('🔍 开始检查规则...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 统计规则数量
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM nlp_intent_rules
    `);
    
    console.log(`📊 规则统计:`);
    console.log(`  总规则数: ${countResult[0].total}`);
    console.log(`  活跃规则: ${countResult[0].active_count}`);
    
    // 2. 获取前10条活跃规则进行测试
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id DESC
      LIMIT 10
    `);
    
    console.log(`\n🧪 测试前10条规则:`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const rule of rules) {
      console.log(`\n规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`  类别: ${rule.category}`);
      console.log(`  触发词: ${rule.trigger_words}`);
      
      try {
        if (!rule.action_target || rule.action_target.trim() === '') {
          console.log(`  ❌ SQL为空`);
          errorCount++;
          continue;
        }
        
        if (rule.action_target === 'inspection_data') {
          console.log(`  ❌ SQL内容错误: inspection_data`);
          errorCount++;
          continue;
        }
        
        const [results] = await connection.execute(rule.action_target);
        console.log(`  ✅ 执行成功: ${results.length} 条数据`);
        successCount++;
        
      } catch (error) {
        console.log(`  ❌ 执行失败: ${error.message.substring(0, 100)}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 测试结果:`);
    console.log(`  成功: ${successCount} 条`);
    console.log(`  失败: ${errorCount} 条`);
    
    // 3. 检查数据表
    console.log(`\n📊 数据表检查:`);
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${count[0].count} 条数据`);
      } catch (error) {
        console.log(`  ${table}: 错误 - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

simpleRuleCheck();
