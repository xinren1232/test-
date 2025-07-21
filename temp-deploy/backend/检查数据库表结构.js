import mysql from 'mysql2/promise';

async function checkDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔍 检查数据库表结构...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查所有表
    console.log('\n📋 检查所有表...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('数据库中的表:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // 2. 检查inventory表结构
    console.log('\n📦 检查inventory表结构...');
    try {
      const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
      console.log('inventory表字段:');
      inventoryColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // 检查inventory表数据样本
      const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 1');
      if (inventorySample.length > 0) {
        console.log('\ninventory表数据样本:');
        console.log(Object.keys(inventorySample[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ inventory表不存在或无法访问:', error.message);
    }
    
    // 3. 检查lab_tests表结构
    console.log('\n🧪 检查lab_tests表结构...');
    try {
      const [labTestColumns] = await connection.execute('DESCRIBE lab_tests');
      console.log('lab_tests表字段:');
      labTestColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // 检查lab_tests表数据样本
      const [labTestSample] = await connection.execute('SELECT * FROM lab_tests LIMIT 1');
      if (labTestSample.length > 0) {
        console.log('\nlab_tests表数据样本:');
        console.log(Object.keys(labTestSample[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ lab_tests表不存在或无法访问:', error.message);
    }
    
    // 4. 检查production_online表结构
    console.log('\n🏭 检查production_online表结构...');
    try {
      const [productionColumns] = await connection.execute('DESCRIBE production_online');
      console.log('production_online表字段:');
      productionColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // 检查production_online表数据样本
      const [productionSample] = await connection.execute('SELECT * FROM production_online LIMIT 1');
      if (productionSample.length > 0) {
        console.log('\nproduction_online表数据样本:');
        console.log(Object.keys(productionSample[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ production_online表不存在或无法访问:', error.message);
    }
    
    // 5. 测试一个简单的查询
    console.log('\n🧪 测试简单查询...');
    try {
      const [testResult] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
      console.log(`inventory表记录数: ${testResult[0].count}`);
    } catch (error) {
      console.log('❌ 查询失败:', error.message);
    }
    
    // 6. 检查数据探索规则
    console.log('\n🔍 检查数据探索规则...');
    try {
      const [explorationRules] = await connection.execute(`
        SELECT intent_name, trigger_words, action_target 
        FROM nlp_intent_rules 
        WHERE category = '数据探索' AND status = 'active'
        ORDER BY intent_name
      `);
      
      console.log('数据探索规则:');
      explorationRules.forEach(rule => {
        console.log(`  ${rule.intent_name}:`);
        console.log(`    触发词: ${rule.trigger_words}`);
        console.log(`    SQL: ${rule.action_target.substring(0, 100)}...`);
        console.log('');
      });
    } catch (error) {
      console.log('❌ 查询规则失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkDatabaseStructure().catch(console.error);
