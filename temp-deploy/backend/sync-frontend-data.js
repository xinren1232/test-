/**
 * 前端数据同步脚本 - 将数据库数据同步到前端localStorage格式
 */
import mysql from 'mysql2/promise';
import fs from 'fs';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function syncDataToFrontend() {
  let connection;
  
  try {
    console.log('🔄 开始同步数据库数据到前端格式...');
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取库存数据
    console.log('📦 获取库存数据...');
    const [inventoryRows] = await connection.execute(`
      SELECT 
        id,
        material_code as materialCode,
        material_name as materialName,
        supplier_name as supplier,
        quantity,
        storage_location as factory,
        status,
        batch_code as batchCode,
        inbound_time as inspectionDate
      FROM inventory 
      ORDER BY created_at DESC
    `);
    
    // 2. 获取测试数据
    console.log('🧪 获取测试数据...');
    const [testRows] = await connection.execute(`
      SELECT
        id,
        material_code as materialCode,
        material_name as materialName,
        supplier_name as supplier,
        test_result as testResult,
        defect_desc as defectPhenomena,
        test_date as testDate,
        project_id as projectName,
        baseline_id as baselineName,
        test_item,
        conclusion
      FROM lab_tests
      ORDER BY created_at DESC
    `);
    
    // 3. 获取生产数据
    console.log('🏭 获取生产数据...');
    const [productionRows] = await connection.execute(`
      SELECT 
        id,
        material_code as materialCode,
        material_name as materialName,
        supplier_name as supplier,
        factory,
        online_date as onlineDate,
        use_time as useTime,
        defect_rate as defectRate,
        project,
        workshop as baselineId
      FROM online_tracking 
      ORDER BY created_at DESC
    `);
    
    // 4. 生成批次数据（基于现有数据）
    console.log('📋 生成批次数据...');
    const batchData = [];
    const batchCodes = [...new Set([
      ...inventoryRows.map(row => row.batchCode),
      ...testRows.map(row => row.materialCode),
      ...productionRows.map(row => row.materialCode)
    ])].filter(Boolean);
    
    batchCodes.forEach((batchCode, index) => {
      batchData.push({
        id: `BATCH_${index + 1}`,
        batchCode: batchCode,
        materialName: inventoryRows.find(row => row.batchCode === batchCode)?.materialName || '未知物料',
        supplier: inventoryRows.find(row => row.batchCode === batchCode)?.supplier || '未知供应商',
        factory: inventoryRows.find(row => row.batchCode === batchCode)?.factory || '未知工厂',
        status: inventoryRows.find(row => row.batchCode === batchCode)?.status || '正常',
        createDate: new Date().toISOString()
      });
    });
    
    console.log(`📊 数据统计:`);
    console.log(`   库存数据: ${inventoryRows.length} 条`);
    console.log(`   测试数据: ${testRows.length} 条`);
    console.log(`   生产数据: ${productionRows.length} 条`);
    console.log(`   批次数据: ${batchData.length} 条`);
    
    // 5. 生成前端数据同步脚本
    const syncScript = `
// 自动生成的数据同步脚本 - ${new Date().toISOString()}
(function() {
  console.log('🔄 开始同步数据库数据到localStorage...');
  
  // 库存数据
  const inventoryData = ${JSON.stringify(inventoryRows, null, 2)};
  
  // 测试数据
  const testData = ${JSON.stringify(testRows, null, 2)};
  
  // 生产数据
  const productionData = ${JSON.stringify(productionRows, null, 2)};
  
  // 批次数据
  const batchData = ${JSON.stringify(batchData, null, 2)};
  
  // 同步到localStorage - 使用多个键名确保兼容性
  try {
    // 库存数据
    localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
    localStorage.setItem('unified_inventory_data', JSON.stringify(inventoryData));
    localStorage.setItem('inventory_data', JSON.stringify(inventoryData));
    
    // 测试数据
    localStorage.setItem('testData', JSON.stringify(testData));
    localStorage.setItem('unified_lab_data', JSON.stringify(testData));
    localStorage.setItem('lab_data', JSON.stringify(testData));
    localStorage.setItem('lab_test_data', JSON.stringify(testData));
    
    // 生产数据
    localStorage.setItem('productionData', JSON.stringify(productionData));
    localStorage.setItem('unified_factory_data', JSON.stringify(productionData));
    localStorage.setItem('factory_data', JSON.stringify(productionData));
    localStorage.setItem('online_data', JSON.stringify(productionData));
    
    // 批次数据
    localStorage.setItem('batchData', JSON.stringify(batchData));
    localStorage.setItem('batch_data', JSON.stringify(batchData));
    
    console.log('✅ 数据同步完成!');
    console.log(\`📊 同步统计: 库存\${inventoryData.length}条, 测试\${testData.length}条, 生产\${productionData.length}条, 批次\${batchData.length}条\`);
    
    // 显示成功消息
    if (window.ElMessage) {
      window.ElMessage.success('数据同步完成！');
    } else {
      alert('数据同步完成！');
    }
    
  } catch (error) {
    console.error('❌ 数据同步失败:', error);
    if (window.ElMessage) {
      window.ElMessage.error('数据同步失败: ' + error.message);
    } else {
      alert('数据同步失败: ' + error.message);
    }
  }
})();
`;
    
    // 6. 保存同步脚本到前端public目录
    const scriptPath = './sync-data-auto.js';
    fs.writeFileSync(scriptPath, syncScript);

    // 同时保存到前端public目录
    try {
      const frontendPath = '../ai-inspection-dashboard/public/sync-data-auto.js';
      fs.writeFileSync(frontendPath, syncScript);
      console.log('✅ 前端脚本已保存:', frontendPath);
    } catch (error) {
      console.log('⚠️ 保存前端脚本失败，但本地脚本已生成');
    }
    
    console.log('✅ 数据同步脚本已生成:', scriptPath);
    console.log('💡 请在浏览器控制台中运行以下命令来同步数据:');
    console.log('   const script = document.createElement("script");');
    console.log('   script.src = "/sync-data-auto.js";');
    console.log('   document.head.appendChild(script);');
    
  } catch (error) {
    console.error('❌ 数据同步失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行同步
syncDataToFrontend();
