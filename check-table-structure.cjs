const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkTableStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查inventory表结构
    console.log('\n📦 inventory表结构:');
    const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
    inventoryColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查lab_tests表结构
    console.log('\n🧪 lab_tests表结构:');
    const [labTestsColumns] = await connection.execute('DESCRIBE lab_tests');
    labTestsColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查online_tracking表结构
    console.log('\n🏭 online_tracking表结构:');
    const [onlineTrackingColumns] = await connection.execute('DESCRIBE online_tracking');
    onlineTrackingColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查数据样本
    console.log('\n📊 数据样本:');
    
    const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 2');
    console.log('inventory样本:', inventorySample[0]);
    
    const [labTestsSample] = await connection.execute('SELECT * FROM lab_tests LIMIT 2');
    console.log('lab_tests样本:', labTestsSample[0]);
    
    const [onlineTrackingSample] = await connection.execute('SELECT * FROM online_tracking LIMIT 2');
    console.log('online_tracking样本:', onlineTrackingSample[0]);
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTableStructure();
