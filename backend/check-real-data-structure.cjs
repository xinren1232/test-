// 检查真实数据表的字段结构
const mysql = require('mysql2/promise');

async function checkRealDataStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查真实数据表结构和内容...\n');
    
    // 1. 检查inventory表结构
    console.log('📋 inventory表结构:');
    const [inventoryStructure] = await connection.execute('DESCRIBE inventory');
    inventoryStructure.forEach(field => {
      console.log(`   ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // 2. 检查inventory表前3条数据的实际内容
    console.log('\n📦 inventory表前3条数据:');
    const [inventoryData] = await connection.execute('SELECT * FROM inventory LIMIT 3');
    
    inventoryData.forEach((item, index) => {
      console.log(`\n第${index + 1}条数据:`);
      Object.entries(item).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    });
    
    // 3. 检查lab_tests表结构
    console.log('\n📋 lab_tests表结构:');
    const [labTestsStructure] = await connection.execute('DESCRIBE lab_tests');
    labTestsStructure.forEach(field => {
      console.log(`   ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // 4. 检查lab_tests表前2条数据
    console.log('\n📦 lab_tests表前2条数据:');
    const [labTestsData] = await connection.execute('SELECT * FROM lab_tests LIMIT 2');
    
    labTestsData.forEach((item, index) => {
      console.log(`\n第${index + 1}条数据:`);
      Object.entries(item).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    });
    
    // 5. 检查online_tracking表结构
    console.log('\n📋 online_tracking表结构:');
    const [onlineTrackingStructure] = await connection.execute('DESCRIBE online_tracking');
    onlineTrackingStructure.forEach(field => {
      console.log(`   ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // 6. 检查online_tracking表前2条数据
    console.log('\n📦 online_tracking表前2条数据:');
    const [onlineTrackingData] = await connection.execute('SELECT * FROM online_tracking LIMIT 2');
    
    onlineTrackingData.forEach((item, index) => {
      console.log(`\n第${index + 1}条数据:`);
      Object.entries(item).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    });
    
    console.log('\n🎯 检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkRealDataStructure();
