import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugNoDataIssue() {
  try {
    console.log('🔍 调试无数据返回问题...\n');
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查测试数据总数
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    console.log(`📊 测试数据总数: ${testCount[0].count} 条`);
    
    // 2. 检查测试数据样本
    const [testSample] = await connection.execute('SELECT * FROM lab_tests LIMIT 3');
    console.log('\n📋 测试数据样本:');
    testSample.forEach((row, index) => {
      console.log(`${index + 1}. 测试ID: ${row.test_id}, 物料: ${row.material_name}, 供应商: ${row.supplier_name}, 结果: ${row.test_result}`);
    });
    
    // 3. 检查物料测试情况查询规则的SQL
    const [rule] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name LIKE "%物料测试情况查询%"'
    );
    
    if (rule.length > 0) {
      console.log('\n🔍 物料测试情况查询规则:');
      rule.forEach((r, index) => {
        console.log(`${index + 1}. 规则名: ${r.intent_name}`);
        console.log(`SQL: ${r.action_target.substring(0, 200)}...`);
        console.log('---');
      });
      
      // 4. 测试执行第一个规则的SQL
      console.log('\n🧪 测试执行SQL查询:');
      try {
        const sql = rule[0].action_target;
        console.log(`执行SQL: ${sql}`);
        const [results] = await connection.execute(sql);
        console.log(`✅ 查询成功，返回 ${results.length} 条记录`);
        if (results.length > 0) {
          console.log('前3条记录:');
          results.slice(0, 3).forEach((row, index) => {
            console.log(`${index + 1}. ${JSON.stringify(row)}`);
          });
        } else {
          console.log('❌ 查询结果为空');
        }
      } catch (sqlError) {
        console.log(`❌ SQL执行失败: ${sqlError.message}`);
      }
    }
    
    // 5. 检查库存数据
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`\n📦 库存数据总数: ${inventoryCount[0].count} 条`);
    
    // 6. 检查在线跟踪数据
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`🚀 在线跟踪数据总数: ${onlineCount[0].count} 条`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

debugNoDataIssue();
