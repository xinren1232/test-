// 检查当前数据库中的实际数据
const mysql = require('mysql2/promise');

async function checkCurrentData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查当前数据库中的实际数据...\n');
    
    // 1. 检查inventory表的数据
    console.log('📦 库存数据 (inventory表):');
    const [inventoryData] = await connection.execute(`
      SELECT 
        SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
        SUBSTRING_INDEX(storage_location, '-', -1) as '仓库',
        material_code as '物料编码',
        material_name as '物料名称',
        material_type as '物料类型',
        supplier_name as '供应商',
        quantity as '数量',
        status as '状态',
        DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as '入库时间',
        COALESCE(notes, '') as '备注'
      FROM inventory 
      ORDER BY inbound_time DESC 
      LIMIT 10
    `);
    
    console.log(`找到 ${inventoryData.length} 条库存记录:`);
    inventoryData.forEach((item, index) => {
      console.log(`\n第${index + 1}条:`);
      Object.entries(item).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    });
    
    // 2. 检查数据总数
    console.log('\n📊 数据统计:');
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [inspectionCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [productionCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log(`   库存数据: ${inventoryCount[0].count} 条`);
    console.log(`   检验数据: ${inspectionCount[0].count} 条`);
    console.log(`   生产数据: ${productionCount[0].count} 条`);
    
    // 3. 检查数据来源和创建时间
    console.log('\n🕒 数据创建时间分析:');
    const [timeAnalysis] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        MIN(created_at) as first_record,
        MAX(created_at) as last_record
      FROM inventory 
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 5
    `);
    
    timeAnalysis.forEach(item => {
      console.log(`   ${item.date}: ${item.count}条记录 (${item.first_record} ~ ${item.last_record})`);
    });
    
    // 4. 检查供应商分布
    console.log('\n🏭 供应商分布:');
    const [supplierStats] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count
      FROM inventory 
      GROUP BY supplier_name
      ORDER BY count DESC
      LIMIT 10
    `);
    
    supplierStats.forEach(item => {
      console.log(`   ${item.supplier_name}: ${item.count}条记录`);
    });
    
    // 5. 检查物料类型分布
    console.log('\n📱 物料类型分布:');
    const [materialStats] = await connection.execute(`
      SELECT material_type, COUNT(*) as count
      FROM inventory 
      GROUP BY material_type
      ORDER BY count DESC
      LIMIT 10
    `);
    
    materialStats.forEach(item => {
      console.log(`   ${item.material_type}: ${item.count}条记录`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkCurrentData();
