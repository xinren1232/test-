/**
 * 检查前端实际使用的数据结构
 */
const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRealDataStructure() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查前端实际使用的数据结构...\n');
    
    // 1. 检查前端数据同步表
    console.log('📋 检查前端数据同步表结构:');
    try {
      const [syncTables] = await connection.execute("SHOW TABLES LIKE '%sync%'");
      console.log('同步相关表:', syncTables.map(t => Object.values(t)[0]));
      
      if (syncTables.length > 0) {
        for (const table of syncTables) {
          const tableName = Object.values(table)[0];
          const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
          console.log(`\n📊 ${tableName}表字段:`);
          columns.forEach(col => {
            console.log(`  ${col.Field} (${col.Type})`);
          });
          
          // 查看样本数据
          const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
          if (sample.length > 0) {
            console.log(`\n📝 ${tableName}样本数据:`);
            sample.forEach((row, index) => {
              console.log(`  记录${index + 1}:`, JSON.stringify(row, null, 2));
            });
          }
        }
      }
    } catch (error) {
      console.log('❌ 检查同步表失败:', error.message);
    }
    
    // 2. 检查所有表，找到可能的前端数据表
    console.log('\n🗄️ 检查所有数据表:');
    const [allTables] = await connection.execute('SHOW TABLES');
    console.log('所有表:', allTables.map(t => Object.values(t)[0]));
    
    // 3. 检查可能包含上线生产数据的表
    const productionTables = ['online_tracking', 'production_tracking', 'frontend_sync_data'];
    for (const tableName of productionTables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`\n🏭 ${tableName}表字段:`);
        columns.forEach(col => {
          console.log(`  ${col.Field} (${col.Type})`);
        });
        
        // 查看样本数据
        const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 2`);
        if (sample.length > 0) {
          console.log(`\n📝 ${tableName}样本数据:`);
          sample.forEach((row, index) => {
            console.log(`  记录${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }
      } catch (error) {
        console.log(`❌ 表${tableName}不存在或无法访问`);
      }
    }
    
    // 4. 检查可能包含测试数据的表
    const testTables = ['lab_tests', 'inspection_data', 'test_results'];
    for (const tableName of testTables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`\n🔬 ${tableName}表字段:`);
        columns.forEach(col => {
          console.log(`  ${col.Field} (${col.Type})`);
        });
        
        // 查看样本数据
        const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 2`);
        if (sample.length > 0) {
          console.log(`\n📝 ${tableName}样本数据:`);
          sample.forEach((row, index) => {
            console.log(`  记录${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }
      } catch (error) {
        console.log(`❌ 表${tableName}不存在或无法访问`);
      }
    }
    
  } finally {
    await connection.end();
  }
}

checkRealDataStructure().catch(console.error);
