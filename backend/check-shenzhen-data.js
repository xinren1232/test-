/**
 * 检查深圳工厂数据
 */
import mysql from 'mysql2/promise';

async function checkShenzhenData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  console.log('🔍 检查深圳工厂数据...\n');
  
  try {
    // 检查storage_location字段的所有值
    const [locations] = await connection.query('SELECT DISTINCT storage_location FROM inventory ORDER BY storage_location');
    console.log('📍 所有存储位置:');
    locations.forEach(loc => console.log('  -', loc.storage_location));
    
    // 检查包含深圳的记录
    const [shenzhenRecords] = await connection.query('SELECT * FROM inventory WHERE storage_location LIKE ? LIMIT 3', ['%深圳%']);
    console.log('\n📋 深圳工厂记录数量:', shenzhenRecords.length);
    if (shenzhenRecords.length > 0) {
      console.log('📄 样本记录:');
      console.log('  物料名称:', shenzhenRecords[0].material_name);
      console.log('  供应商:', shenzhenRecords[0].supplier_name);
      console.log('  存储位置:', shenzhenRecords[0].storage_location);
      console.log('  数量:', shenzhenRecords[0].quantity);
      console.log('  状态:', shenzhenRecords[0].status);
    }
    
    // 检查总库存记录数
    const [totalCount] = await connection.query('SELECT COUNT(*) as count FROM inventory');
    console.log('\n📊 总库存记录数:', totalCount[0].count);
    
  } catch (error) {
    console.log('❌ 查询失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkShenzhenData().catch(console.error);
