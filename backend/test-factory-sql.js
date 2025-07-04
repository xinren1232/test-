/**
 * 测试工厂查询SQL
 */
import mysql from 'mysql2/promise';

async function testSQL() {
  console.log('🔍 测试工厂查询SQL\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    // 测试当前的SQL（参数为空）
    console.log('📊 测试1: 当前SQL（参数为空）...');
    const [result1] = await connection.query(`
      SELECT 
        storage_location as 工厂, 
        material_name as 物料名称, 
        supplier_name as 供应商, 
        COUNT(*) as 批次数量, 
        SUM(quantity) as 总库存量, 
        GROUP_CONCAT(DISTINCT status) as 状态分布, 
        AVG(quantity) as 平均批次量 
      FROM inventory 
      WHERE storage_location LIKE CONCAT('%', '', '%') 
      GROUP BY storage_location, material_name, supplier_name 
      ORDER BY SUM(quantity) DESC 
      LIMIT 20
    `);
    console.log(`结果数量: ${result1.length}`);
    console.table(result1.slice(0, 5));
    
    // 测试正确的SQL（深圳参数）
    console.log('\n📊 测试2: 正确SQL（深圳参数）...');
    const [result2] = await connection.query(`
      SELECT 
        storage_location as 工厂, 
        material_name as 物料名称, 
        supplier_name as 供应商, 
        COUNT(*) as 批次数量, 
        SUM(quantity) as 总库存量, 
        GROUP_CONCAT(DISTINCT status) as 状态分布, 
        AVG(quantity) as 平均批次量 
      FROM inventory 
      WHERE storage_location LIKE CONCAT('%', '深圳', '%') 
      GROUP BY storage_location, material_name, supplier_name 
      ORDER BY SUM(quantity) DESC 
      LIMIT 20
    `);
    console.log(`结果数量: ${result2.length}`);
    console.table(result2.slice(0, 10));
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

testSQL();
