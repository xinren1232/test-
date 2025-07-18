// 检查您的真实前端数据
const mysql = require('mysql2/promise');

async function checkRealFrontendData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查您的真实前端数据...\n');
    
    // 1. 检查frontend_data_sync表的最新数据
    console.log('📋 检查frontend_data_sync表:');
    const [syncRows] = await connection.execute(`
      SELECT id, data_type, 
             CHAR_LENGTH(data_content) as content_length,
             LEFT(data_content, 200) as preview,
             created_at 
      FROM frontend_data_sync 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (syncRows.length === 0) {
      console.log('❌ frontend_data_sync表中没有数据');
    } else {
      syncRows.forEach((row, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log(`  ID: ${row.id}`);
        console.log(`  数据类型: ${row.data_type}`);
        console.log(`  内容长度: ${row.content_length} 字符`);
        console.log(`  创建时间: ${row.created_at}`);
        console.log(`  预览: ${row.preview}...`);
      });
    }
    
    // 2. 检查是否有其他可能的数据表
    console.log('\n📊 检查其他可能的数据表:');
    
    // 检查inventory_data表
    try {
      const [invRows] = await connection.execute(`
        SELECT COUNT(*) as count FROM inventory_data
      `);
      console.log(`  inventory_data表: ${invRows[0].count} 条记录`);
      
      if (invRows[0].count > 0) {
        const [sampleInv] = await connection.execute(`
          SELECT * FROM inventory_data LIMIT 3
        `);
        console.log('  库存数据样本:');
        sampleInv.forEach((item, index) => {
          console.log(`    记录${index + 1}: ${JSON.stringify(item).substring(0, 100)}...`);
        });
      }
    } catch (error) {
      console.log('  inventory_data表: 不存在或无法访问');
    }
    
    // 检查lab_tests表
    try {
      const [labRows] = await connection.execute(`
        SELECT COUNT(*) as count FROM lab_tests
      `);
      console.log(`  lab_tests表: ${labRows[0].count} 条记录`);
      
      if (labRows[0].count > 0) {
        const [sampleLab] = await connection.execute(`
          SELECT * FROM lab_tests LIMIT 3
        `);
        console.log('  检验数据样本:');
        sampleLab.forEach((item, index) => {
          console.log(`    记录${index + 1}: ${JSON.stringify(item).substring(0, 100)}...`);
        });
      }
    } catch (error) {
      console.log('  lab_tests表: 不存在或无法访问');
    }
    
    // 检查online_tracking表
    try {
      const [onlineRows] = await connection.execute(`
        SELECT COUNT(*) as count FROM online_tracking
      `);
      console.log(`  online_tracking表: ${onlineRows[0].count} 条记录`);
      
      if (onlineRows[0].count > 0) {
        const [sampleOnline] = await connection.execute(`
          SELECT * FROM online_tracking LIMIT 3
        `);
        console.log('  生产数据样本:');
        sampleOnline.forEach((item, index) => {
          console.log(`    记录${index + 1}: ${JSON.stringify(item).substring(0, 100)}...`);
        });
      }
    } catch (error) {
      console.log('  online_tracking表: 不存在或无法访问');
    }
    
    // 3. 检查所有表
    console.log('\n📚 数据库中的所有表:');
    const [tables] = await connection.execute(`
      SHOW TABLES
    `);
    
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkRealFrontendData();
