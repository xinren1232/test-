import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDatabaseData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查数据库中的实际数据...');
    
    // 检查记录数
    const [invCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [labCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log('📊 数据库记录数:');
    console.log(`  库存: ${invCount[0].count}`);
    console.log(`  检测: ${labCount[0].count}`);
    console.log(`  生产: ${onlineCount[0].count}`);
    
    // 检查库存表的前几条记录
    console.log('\n📋 库存表前5条记录:');
    const [invData] = await connection.execute('SELECT * FROM inventory LIMIT 5');
    invData.forEach((row, i) => {
      console.log(`${i+1}. ID: ${row.id}, 物料: ${row.material_name}, 供应商: ${row.supplier}, 数量: ${row.quantity}`);
    });
    
    // 检查表结构
    console.log('\n🏗️ 库存表结构:');
    const [columns] = await connection.execute('DESCRIBE inventory');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });
    
  } finally {
    await connection.end();
  }
}

checkDatabaseData().catch(console.error);
