// 查找您的真实数据源
const mysql = require('mysql2/promise');

async function findRealDataSource() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 查找您的真实数据源...\n');
    
    // 目标数据量
    const targetCounts = {
      inventory: 132,
      inspection: 396,
      production: 1056
    };
    
    console.log('🎯 目标数据量:');
    console.log(`  库存总数: ${targetCounts.inventory}`);
    console.log(`  测试记录: ${targetCounts.inspection}`);
    console.log(`  上线记录: ${targetCounts.production}`);
    console.log('');
    
    // 1. 检查所有表的记录数
    console.log('📊 检查所有表的记录数:');
    const [tables] = await connection.execute('SHOW TABLES');
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const recordCount = count[0].count;
        console.log(`  ${tableName}: ${recordCount} 条记录`);
        
        // 检查是否匹配目标数量
        if (recordCount === targetCounts.inventory) {
          console.log(`    🎯 可能是库存数据表！`);
        } else if (recordCount === targetCounts.inspection) {
          console.log(`    🎯 可能是检验数据表！`);
        } else if (recordCount === targetCounts.production) {
          console.log(`    🎯 可能是生产数据表！`);
        }
      } catch (error) {
        console.log(`  ${tableName}: 无法访问 (${error.message})`);
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. 检查frontend_data_sync表的详细内容
    console.log('📋 检查frontend_data_sync表的详细内容:');
    const [syncData] = await connection.execute(`
      SELECT id, data_type, 
             JSON_LENGTH(data_content) as record_count,
             CHAR_LENGTH(data_content) as content_length,
             created_at
      FROM frontend_data_sync 
      ORDER BY created_at DESC
    `);
    
    if (syncData.length === 0) {
      console.log('❌ frontend_data_sync表为空');
    } else {
      syncData.forEach(row => {
        console.log(`\n数据类型: ${row.data_type}`);
        console.log(`  记录数: ${row.record_count}`);
        console.log(`  内容长度: ${row.content_length} 字符`);
        console.log(`  创建时间: ${row.created_at}`);
        
        // 检查是否匹配目标数量
        if (row.record_count === targetCounts.inventory && row.data_type === 'inventory') {
          console.log(`  🎯 这是正确的库存数据！`);
        } else if (row.record_count === targetCounts.inspection && row.data_type === 'inspection') {
          console.log(`  🎯 这是正确的检验数据！`);
        } else if (row.record_count === targetCounts.production && row.data_type === 'production') {
          console.log(`  🎯 这是正确的生产数据！`);
        } else {
          console.log(`  ⚠️ 数据量不匹配，可能是干扰数据`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. 查找可能包含真实数据的表
    console.log('🔍 查找可能包含真实数据的表:');
    
    // 检查是否有其他可能的表名
    const possibleTableNames = [
      'inventory_data', 'inventory_records', 'stock_data',
      'test_data', 'test_records', 'inspection_data', 'quality_data',
      'production_data', 'production_records', 'online_data', 'tracking_data'
    ];
    
    for (const tableName of possibleTableNames) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const recordCount = count[0].count;
        console.log(`  ${tableName}: ${recordCount} 条记录`);
        
        if (recordCount === targetCounts.inventory || 
            recordCount === targetCounts.inspection || 
            recordCount === targetCounts.production) {
          console.log(`    🎯 可能包含真实数据！`);
          
          // 查看表结构
          const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
          console.log(`    表结构:`);
          structure.forEach(field => {
            console.log(`      ${field.Field}: ${field.Type}`);
          });
        }
      } catch (error) {
        // 表不存在，跳过
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. 建议清理方案
    console.log('🧹 建议清理方案:');
    console.log('1. 清理frontend_data_sync表中的干扰数据');
    console.log('2. 重新从前端同步真实数据');
    console.log('3. 验证数据量是否匹配目标值');
    console.log('4. 更新后端API指向正确的数据源');
    
  } catch (error) {
    console.error('❌ 查找失败:', error.message);
  } finally {
    await connection.end();
  }
}

findRealDataSource();
