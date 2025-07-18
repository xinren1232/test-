// 检查检验数据
const mysql = require('mysql2/promise');

async function checkInspectionData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查检验数据...\n');
    
    // 查看检验数据
    const [rows] = await connection.execute(`
      SELECT data_type, data_content 
      FROM frontend_data_sync 
      WHERE data_type = 'inspection'
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (rows.length === 0) {
      console.log('❌ 未找到检验数据');
      return;
    }
    
    console.log('📋 检验数据内容:');
    console.log('数据类型:', rows[0].data_type);
    console.log('数据长度:', rows[0].data_content.length);
    console.log('前100字符:', rows[0].data_content.substring(0, 100));
    
    try {
      const parsed = JSON.parse(rows[0].data_content);
      console.log('✅ JSON解析成功');
      console.log('数组长度:', parsed.length);
      
      if (parsed.length > 0) {
        console.log('\n📝 第一条检验记录:');
        const sample = parsed[0];
        Object.keys(sample).forEach(key => {
          console.log(`  ${key}: ${sample[key]}`);
        });
      }
    } catch (error) {
      console.log('❌ JSON解析失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkInspectionData();
