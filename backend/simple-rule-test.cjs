// 简单的规则测试
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testRulesSimple() {
  let connection;
  
  try {
    console.log('🧪 开始简单规则测试...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 获取规则总数
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = 'active'
    `);
    console.log(`📊 总共 ${countResult[0].total} 条活跃规则\n`);
    
    // 2. 获取前10条规则进行测试
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words, status, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
      LIMIT 10
    `);
    
    console.log('🔍 测试前10条规则:\n');
    
    let successCount = 0;
    let emptyDataCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      console.log(`[${i + 1}/10] 规则 ${rule.id}: ${rule.intent_name}`);
      
      try {
        if (!rule.action_target || !rule.action_target.trim()) {
          console.log('  ❌ 规则没有SQL模板');
          errorCount++;
          continue;
        }
        
        const [results] = await connection.execute(rule.action_target);
        
        if (results.length > 0) {
          console.log(`  ✅ 执行成功: ${results.length} 条数据`);
          successCount++;
          
          // 显示第一条数据的字段
          if (results[0]) {
            const fields = Object.keys(results[0]).slice(0, 5).join(', ');
            console.log(`     字段: ${fields}${Object.keys(results[0]).length > 5 ? '...' : ''}`);
          }
        } else {
          console.log('  ⚠️  执行成功但返回0条数据');
          emptyDataCount++;
        }
        
      } catch (error) {
        console.log(`  ❌ 执行失败: ${error.message.substring(0, 80)}...`);
        errorCount++;
      }
      
      console.log(''); // 空行
    }
    
    console.log('📊 前10条规则测试结果:');
    console.log(`✅ 成功: ${successCount} 条`);
    console.log(`⚠️  空数据: ${emptyDataCount} 条`);
    console.log(`❌ 失败: ${errorCount} 条`);
    
    // 3. 测试前端数据同步表
    console.log('\n🔍 检查前端数据同步表:');
    
    try {
      const [syncData] = await connection.execute(`
        SELECT data_type, record_count, created_at 
        FROM frontend_data_sync 
        ORDER BY created_at DESC
      `);
      
      if (syncData.length > 0) {
        console.log('✅ 前端数据同步表存在:');
        for (const sync of syncData) {
          console.log(`  - ${sync.data_type}: ${sync.record_count} 条数据 (${sync.created_at})`);
        }
      } else {
        console.log('⚠️  前端数据同步表为空');
      }
    } catch (error) {
      console.log(`❌ 前端数据同步表检查失败: ${error.message}`);
    }
    
    // 4. 测试数据库表
    console.log('\n🔍 检查主要数据表:');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${count[0].count} 条数据`);
      } catch (error) {
        console.log(`  ${table}: 检查失败 - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testRulesSimple();
