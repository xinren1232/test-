// 检查前端数据同步表的结构和数据
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkFrontendSyncData() {
  let connection;
  
  try {
    console.log('🔍 检查前端数据同步表...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查frontend_data_sync表结构
    console.log('\n📊 frontend_data_sync表结构:');
    try {
      const [syncColumns] = await connection.execute('DESCRIBE frontend_data_sync');
      syncColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
      });
      
      // 检查数据样本
      const [syncSample] = await connection.execute('SELECT * FROM frontend_data_sync LIMIT 3');
      if (syncSample.length > 0) {
        console.log('\n📋 frontend_data_sync表数据样本:');
        syncSample.forEach((row, index) => {
          console.log(`\n样本 ${index + 1}:`);
          console.log(`  ID: ${row.id}`);
          console.log(`  数据类型: ${row.data_type}`);
          console.log(`  数据长度: ${row.data_content ? row.data_content.length : 0} 字符`);
          
          // 解析数据内容
          if (row.data_content) {
            try {
              const data = JSON.parse(row.data_content);
              if (Array.isArray(data) && data.length > 0) {
                console.log(`  数据条数: ${data.length}`);
                console.log(`  第一条数据字段: ${Object.keys(data[0]).join(', ')}`);
                
                // 显示第一条数据的详细内容
                if (data[0]) {
                  console.log(`  第一条数据内容:`);
                  Object.entries(data[0]).forEach(([key, value]) => {
                    const displayValue = typeof value === 'string' && value.length > 50 
                      ? value.substring(0, 50) + '...' 
                      : value;
                    console.log(`    ${key}: ${displayValue}`);
                  });
                }
              }
            } catch (error) {
              console.log(`  数据解析失败: ${error.message}`);
            }
          }
        });
      } else {
        console.log('\n📋 frontend_data_sync表无数据');
      }
      
      // 统计各类型数据数量
      const [typeStats] = await connection.execute(`
        SELECT data_type, COUNT(*) as count 
        FROM frontend_data_sync 
        GROUP BY data_type
      `);
      
      if (typeStats.length > 0) {
        console.log('\n📈 数据类型统计:');
        typeStats.forEach(stat => {
          console.log(`  ${stat.data_type}: ${stat.count} 条`);
        });
      }
      
    } catch (error) {
      console.log('❌ frontend_data_sync表检查失败:', error.message);
    }
    
    console.log('\n🎉 前端数据同步表检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkFrontendSyncData();
