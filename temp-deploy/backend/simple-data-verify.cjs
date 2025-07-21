// 简单验证数据一致性
const mysql = require('mysql2/promise');

async function simpleDataVerify() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 验证真实数据表内容...\n');
    
    // 查询真实数据表前3条
    const [realData] = await connection.execute(`
      SELECT * FROM inventory ORDER BY created_at DESC LIMIT 3
    `);
    
    console.log('📋 真实inventory表前3条数据:');
    realData.forEach((item, index) => {
      console.log(`\n${index + 1}. ID: ${item.id}`);
      console.log(`   物料编码: ${item.material_code}`);
      console.log(`   物料名称: ${item.material_name}`);
      console.log(`   物料类型: ${item.material_type}`);
      console.log(`   供应商: ${item.supplier_name}`);
      console.log(`   批次号: ${item.batch_code}`);
      console.log(`   数量: ${item.quantity}`);
      console.log(`   状态: ${item.status}`);
      console.log(`   存储位置: ${item.storage_location}`);
      console.log(`   入库时间: ${item.inbound_time}`);
    });
    
    console.log('\n🎯 验证完成！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    await connection.end();
  }
}

simpleDataVerify();
