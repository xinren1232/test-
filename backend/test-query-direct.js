import mysql from 'mysql2/promise';

async function testDirectQuery() {
  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 测试查询深圳工厂的库存
    console.log('\n🔍 测试查询：深圳工厂的库存情况');
    const [rows] = await connection.execute(`
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        inbound_time as 入库时间
      FROM inventory 
      WHERE storage_location LIKE '%深圳%'
      LIMIT 10
    `);
    
    console.log(`📊 查询结果: ${rows.length} 条记录`);
    if (rows.length > 0) {
      console.log('📋 样本数据:');
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.物料名称} (${row.物料编码}) - ${row.供应商} - 数量: ${row.数量} - 状态: ${row.状态}`);
      });
    }
    
    // 测试查询BOE供应商的物料
    console.log('\n🔍 测试查询：BOE供应商的物料');
    const [boeRows] = await connection.execute(`
      SELECT 
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        storage_location as 工厂
      FROM inventory 
      WHERE supplier_name LIKE '%BOE%'
      LIMIT 10
    `);
    
    console.log(`📊 BOE查询结果: ${boeRows.length} 条记录`);
    if (boeRows.length > 0) {
      console.log('📋 BOE样本数据:');
      boeRows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.物料名称} (${row.物料编码}) - 数量: ${row.数量} - 状态: ${row.状态} - 工厂: ${row.工厂}`);
      });
    }
    
    // 测试查询所有供应商
    console.log('\n🔍 查看所有供应商:');
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name, COUNT(*) as count
      FROM inventory 
      GROUP BY supplier_name
      ORDER BY count DESC
    `);
    
    console.log('📋 供应商列表:');
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.supplier_name} - ${supplier.count} 条记录`);
    });
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDirectQuery().catch(console.error);
