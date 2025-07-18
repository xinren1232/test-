/**
 * 检查前端数据同步表的真实结构
 */
const mysql = require('./backend/node_modules/mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkFrontendSyncData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查前端数据同步表的真实结构...\n');
    
    // 检查frontend_data_sync表的详细结构和数据
    const [columns] = await connection.execute('DESCRIBE frontend_data_sync');
    console.log('📊 frontend_data_sync表字段:');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    // 查看样本数据
    const [sample] = await connection.execute('SELECT * FROM frontend_data_sync LIMIT 3');
    console.log('\n📝 frontend_data_sync样本数据:');
    sample.forEach((row, index) => {
      console.log(`记录${index + 1}:`, JSON.stringify(row, null, 2));
    });
    
    // 检查data_content字段的JSON结构
    if (sample.length > 0 && sample[0].data_content) {
      console.log('\n🔍 解析data_content JSON结构:');
      try {
        const parsed = JSON.parse(sample[0].data_content);
        console.log('JSON结构:', JSON.stringify(parsed, null, 2));
        
        // 如果有数组数据，查看第一个元素的字段
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('\n📋 数组第一个元素的字段:');
          Object.keys(parsed[0]).forEach(key => {
            console.log(`  ${key}: ${typeof parsed[0][key]} = ${parsed[0][key]}`);
          });
        } else if (typeof parsed === 'object' && parsed !== null) {
          console.log('\n📋 对象字段:');
          Object.keys(parsed).forEach(key => {
            console.log(`  ${key}: ${typeof parsed[key]} = ${JSON.stringify(parsed[key])}`);
          });
        }
      } catch (e) {
        console.log('❌ JSON解析失败:', e.message);
      }
    }
    
    // 检查不同数据类型的记录
    console.log('\n🔍 检查不同数据类型的记录:');
    const [types] = await connection.execute('SELECT DISTINCT data_type FROM frontend_data_sync');
    console.log('数据类型:', types.map(t => t.data_type));
    
    for (const type of types) {
      console.log(`\n📊 ${type.data_type}类型数据样本:`);
      const [typeSample] = await connection.execute(
        'SELECT data_content FROM frontend_data_sync WHERE data_type = ? LIMIT 1',
        [type.data_type]
      );
      
      if (typeSample.length > 0 && typeSample[0].data_content) {
        try {
          const parsed = JSON.parse(typeSample[0].data_content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`${type.data_type}字段:`, Object.keys(parsed[0]));
            console.log('样本数据:', JSON.stringify(parsed[0], null, 2));
          }
        } catch (e) {
          console.log('❌ JSON解析失败:', e.message);
        }
      }
    }
    
  } finally {
    await connection.end();
  }
}

checkFrontendSyncData().catch(console.error);
