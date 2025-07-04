/**
 * 调试数据库内容
 * 检查数据同步后数据库中的实际数据
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function debugDatabaseContent() {
  console.log('🔍 开始调试数据库内容...\n');
  
  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查库存表数据
    console.log('\n📦 检查库存表数据:');
    const [inventoryRows] = await connection.execute('SELECT * FROM inventory ORDER BY id DESC LIMIT 10');
    console.log(`库存记录总数: ${inventoryRows.length}`);
    
    if (inventoryRows.length > 0) {
      console.log('\n最新的库存记录:');
      inventoryRows.slice(0, 5).forEach((row, index) => {
        console.log(`${index + 1}. ${row.material_name} (${row.material_code})`);
        console.log(`   批次: ${row.batch_code} | 供应商: ${row.supplier_name}`);
        console.log(`   数量: ${row.quantity} | 工厂: ${row.storage_location}`);
        console.log(`   状态: ${row.status} | 风险: ${row.risk_level}`);
        console.log(`   入库时间: ${row.inbound_time}\n`);
      });
    }
    
    // 2. 测试特定查询
    console.log('\n🎯 测试特定查询:');
    
    // 测试供应商查询
    console.log('\n查询"测试供应商A":');
    const [supplierRows] = await connection.execute(
      'SELECT * FROM inventory WHERE supplier_name LIKE ?', 
      ['%测试供应商A%']
    );
    console.log(`找到 ${supplierRows.length} 条记录`);
    if (supplierRows.length > 0) {
      supplierRows.forEach(row => {
        console.log(`  - ${row.material_name} | 批次: ${row.batch_code}`);
      });
    }
    
    // 测试批次查询
    console.log('\n查询批次"TEST-001":');
    const [batchRows] = await connection.execute(
      'SELECT * FROM inventory WHERE batch_code LIKE ?', 
      ['%TEST-001%']
    );
    console.log(`找到 ${batchRows.length} 条记录`);
    if (batchRows.length > 0) {
      batchRows.forEach(row => {
        console.log(`  - ${row.material_name} | 供应商: ${row.supplier_name}`);
      });
    }
    
    // 3. 检查所有供应商名称
    console.log('\n📋 所有供应商名称:');
    const [suppliers] = await connection.execute(
      'SELECT DISTINCT supplier_name FROM inventory ORDER BY supplier_name LIMIT 20'
    );
    console.log('供应商列表:');
    suppliers.forEach((row, index) => {
      console.log(`${index + 1}. ${row.supplier_name}`);
    });
    
    // 4. 检查最新批次号
    console.log('\n📋 最新批次号:');
    const [batches] = await connection.execute(
      'SELECT DISTINCT batch_code FROM inventory ORDER BY id DESC LIMIT 10'
    );
    console.log('批次列表:');
    batches.forEach((row, index) => {
      console.log(`${index + 1}. ${row.batch_code}`);
    });
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行调试
debugDatabaseContent().catch(console.error);
