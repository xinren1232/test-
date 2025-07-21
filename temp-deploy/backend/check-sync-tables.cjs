// 检查前端数据同步表
const mysql = require('mysql2/promise');

async function checkSyncTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查前端数据同步表...\n');
    
    // 1. 检查是否存在前端数据同步表
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%sync%'
    `);
    
    console.log('📋 同步相关表:');
    tables.forEach(table => {
      console.log(`   ${Object.values(table)[0]}`);
    });
    
    // 2. 检查frontend_data_sync表
    try {
      const [syncData] = await connection.execute(`
        SELECT * FROM frontend_data_sync 
        ORDER BY sync_time DESC 
        LIMIT 5
      `);
      
      console.log('\n📊 前端数据同步记录:');
      syncData.forEach((record, index) => {
        console.log(`\n第${index + 1}条同步记录:`);
        Object.entries(record).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      });
      
    } catch (error) {
      console.log('\n❌ frontend_data_sync表不存在或为空');
    }
    
    // 3. 检查所有表
    console.log('\n📋 数据库中的所有表:');
    const [allTables] = await connection.execute('SHOW TABLES');
    allTables.forEach(table => {
      console.log(`   ${Object.values(table)[0]}`);
    });
    
    // 4. 检查各表的数据量
    console.log('\n📊 各表数据统计:');
    
    const tableNames = ['inventory', 'lab_tests', 'online_tracking', 'assistant_rules'];
    
    for (const tableName of tableNames) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   ${tableName}: ${count[0].count} 条记录`);
        
        // 显示最新的几条记录
        const [recent] = await connection.execute(`
          SELECT * FROM ${tableName} 
          ORDER BY created_at DESC 
          LIMIT 3
        `);
        
        if (recent.length > 0) {
          console.log(`     最新记录时间: ${recent[0].created_at}`);
        }
        
      } catch (error) {
        console.log(`   ${tableName}: 表不存在或查询失败`);
      }
    }
    
    // 5. 检查数据是否是我们期望的格式
    console.log('\n🔍 数据格式检查:');
    
    try {
      const [sampleInventory] = await connection.execute(`
        SELECT storage_location, material_code, material_name, supplier_name, quantity, status
        FROM inventory 
        LIMIT 3
      `);
      
      console.log('库存数据样本:');
      sampleInventory.forEach((item, index) => {
        console.log(`   记录${index + 1}: ${item.storage_location} | ${item.material_name} | ${item.supplier_name} | ${item.quantity}`);
      });
      
    } catch (error) {
      console.log('❌ 无法获取库存数据样本');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkSyncTables();
