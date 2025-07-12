/**
 * 检查数据库中的实际数据
 */
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'iqe_inspection_db',
  charset: 'utf8mb4'
};

const checkDatabaseData = async () => {
  console.log('🔍 检查数据库数据...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 检查各表的数据量
    const tables = ['inventory', 'online_tracking', 'lab_tests'];
    
    for (const table of tables) {
      console.log(`📋 检查表: ${table}`);
      
      // 总数量
      const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   总记录数: ${countResult[0].count}`);
      
      // 示例数据
      const [sampleData] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
      if (sampleData.length > 0) {
        console.log('   字段列表:', Object.keys(sampleData[0]).join(', '));
        console.log('   示例数据:', sampleData[0]);
      }
      
      console.log('');
    }
    
    // 检查特定查询
    console.log('🔍 测试特定查询...\n');
    
    // 1. 电池库存查询
    console.log('1. 电池库存查询:');
    const [batteryResults] = await connection.execute(`
      SELECT * FROM inventory 
      WHERE material_name LIKE '%电池%' OR material_name LIKE '%battery%'
      LIMIT 5
    `);
    console.log(`   找到 ${batteryResults.length} 条电池相关记录`);
    if (batteryResults.length > 0) {
      console.log('   示例:', batteryResults[0]);
    }
    
    // 2. BOE供应商查询
    console.log('\n2. BOE供应商查询:');
    const [boeResults] = await connection.execute(`
      SELECT * FROM inventory 
      WHERE supplier_name LIKE '%BOE%'
      LIMIT 5
    `);
    console.log(`   找到 ${boeResults.length} 条BOE供应商记录`);
    if (boeResults.length > 0) {
      console.log('   示例:', boeResults[0]);
    }
    
    // 3. 风险状态查询
    console.log('\n3. 风险状态查询:');
    const [riskResults] = await connection.execute(`
      SELECT * FROM inventory 
      WHERE status = '风险' OR status = 'RISK'
      LIMIT 5
    `);
    console.log(`   找到 ${riskResults.length} 条风险状态记录`);
    if (riskResults.length > 0) {
      console.log('   示例:', riskResults[0]);
    }
    
    // 4. 测试失败记录
    console.log('\n4. 测试失败(NG)记录:');
    const [ngResults] = await connection.execute(`
      SELECT * FROM lab_tests 
      WHERE test_result = 'NG' OR test_result = 'FAIL'
      LIMIT 5
    `);
    console.log(`   找到 ${ngResults.length} 条NG测试记录`);
    if (ngResults.length > 0) {
      console.log('   示例:', ngResults[0]);
    }
    
    // 5. 供应商分布
    console.log('\n5. 供应商分布:');
    const [supplierResults] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('   供应商分布:');
    supplierResults.forEach(row => {
      console.log(`   - ${row.supplier_name}: ${row.count} 条记录`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error);
  }
};

checkDatabaseData().catch(console.error);
