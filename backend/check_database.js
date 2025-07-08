/**
 * 检查数据库结构和数据的脚本
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 检查库存表结构
    console.log('\n📦 库存表(inventory)结构:');
    const [inventoryStructure] = await connection.execute('DESCRIBE inventory');
    console.table(inventoryStructure);

    // 检查库存数据统计
    const [inventoryStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT supplier_name) as supplier_count,
        COUNT(DISTINCT material_name) as material_count,
        COUNT(DISTINCT storage_location) as location_count
      FROM inventory
    `);
    console.log('\n📊 库存数据统计:', inventoryStats[0]);

    // 检查供应商分布
    const [supplierData] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('\n🏭 供应商分布(前10):');
    console.table(supplierData);

    // 检查物料分布
    const [materialData] = await connection.execute(`
      SELECT material_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('\n📋 物料分布(前10):');
    console.table(materialData);

    // 检查测试表结构
    console.log('\n🧪 测试表(lab_tests)结构:');
    const [testStructure] = await connection.execute('DESCRIBE lab_tests');
    console.table(testStructure);

    // 检查测试数据统计
    const [testStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT supplier_name) as supplier_count,
        COUNT(DISTINCT material_name) as material_count,
        SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) as fail_count
      FROM lab_tests
    `);
    console.log('\n🧪 测试数据统计:', testStats[0]);

    // 检查上线跟踪表结构
    console.log('\n🏭 上线跟踪表(online_tracking)结构:');
    const [trackingStructure] = await connection.execute('DESCRIBE online_tracking');
    console.table(trackingStructure);

    // 检查上线跟踪数据统计
    const [trackingStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT supplier_name) as supplier_count,
        COUNT(DISTINCT material_name) as material_count,
        COUNT(DISTINCT factory) as factory_count
      FROM online_tracking
    `);
    console.log('\n🏭 上线跟踪数据统计:', trackingStats[0]);

    // 检查数据关联性
    console.log('\n🔗 数据关联性检查:');
    const [relationCheck] = await connection.execute(`
      SELECT 
        'inventory-lab_tests' as relation_type,
        COUNT(DISTINCT i.batch_code) as inventory_batches,
        COUNT(DISTINCT l.batch_code) as test_batches,
        COUNT(DISTINCT i.batch_code) - COUNT(DISTINCT l.batch_code) as diff
      FROM inventory i
      LEFT JOIN lab_tests l ON i.batch_code = l.batch_code
      UNION ALL
      SELECT 
        'inventory-online_tracking' as relation_type,
        COUNT(DISTINCT i.batch_code) as inventory_batches,
        COUNT(DISTINCT o.batch_code) as tracking_batches,
        COUNT(DISTINCT i.batch_code) - COUNT(DISTINCT o.batch_code) as diff
      FROM inventory i
      LEFT JOIN online_tracking o ON i.batch_code = o.batch_code
    `);
    console.table(relationCheck);

  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
