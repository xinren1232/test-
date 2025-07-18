// 调试字段映射问题
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function debugFieldMapping() {
  let connection;
  
  try {
    console.log('🔍 调试字段映射问题...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查前端数据同步表的实际结构
    console.log('\n📋 检查前端数据同步表结构:');
    
    const tables = ['frontend_data_sync_inventory', 'frontend_data_sync_inspection', 'frontend_data_sync_production'];
    
    for (const table of tables) {
      try {
        console.log(`\n${table}表:`);
        
        // 获取表结构
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        const fieldNames = columns.map(col => col.Field);
        console.log(`  字段: ${fieldNames.join(', ')}`);
        
        // 获取第一条数据查看实际内容
        const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
        if (rows.length > 0) {
          console.log('  第一条数据:');
          Object.entries(rows[0]).forEach(([key, value]) => {
            const displayValue = value && value.toString().length > 30 
              ? value.toString().substring(0, 30) + '...' 
              : value;
            console.log(`    ${key}: ${displayValue}`);
          });
        } else {
          console.log('  无数据');
        }
        
      } catch (error) {
        console.log(`  ❌ ${table}表不存在或查询失败: ${error.message}`);
      }
    }
    
    // 2. 检查原始数据表的结构
    console.log('\n📋 检查原始数据表结构:');
    
    const originalTables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const table of originalTables) {
      try {
        console.log(`\n${table}表:`);
        
        // 获取表结构
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        const fieldNames = columns.map(col => col.Field);
        console.log(`  字段: ${fieldNames.join(', ')}`);
        
        // 获取第一条数据查看实际内容
        const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
        if (rows.length > 0) {
          console.log('  第一条数据:');
          Object.entries(rows[0]).forEach(([key, value]) => {
            const displayValue = value && value.toString().length > 30 
              ? value.toString().substring(0, 30) + '...' 
              : value;
            console.log(`    ${key}: ${displayValue}`);
          });
        } else {
          console.log('  无数据');
        }
        
      } catch (error) {
        console.log(`  ❌ ${table}表不存在或查询失败: ${error.message}`);
      }
    }
    
    // 3. 分析字段映射问题
    console.log('\n🔍 分析字段映射问题:');
    
    // 检查inventory表的具体字段
    try {
      const [inventoryData] = await connection.execute(`
        SELECT * FROM frontend_data_sync_inventory LIMIT 3
      `);
      
      if (inventoryData.length > 0) {
        console.log('\n库存数据字段分析:');
        const sample = inventoryData[0];
        
        // 检查可能的工厂字段
        const factoryFields = ['factory', 'storage_location', 'warehouse', 'location'];
        factoryFields.forEach(field => {
          if (sample.hasOwnProperty(field)) {
            console.log(`  ${field}: ${sample[field]}`);
          }
        });
        
        // 检查可能的物料字段
        const materialFields = ['materialName', 'material_name', 'materialCode', 'material_code', 'materialType', 'material_type'];
        materialFields.forEach(field => {
          if (sample.hasOwnProperty(field)) {
            console.log(`  ${field}: ${sample[field]}`);
          }
        });
        
        // 检查可能的供应商字段
        const supplierFields = ['supplier', 'supplier_name', 'supplierName'];
        supplierFields.forEach(field => {
          if (sample.hasOwnProperty(field)) {
            console.log(`  ${field}: ${sample[field]}`);
          }
        });
        
        // 检查可能的批次字段
        const batchFields = ['batchNo', 'batch_no', 'batchCode', 'batch_code'];
        batchFields.forEach(field => {
          if (sample.hasOwnProperty(field)) {
            console.log(`  ${field}: ${sample[field]}`);
          }
        });
      }
      
    } catch (error) {
      console.log(`❌ 分析库存数据失败: ${error.message}`);
    }
    
    console.log('\n🎯 建议的字段映射修复方案将基于以上实际数据结构生成');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugFieldMapping();
