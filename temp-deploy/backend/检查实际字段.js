import mysql from 'mysql2/promise';

async function checkActualFields() {
  let connection;
  
  try {
    console.log('🔍 检查实际数据库字段...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 检查inventory表结构
    console.log('\n📦 inventory表结构:');
    try {
      const [columns] = await connection.execute('DESCRIBE inventory');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
      });
      
      // 检查实际数据样本
      const [sample] = await connection.execute('SELECT * FROM inventory LIMIT 1');
      if (sample.length > 0) {
        console.log('\n📋 inventory表数据样本:');
        console.log('字段名:', Object.keys(sample[0]).join(', '));
        console.log('数据样本:', sample[0]);
      }
    } catch (error) {
      console.log('❌ inventory表检查失败:', error.message);
    }
    
    // 检查lab_tests表结构
    console.log('\n🧪 lab_tests表结构:');
    try {
      const [columns] = await connection.execute('DESCRIBE lab_tests');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
      });
      
      // 检查实际数据样本
      const [sample] = await connection.execute('SELECT * FROM lab_tests LIMIT 1');
      if (sample.length > 0) {
        console.log('\n📋 lab_tests表数据样本:');
        console.log('字段名:', Object.keys(sample[0]).join(', '));
        console.log('数据样本:', sample[0]);
      }
    } catch (error) {
      console.log('❌ lab_tests表检查失败:', error.message);
    }
    
    // 检查所有表
    console.log('\n📋 所有表:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkActualFields().catch(console.error);
