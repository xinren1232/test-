/**
 * 清理数据库中的模拟数据
 * 删除干扰程序优化的硬编码测试数据
 */

import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function cleanMockData() {
  console.log('🧹 开始清理数据库中的模拟数据...');
  
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    
    // 1. 清理inventory表中的模拟数据
    console.log('\n📦 清理inventory表中的模拟数据...');
    
    const mockInventoryIds = ['F001', 'F002']; // 已知的模拟数据ID
    for (const id of mockInventoryIds) {
      const [result] = await connection.execute('DELETE FROM inventory WHERE id = ?', [id]);
      console.log(`  删除inventory记录 ${id}: ${result.affectedRows} 行`);
    }
    
    // 也可以根据特征删除
    const [inventoryResult] = await connection.execute(`
      DELETE FROM inventory 
      WHERE material_name IN ('电阻器-0805-10K', '电容器-0603-1uF') 
      OR supplier_name IN ('泰科电子', '三星电子')
      OR batch_code IN ('TK2023101', 'SS2023050')
    `);
    console.log(`  按特征删除inventory记录: ${inventoryResult.affectedRows} 行`);
    
    // 2. 清理lab_tests表中的模拟数据
    console.log('\n🧪 清理lab_tests表中的模拟数据...');
    
    const mockTestIds = ['L001', 'L002']; // 已知的模拟数据ID
    for (const id of mockTestIds) {
      const [result] = await connection.execute('DELETE FROM lab_tests WHERE id = ?', [id]);
      console.log(`  删除lab_tests记录 ${id}: ${result.affectedRows} 行`);
    }
    
    // 也可以根据特征删除
    const [testsResult] = await connection.execute(`
      DELETE FROM lab_tests 
      WHERE material_name IN ('电阻器-0805-10K', '电容器-0603-1uF')
      OR supplier_name = '未知供应商'
      OR batch_code LIKE 'BATCH%'
    `);
    console.log(`  按特征删除lab_tests记录: ${testsResult.affectedRows} 行`);
    
    // 3. 清理online_tracking表中的模拟数据
    console.log('\n🏭 清理online_tracking表中的模拟数据...');
    
    const mockTrackingIds = ['O001', 'O002']; // 已知的模拟数据ID
    for (const id of mockTrackingIds) {
      const [result] = await connection.execute('DELETE FROM online_tracking WHERE id = ?', [id]);
      console.log(`  删除online_tracking记录 ${id}: ${result.affectedRows} 行`);
    }
    
    // 也可以根据特征删除
    const [trackingResult] = await connection.execute(`
      DELETE FROM online_tracking 
      WHERE material_name IN ('电阻器-0805-10K', '电容器-0603-1uF')
      OR supplier_name = '未知供应商'
      OR batch_code LIKE 'BATCH%'
      OR project = 'PROJECT_001'
    `);
    console.log(`  按特征删除online_tracking记录: ${trackingResult.affectedRows} 行`);
    
    // 4. 检查清理后的数据状态
    console.log('\n📊 检查清理后的数据状态...');
    
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`  inventory表剩余记录: ${inventoryCount[0].count} 条`);
    
    const [testsCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    console.log(`  lab_tests表剩余记录: ${testsCount[0].count} 条`);
    
    const [trackingCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    console.log(`  online_tracking表剩余记录: ${trackingCount[0].count} 条`);
    
    // 5. 显示剩余数据样本
    if (inventoryCount[0].count > 0) {
      console.log('\n📋 剩余inventory数据样本:');
      const [sampleInventory] = await connection.execute('SELECT material_name, supplier_name FROM inventory LIMIT 3');
      sampleInventory.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.material_name} - ${item.supplier_name}`);
      });
    }
    
    if (testsCount[0].count > 0) {
      console.log('\n📋 剩余lab_tests数据样本:');
      const [sampleTests] = await connection.execute('SELECT material_name, test_result FROM lab_tests LIMIT 3');
      sampleTests.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.material_name} - ${item.test_result}`);
      });
    }
    
    if (trackingCount[0].count > 0) {
      console.log('\n📋 剩余online_tracking数据样本:');
      const [sampleTracking] = await connection.execute('SELECT material_name, factory FROM online_tracking LIMIT 3');
      sampleTracking.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.material_name} - ${item.factory}`);
      });
    }
    
    await connection.end();
    console.log('\n✅ 模拟数据清理完成！');
    
  } catch (error) {
    console.error('❌ 清理模拟数据失败:', error.message);
  }
}

// 运行清理
cleanMockData();
