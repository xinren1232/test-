import mysql from 'mysql2/promise';

async function checkSuppliers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('=== 检查供应商数据 ===');
    const [suppliers] = await connection.execute('SELECT DISTINCT supplier_name FROM inventory ORDER BY supplier_name');
    console.log('库存表中的供应商:');
    suppliers.forEach(s => console.log('- ' + s.supplier_name));
    
    console.log('\n=== 检查天马相关数据 ===');
    const [tianma] = await connection.execute("SELECT * FROM inventory WHERE supplier_name LIKE '%天马%' LIMIT 5");
    console.log('天马供应商数据:');
    tianma.forEach(item => console.log(JSON.stringify(item, null, 2)));
    
    console.log('\n=== 检查测试表中的供应商 ===');
    const [testSuppliers] = await connection.execute('SELECT DISTINCT supplier_name FROM test_tracking ORDER BY supplier_name');
    console.log('测试表中的供应商:');
    testSuppliers.forEach(s => console.log('- ' + s.supplier_name));
    
    await connection.end();
  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkSuppliers();
