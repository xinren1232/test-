/**
 * 检查数据库中的数据
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDatabase() {
  let connection;
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    // 检查库存数据
    const [inventoryRows] = await connection.query('SELECT COUNT(*) as count FROM inventory');
    console.log(`📦 库存数据: ${inventoryRows[0].count} 条`);
    
    // 检查测试数据
    const [labRows] = await connection.query('SELECT COUNT(*) as count FROM lab_tests');
    console.log(`🧪 测试数据: ${labRows[0].count} 条`);

    // 查看lab_tests表结构
    console.log('\n📋 lab_tests表字段结构:');
    const [fields] = await connection.query('DESCRIBE lab_tests');
    fields.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type}`);
    });

    // 查看lab_tests示例数据
    console.log('\n📄 lab_tests示例数据:');
    const [labSample] = await connection.query('SELECT * FROM lab_tests LIMIT 2');
    if (labSample.length > 0) {
      console.log('字段列表:', Object.keys(labSample[0]).join(', '));
      console.log('示例记录:', labSample[0]);
    }
    
    // 检查生产数据
    const [productionRows] = await connection.query('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`🏭 生产数据: ${productionRows[0].count} 条`);
    
    // 查看库存数据样本 - 检查所有关键字段
    console.log('\n📦 库存数据样本:');
    const [inventorySample] = await connection.query(`
      SELECT id, material_code, material_name, supplier_name, storage_location, status, batch_code, quantity, inbound_time
      FROM inventory
      LIMIT 5
    `);
    console.table(inventorySample);
    
    // 查看供应商分布
    console.log('\n🏢 供应商分布:');
    const [supplierStats] = await connection.query(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.table(supplierStats);
    
    // 查看工厂分布
    console.log('\n🏭 工厂分布:');
    const [factoryStats] = await connection.query(`
      SELECT storage_location, COUNT(*) as count 
      FROM inventory 
      GROUP BY storage_location 
      ORDER BY count DESC
    `);
    console.table(factoryStats);
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
