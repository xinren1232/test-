import mysql from 'mysql2/promise';

async function checkDatabaseStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('=== 检查数据库表结构 ===');
    
    // 检查 lab_tests 表结构
    console.log('\n📋 lab_tests 表结构:');
    const [labTestsColumns] = await connection.execute('DESCRIBE lab_tests');
    labTestsColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });
    
    // 检查 inventory 表结构
    console.log('\n📦 inventory 表结构:');
    const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
    inventoryColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });
    
    // 检查 production_tracking 表结构
    console.log('\n🏭 production_tracking 表结构:');
    const [productionColumns] = await connection.execute('DESCRIBE production_tracking');
    productionColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkDatabaseStructure();
