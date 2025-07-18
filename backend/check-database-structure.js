const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔍 检查数据库表结构...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查inventory表结构
    console.log('\n📦 inventory表结构:');
    try {
      const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
      inventoryColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
      });
      
      // 检查数据样本
      const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 1');
      if (inventorySample.length > 0) {
        console.log('\n📋 inventory表数据样本字段:');
        console.log('  字段名:', Object.keys(inventorySample[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ inventory表检查失败:', error.message);
    }
    
    // 检查online_tracking表结构
    console.log('\n🌐 online_tracking表结构:');
    try {
      const [onlineColumns] = await connection.execute('DESCRIBE online_tracking');
      onlineColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
      });
      
      // 检查数据样本
      const [onlineSample] = await connection.execute('SELECT * FROM online_tracking LIMIT 1');
      if (onlineSample.length > 0) {
        console.log('\n📋 online_tracking表数据样本字段:');
        console.log('  字段名:', Object.keys(onlineSample[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ online_tracking表检查失败:', error.message);
    }
    
    // 检查lab_tests表结构
    console.log('\n🧪 lab_tests表结构:');
    try {
      const [labColumns] = await connection.execute('DESCRIBE lab_tests');
      labColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
      });
      
      // 检查数据样本
      const [labSample] = await connection.execute('SELECT * FROM lab_tests LIMIT 1');
      if (labSample.length > 0) {
        console.log('\n📋 lab_tests表数据样本字段:');
        console.log('  字段名:', Object.keys(labSample[0]).join(', '));
      }
    } catch (error) {
      console.log('❌ lab_tests表检查失败:', error.message);
    }
    
    // 检查nlp_intent_rules表中现有规则
    console.log('\n📋 检查现有规则数量:');
    try {
      const [ruleCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
      console.log(`  当前规则数量: ${ruleCount[0].count}`);
      
      // 检查规则分类
      const [categories] = await connection.execute('SELECT DISTINCT category FROM nlp_intent_rules WHERE category IS NOT NULL');
      console.log('  规则分类:', categories.map(c => c.category).join(', '));
    } catch (error) {
      console.log('❌ 规则表检查失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseStructure().catch(console.error);
