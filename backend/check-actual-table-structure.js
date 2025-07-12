import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkActualTableStructure() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查实际数据库表结构...\n');
    
    const tables = ['inventory', 'online_tracking', 'lab_tests'];
    
    for (const table of tables) {
      console.log(`📋 表: ${table}`);
      
      // 获取表结构
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      console.log('  字段列表:');
      columns.forEach(col => {
        console.log(`    - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // 获取样本数据
      const [sampleData] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
      if (sampleData.length > 0) {
        console.log('  样本数据字段:');
        Object.keys(sampleData[0]).forEach(field => {
          const value = sampleData[0][field];
          console.log(`    - ${field}: ${typeof value} = ${value}`);
        });
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkActualTableStructure();
