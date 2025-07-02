import initializeDatabase from './src/models/index.js';

async function populateBasicData() {
  console.log('🔍 开始填充基础测试数据...');
  
  try {
    // 初始化数据库
    const db = await initializeDatabase();
    console.log('✅ 数据库初始化成功！');

    // 清空现有数据
    await db.OnlineTracking.destroy({ where: {}, truncate: true });
    await db.LabTest.destroy({ where: {}, truncate: true });
    await db.Inventory.destroy({ where: {}, truncate: true });
    console.log('✅ 清空旧数据完成！');

    // 插入库存测试数据
    const inventoryData = [
      {
        id: 'INV001',
        batch_code: 'BATCH001',
        material_code: 'M12345',
        material_name: '电阻器',
        material_type: '电子元件',
        supplier_name: '欣旺达',
        quantity: 1000,
        inbound_time: new Date('2024-01-15'),
        storage_location: '仓库A-01',
        status: '正常',
        risk_level: 'low',
        inspector: '张三',
        notes: '正常入库'
      },
      {
        id: 'INV002',
        batch_code: 'BATCH002',
        material_code: 'M67890',
        material_name: '电容器',
        material_type: '电子元件',
        supplier_name: '比亚迪',
        quantity: 500,
        inbound_time: new Date('2024-01-16'),
        storage_location: '仓库A-02',
        status: '风险',
        risk_level: 'high',
        inspector: '李四',
        notes: '需要重点关注'
      }
    ];

    await db.Inventory.bulkCreate(inventoryData);
    console.log('✅ 库存数据插入完成！');

    // 插入测试结果数据
    const labTestData = [
      {
        id: 'TEST001',
        test_id: 'TEST001',
        batch_code: 'BATCH001',
        material_code: 'M12345',
        material_name: '电阻器',
        supplier_name: '欣旺达',
        test_date: new Date('2024-01-15'),
        test_item: '电阻值测试',
        test_result: 'OK',
        conclusion: '合格',
        defect_desc: null,
        tester: '王五',
        reviewer: '赵六'
      },
      {
        id: 'TEST002',
        test_id: 'TEST002',
        batch_code: 'BATCH002',
        material_code: 'M67890',
        material_name: '电容器',
        supplier_name: '比亚迪',
        test_date: new Date('2024-01-16'),
        test_item: '容量测试',
        test_result: 'NG',
        conclusion: '不合格',
        defect_desc: '容量偏差超标',
        tester: '王五',
        reviewer: '赵六'
      }
    ];

    await db.LabTest.bulkCreate(labTestData);
    console.log('✅ 测试数据插入完成！');

    // 插入产线跟踪数据
    const onlineTrackingData = [
      {
        id: 'TRACK001',
        batch_code: 'BATCH001',
        material_code: 'M12345',
        material_name: '电阻器',
        supplier_name: '欣旺达',
        online_date: new Date('2024-01-17'),
        use_time: new Date('2024-01-17'),
        factory: '深圳工厂',
        workshop: '车间1',
        line: '产线A',
        project: 'P001',
        defect_rate: 0.02,
        exception_count: 1,
        operator: '操作员A'
      }
    ];

    await db.OnlineTracking.bulkCreate(onlineTrackingData);
    console.log('✅ 产线跟踪数据插入完成！');

    await db.sequelize.close();
    console.log('🎉 基础测试数据填充完成！');

  } catch (error) {
    console.error('❌ 数据填充失败:', error);
    process.exit(1);
  }
}

populateBasicData();
