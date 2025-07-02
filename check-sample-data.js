/**
 * 检查数据库中的样本数据
 */

const mysql = require('mysql2/promise');

async function checkSampleData() {
  console.log('=== 检查实际数据样本 ===');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Flameaway3.',
      database: 'iqe_inspection'
    });
    
    // 检查库存数据
    console.log('\n📦 库存数据样本:');
    const [inventory] = await connection.execute('SELECT material_name, supplier_name, storage_location FROM inventory LIMIT 5');
    inventory.forEach((item, i) => {
      console.log(`  ${i+1}. 物料: ${item.material_name}, 供应商: ${item.supplier_name}, 位置: ${item.storage_location}`);
    });
    
    // 检查测试数据
    console.log('\n🧪 测试数据样本:');
    const [tests] = await connection.execute('SELECT material_name, supplier_name FROM lab_tests LIMIT 5');
    tests.forEach((item, i) => {
      console.log(`  ${i+1}. 物料: ${item.material_name}, 供应商: ${item.supplier_name}`);
    });
    
    // 检查在线跟踪数据
    console.log('\n🏭 在线跟踪数据样本:');
    const [tracking] = await connection.execute('SELECT material_name, factory, project FROM online_tracking LIMIT 5');
    tracking.forEach((item, i) => {
      console.log(`  ${i+1}. 物料: ${item.material_name}, 工厂: ${item.factory}, 项目: ${item.project}`);
    });
    
    await connection.end();
    console.log('\n✅ 数据检查完成');
    
  } catch (error) {
    console.error('❌ 数据检查失败:', error.message);
  }
}

checkSampleData();
