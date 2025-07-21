import mysql from 'mysql2/promise';

async function checkRule243() {
  let connection;
  
  try {
    console.log('🔍 检查规则243...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 查看规则243的当前SQL
    const [rule] = await connection.execute('SELECT * FROM nlp_intent_rules WHERE id = 243');
    if (rule.length > 0) {
      console.log('\n规则243信息:');
      console.log('名称:', rule[0].intent_name);
      console.log('分类:', rule[0].category);
      console.log('SQL:', rule[0].action_target);
    } else {
      console.log('❌ 规则243不存在');
      return;
    }
    
    // 2. 检查inventory表的实际数据
    console.log('\n📊 检查inventory表数据...');
    const [inventoryData] = await connection.execute('SELECT * FROM inventory LIMIT 3');
    if (inventoryData.length > 0) {
      console.log('inventory表字段:', Object.keys(inventoryData[0]).join(', '));
      console.log('数据样本:');
      inventoryData.forEach((row, index) => {
        console.log(`  ${index + 1}:`, row);
      });
    }
    
    // 3. 测试不同的查询条件
    console.log('\n🧪 测试不同的查询条件...');
    
    const testQueries = [
      "SELECT * FROM inventory WHERE material_name LIKE '%电池%' LIMIT 3",
      "SELECT * FROM inventory WHERE material_name LIKE '%LCD%' LIMIT 3",
      "SELECT * FROM inventory WHERE material_name LIKE '%显示屏%' LIMIT 3",
      "SELECT DISTINCT material_name FROM inventory LIMIT 10"
    ];
    
    for (const query of testQueries) {
      try {
        const [results] = await connection.execute(query);
        console.log(`✅ ${query}: ${results.length}条记录`);
        if (results.length > 0) {
          console.log('   样本:', results[0]);
        }
      } catch (error) {
        console.log(`❌ ${query}: ${error.message}`);
      }
    }
    
    // 4. 修复规则243的SQL
    console.log('\n🔧 修复规则243的SQL...');
    
    const newSQL = `SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(updated_at, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE material_name LIKE CONCAT('%', ?, '%')
ORDER BY id DESC`;
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE id = 243
    `, [newSQL]);
    
    console.log('✅ 规则243 SQL已更新');
    
    // 5. 测试修复后的SQL
    console.log('\n🧪 测试修复后的SQL...');
    
    const testSQL = newSQL.replace('?', "'电池'");
    try {
      const [testResults] = await connection.execute(testSQL);
      console.log(`✅ 修复后SQL测试成功: ${testResults.length}条记录`);
      if (testResults.length > 0) {
        console.log('字段:', Object.keys(testResults[0]).join(', '));
        console.log('样本:', testResults[0]);
      }
    } catch (error) {
      console.log(`❌ 修复后SQL测试失败: ${error.message}`);
    }
    
    console.log('\n🎉 规则243检查完成！');
    
  } catch (error) {
    console.error('❌ 检查规则243失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkRule243().catch(console.error);
