/**
 * 检查数据表结构
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkTableStructure() {
  console.log('🔍 检查数据表结构...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查online_tracking表结构
    console.log('📋 online_tracking表结构:');
    const [onlineColumns] = await connection.execute('DESCRIBE online_tracking');
    onlineColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // 检查数据样本
    console.log('\n📊 online_tracking数据样本:');
    const [onlineSample] = await connection.execute('SELECT * FROM online_tracking LIMIT 3');
    console.log(JSON.stringify(onlineSample, null, 2));
    
    // 检查数据统计
    console.log('\n📈 数据统计:');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`online_tracking总数: ${onlineCount[0].count} 条`);
    
    // 检查inventory表结构
    console.log('\n📋 inventory表结构:');
    const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
    inventoryColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // 检查lab_tests表结构
    console.log('\n📋 lab_tests表结构:');
    const [labColumns] = await connection.execute('DESCRIBE lab_tests');
    labColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
  } finally {
    await connection.end();
  }
}

// 运行检查
checkTableStructure().catch(console.error);
