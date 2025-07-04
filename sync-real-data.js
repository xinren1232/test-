/**
 * 同步真实数据到数据库
 * 基于您的真实数据生成器创建数据并同步到数据库
 */

import mysql from 'mysql2/promise';
import { generateInventoryData } from './ai-inspection-dashboard/src/data/data_generator.js';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function syncRealData() {
  console.log('🚀 开始同步真实数据到数据库...\n');
  
  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 生成真实数据
    console.log('📊 生成真实库存数据...');
    const inventoryData = generateInventoryData(50); // 生成50条库存数据
    
    console.log(`生成了 ${inventoryData.length} 条库存数据`);
    console.log('数据样例:');
    console.log('- 物料名称:', inventoryData[0].material_name);
    console.log('- 物料编码:', inventoryData[0].material_code);
    console.log('- 供应商:', inventoryData[0].supplier);
    console.log('- 批次号:', inventoryData[0].batch_code);
    console.log('- 工厂:', inventoryData[0].factory);
    console.log('- 状态:', inventoryData[0].status);
    
    // 清空现有数据
    console.log('\n🗑️ 清空现有数据...');
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM lab_tests');
    await connection.execute('DELETE FROM online_tracking');
    
    // 同步库存数据
    console.log('\n📦 同步库存数据到数据库...');
    for (let i = 0; i < inventoryData.length; i++) {
      const item = inventoryData[i];
      
      await connection.execute(`
        INSERT INTO inventory (
          id, batch_code, material_code, material_name, material_type,
          supplier_name, quantity, inbound_time, storage_location,
          status, risk_level, inspector, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        `INV-${i + 1}`,
        item.batch_code,
        item.material_code,
        item.material_name,
        item.category,
        item.supplier,
        item.quantity,
        item.inspectionDate,
        item.factory,
        item.status,
        item.risk_level || 'low',
        '系统管理员',
        item.quality || ''
      ]);
      
      if ((i + 1) % 10 === 0) {
        console.log(`已同步 ${i + 1}/${inventoryData.length} 条库存数据`);
      }
    }
    
    // 验证数据同步
    console.log('\n🔍 验证数据同步结果...');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`✅ 库存表中共有 ${rows[0].count} 条记录`);
    
    // 显示供应商统计
    const [suppliers] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY supplier_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log('\n📊 供应商统计 (前10名):');
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.supplier_name}: ${supplier.count} 条记录`);
    });
    
    // 显示物料统计
    const [materials] = await connection.execute(`
      SELECT material_name, COUNT(*) as count 
      FROM inventory 
      GROUP BY material_name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log('\n📊 物料统计 (前10名):');
    materials.forEach((material, index) => {
      console.log(`${index + 1}. ${material.material_name}: ${material.count} 条记录`);
    });
    
    // 显示工厂统计
    const [factories] = await connection.execute(`
      SELECT storage_location, COUNT(*) as count 
      FROM inventory 
      GROUP BY storage_location 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 工厂统计:');
    factories.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.storage_location}: ${factory.count} 条记录`);
    });
    
    console.log('\n🎉 真实数据同步完成！');
    
  } catch (error) {
    console.error('❌ 数据同步失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行同步
syncRealData().catch(console.error);
