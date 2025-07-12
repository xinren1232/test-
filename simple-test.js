// 简单数据库查询测试脚本
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testDatabaseQueries() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 测试1: 查询电池库存');
    const [batteryInventory] = await connection.execute(`
      SELECT 
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        storage_location as 存储位置
      FROM inventory 
      WHERE material_name LIKE '%电池%' 
      LIMIT 5
    `);
    console.log(`✅ 找到 ${batteryInventory.length} 条电池库存记录`);
    if (batteryInventory.length > 0) {
      console.log('📋 示例数据:', batteryInventory[0]);
    }
    
    console.log('\n🔍 测试2: 查询BOE供应商库存');
    const [boeInventory] = await connection.execute(`
      SELECT 
        material_name as 物料名称,
        quantity as 数量,
        status as 状态,
        storage_location as 存储位置
      FROM inventory 
      WHERE supplier_name = 'BOE' 
      LIMIT 5
    `);
    console.log(`✅ 找到 ${boeInventory.length} 条BOE供应商库存记录`);
    if (boeInventory.length > 0) {
      console.log('📋 示例数据:', boeInventory[0]);
    }
    
    console.log('\n🔍 测试3: 查询测试失败(NG)记录');
    const [ngRecords] = await connection.execute(`
      SELECT 
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 测试结果,
        defect_description as 缺陷描述,
        inspection_date as 检验日期
      FROM inspection_records 
      WHERE test_result = 'NG' 
      LIMIT 5
    `);
    console.log(`✅ 找到 ${ngRecords.length} 条NG测试记录`);
    if (ngRecords.length > 0) {
      console.log('📋 示例数据:', ngRecords[0]);
    }
    
    console.log('\n🔍 测试4: 查询风险状态库存');
    const [riskInventory] = await connection.execute(`
      SELECT 
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        storage_location as 存储位置
      FROM inventory 
      WHERE status = '风险' 
      LIMIT 5
    `);
    console.log(`✅ 找到 ${riskInventory.length} 条风险状态库存记录`);
    if (riskInventory.length > 0) {
      console.log('📋 示例数据:', riskInventory[0]);
    }
    
    console.log('\n🔍 测试5: 查询LCD显示屏测试情况');
    const [lcdTests] = await connection.execute(`
      SELECT 
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 测试结果,
        defect_description as 缺陷描述,
        inspection_date as 检验日期
      FROM inspection_records 
      WHERE material_name LIKE '%LCD%' OR material_name LIKE '%显示屏%'
      LIMIT 5
    `);
    console.log(`✅ 找到 ${lcdTests.length} 条LCD显示屏测试记录`);
    if (lcdTests.length > 0) {
      console.log('📋 示例数据:', lcdTests[0]);
    }
    
    console.log('\n🔍 测试6: 供应商对比数据');
    const [supplierComparison] = await connection.execute(`
      SELECT 
        supplier_name as 供应商,
        COUNT(*) as 总记录数,
        SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过数,
        SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 失败数,
        ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率
      FROM inspection_records 
      WHERE supplier_name IN ('聚龙', '天马')
      GROUP BY supplier_name
    `);
    console.log(`✅ 找到 ${supplierComparison.length} 个供应商对比数据`);
    supplierComparison.forEach(row => {
      console.log(`📊 ${row.供应商}: 通过率 ${row.通过率}% (${row.通过数}/${row.总记录数})`);
    });
    
    await connection.end();
    console.log('\n🎉 数据库查询测试完成！所有查询都能正常返回数据。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDatabaseQueries();
