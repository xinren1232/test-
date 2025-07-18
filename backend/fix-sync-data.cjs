// 修复数据同步问题，重新生成正确的测试数据
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 生成测试数据
function generateTestData() {
  const suppliers = ['聚龙', '欣冠', '广正', 'BOE', '天马', '华星', '盛泰', '天实', '深奥'];
  const materials = ['电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头', '电池', '充电器'];
  const factories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
  const statuses = ['normal', 'risk', 'frozen'];
  
  // 生成库存数据
  const inventoryData = [];
  for (let i = 1; i <= 50; i++) {
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const factory = factories[Math.floor(Math.random() * factories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    inventoryData.push({
      id: `INV_${String(i).padStart(3, '0')}`,
      batch_code: `BATCH_${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      material_code: `MAT_${String(i).padStart(4, '0')}`,
      material_name: material,
      material_type: material,
      supplier_name: supplier,
      quantity: Math.floor(Math.random() * 1000) + 10,
      inbound_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      storage_location: `${factory}-仓库${Math.floor(Math.random() * 5) + 1}`,
      status: status,
      risk_level: status === 'risk' ? 'high' : 'low',
      inspector: '质检员',
      notes: `${material}库存记录`
    });
  }
  
  // 生成检验数据
  const labData = [];
  for (let i = 1; i <= 30; i++) {
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const results = ['合格', '不合格', 'pass', 'fail'];
    const result = results[Math.floor(Math.random() * results.length)];
    
    labData.push({
      id: `LAB_${String(i).padStart(3, '0')}`,
      test_id: `TEST_${String(i).padStart(4, '0')}`,
      batch_code: `BATCH_${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      material_code: `MAT_${String(i).padStart(4, '0')}`,
      material_name: material,
      supplier_name: supplier,
      test_date: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      test_item: `${material}质量检验`,
      test_result: result,
      conclusion: result === '合格' || result === 'pass' ? '检验合格' : '检验不合格',
      defect_desc: result === '合格' || result === 'pass' ? '' : '外观缺陷',
      tester: '检验员',
      reviewer: '审核员'
    });
  }
  
  // 生成生产数据
  const productionData = [];
  for (let i = 1; i <= 40; i++) {
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const factory = factories[Math.floor(Math.random() * factories.length)];
    
    productionData.push({
      id: `PROD_${String(i).padStart(3, '0')}`,
      batch_code: `BATCH_${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      material_code: `MAT_${String(i).padStart(4, '0')}`,
      material_name: material,
      supplier_name: supplier,
      online_date: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      use_time: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      factory: factory,
      workshop: `车间${Math.floor(Math.random() * 3) + 1}`,
      line: `产线${Math.floor(Math.random() * 5) + 1}`,
      project: `项目${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      defect_rate: Math.random() * 0.1,
      exception_count: Math.floor(Math.random() * 10),
      operator: '操作员',
      inspection_date: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    });
  }
  
  return { inventoryData, labData, productionData };
}

async function fixSyncData() {
  let connection;
  
  try {
    console.log('🔧 修复数据同步问题...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 清空现有数据
    console.log('\n🗑️ 清空现有数据...');
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM lab_tests');
    await connection.execute('DELETE FROM online_tracking');
    await connection.execute('DELETE FROM frontend_data_sync');
    console.log('✅ 现有数据已清空');
    
    // 2. 生成新的测试数据
    console.log('\n📊 生成新的测试数据...');
    const { inventoryData, labData, productionData } = generateTestData();
    console.log(`生成数据: 库存${inventoryData.length}条, 检验${labData.length}条, 生产${productionData.length}条`);
    
    // 3. 插入库存数据
    console.log('\n📦 插入库存数据...');
    for (const item of inventoryData) {
      await connection.execute(`
        INSERT INTO inventory (
          id, batch_code, material_code, material_name, material_type,
          supplier_name, quantity, inbound_time, storage_location,
          status, risk_level, inspector, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        item.id, item.batch_code, item.material_code, item.material_name, item.material_type,
        item.supplier_name, item.quantity, item.inbound_time, item.storage_location,
        item.status, item.risk_level, item.inspector, item.notes
      ]);
    }
    console.log(`✅ 库存数据插入完成: ${inventoryData.length} 条`);
    
    // 4. 插入检验数据
    console.log('\n🧪 插入检验数据...');
    for (const item of labData) {
      await connection.execute(`
        INSERT INTO lab_tests (
          id, test_id, batch_code, material_code, material_name, supplier_name,
          test_date, test_item, test_result, conclusion, defect_desc, tester, reviewer, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        item.id, item.test_id, item.batch_code, item.material_code, item.material_name, item.supplier_name,
        item.test_date, item.test_item, item.test_result, item.conclusion, item.defect_desc, item.tester, item.reviewer
      ]);
    }
    console.log(`✅ 检验数据插入完成: ${labData.length} 条`);
    
    // 5. 插入生产数据
    console.log('\n🏭 插入生产数据...');
    for (const item of productionData) {
      await connection.execute(`
        INSERT INTO online_tracking (
          id, batch_code, material_code, material_name, supplier_name,
          online_date, use_time, factory, workshop, line, project,
          defect_rate, exception_count, operator, inspection_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        item.id, item.batch_code, item.material_code, item.material_name, item.supplier_name,
        item.online_date, item.use_time, item.factory, item.workshop, item.line, item.project,
        item.defect_rate, item.exception_count, item.operator, item.inspection_date
      ]);
    }
    console.log(`✅ 生产数据插入完成: ${productionData.length} 条`);
    
    // 6. 更新frontend_data_sync表
    console.log('\n🔄 更新frontend_data_sync表...');
    
    // 插入库存同步记录
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, record_count, sync_source, created_at, updated_at)
      VALUES ('inventory', ?, ?, 'system_generated', NOW(), NOW())
    `, [JSON.stringify(inventoryData), inventoryData.length]);
    
    // 插入检验同步记录
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, record_count, sync_source, created_at, updated_at)
      VALUES ('inspection', ?, ?, 'system_generated', NOW(), NOW())
    `, [JSON.stringify(labData), labData.length]);
    
    // 插入生产同步记录
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, record_count, sync_source, created_at, updated_at)
      VALUES ('production', ?, ?, 'system_generated', NOW(), NOW())
    `, [JSON.stringify(productionData), productionData.length]);
    
    console.log('✅ frontend_data_sync表更新完成');
    
    // 7. 验证数据
    console.log('\n✅ 验证数据:');
    const [invCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [labCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [prodCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log(`库存数据: ${invCount[0].count} 条`);
    console.log(`检验数据: ${labCount[0].count} 条`);
    console.log(`生产数据: ${prodCount[0].count} 条`);
    
    console.log('\n🎉 数据修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixSyncData();
