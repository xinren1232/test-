// 生成更多的测试数据
const mysql = require('mysql2/promise');

async function generateMoreData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🚀 生成更多测试数据...\n');
    
    // 扩展的数据配置
    const factories = ['深圳工厂', '宜宾工厂', '南昌工厂', '重庆工厂', '苏州工厂', '成都工厂'];
    const warehouses = ['仓库1', '仓库2', '仓库3', '仓库4', '仓库5', '仓库6'];
    
    const materials = [
      { name: 'LCD显示屏', type: 'LCD显示屏', code_prefix: 'LCD' },
      { name: 'OLED显示屏', type: 'OLED显示屏', code_prefix: 'OLED' },
      { name: '摄像头', type: '摄像头', code_prefix: 'CAM' },
      { name: '电池', type: '电池', code_prefix: 'BAT' },
      { name: '电池盖', type: '电池盖', code_prefix: 'COVER' },
      { name: '中框', type: '中框', code_prefix: 'FRAME' },
      { name: '侧键', type: '侧键', code_prefix: 'KEY' },
      { name: '手机卡托', type: '手机卡托', code_prefix: 'SIM' },
      { name: '装饰件', type: '装饰件', code_prefix: 'DEC' },
      { name: '充电器', type: '充电器', code_prefix: 'CHG' },
      { name: '喇叭', type: '喇叭', code_prefix: 'SPK' },
      { name: '听筒', type: '听筒', code_prefix: 'REC' },
      { name: '保护套', type: '保护套', code_prefix: 'CASE' },
      { name: '数据线', type: '数据线', code_prefix: 'CABLE' },
      { name: '耳机', type: '耳机', code_prefix: 'EAR' }
    ];
    
    const suppliers = [
      '天马', 'BOE', '华星', '京东方', '维信诺',
      '欣冠', '广正', '盛泰', '聚龙', '深奥',
      '比亚迪', '宁德时代', '德赛', '欣旺达', '飞毛腿',
      '瑞声', '歌尔', '东声', '立讯', '富士康',
      '丽德宝', '怡同', '富群', '安费诺', '莫仕'
    ];
    
    const statuses = ['normal', 'risk', 'frozen', 'low_stock'];
    
    // 清空现有数据
    console.log('🗑️ 清空现有数据...');
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM lab_tests');
    await connection.execute('DELETE FROM online_tracking');
    
    // 生成库存数据 (200条)
    console.log('📦 生成库存数据...');
    for (let i = 1; i <= 200; i++) {
      const factory = factories[Math.floor(Math.random() * factories.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const quantity = Math.floor(Math.random() * 1000) + 50;
      const materialCode = `${material.code_prefix}_${String(i).padStart(4, '0')}`;
      const batchCode = `BATCH_${Date.now()}_${i}`;
      const inventoryId = `INV_${Date.now()}_${i}`;

      // 随机生成过去30天内的时间
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const inboundTime = new Date();
      inboundTime.setDate(inboundTime.getDate() - daysAgo);
      inboundTime.setHours(inboundTime.getHours() - hoursAgo);
      inboundTime.setMinutes(inboundTime.getMinutes() - minutesAgo);

      await connection.execute(`
        INSERT INTO inventory (
          id, storage_location, material_code, material_name, material_type,
          supplier_name, batch_code, quantity, status, inbound_time, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        inventoryId,
        `${factory}-${warehouse}`,
        materialCode,
        material.name,
        material.type,
        supplier,
        batchCode,
        quantity,
        status,
        inboundTime,
        `${material.name}库存记录`
      ]);
    }
    
    // 生成检验数据 (150条)
    console.log('🔬 生成检验数据...');
    const testResults = ['合格', '不合格', '待复检', '免检'];
    const testItems = ['外观检验', '功能测试', '性能测试', '可靠性测试', '环境测试'];

    for (let i = 1; i <= 150; i++) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const testResult = testResults[Math.floor(Math.random() * testResults.length)];
      const testItem = testItems[Math.floor(Math.random() * testItems.length)];

      const materialCode = `${material.code_prefix}_${String(i).padStart(4, '0')}`;
      const batchCode = `BATCH_${Date.now()}_${i}`;
      const testId = `TEST_${String(i).padStart(6, '0')}`;
      const labTestId = `LAB_${Date.now()}_${i}`;

      // 随机生成过去60天内的时间
      const daysAgo = Math.floor(Math.random() * 60);
      const testDate = new Date();
      testDate.setDate(testDate.getDate() - daysAgo);

      const defectDesc = testResult === '不合格' ?
        ['外观划痕', '功能异常', '尺寸超差', '性能不达标'][Math.floor(Math.random() * 4)] : '';

      await connection.execute(`
        INSERT INTO lab_tests (
          id, test_id, test_date, material_code, material_name, supplier_name,
          batch_code, test_item, test_result, defect_desc, conclusion, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        labTestId,
        testId,
        testDate,
        materialCode,
        material.name,
        supplier,
        batchCode,
        testItem,
        testResult,
        defectDesc,
        testResult === '合格' ? '符合要求' : '需要改进'
      ]);
    }
    
    // 生成生产数据 (180条)
    console.log('🏭 生成生产数据...');
    const projects = ['项目A', '项目B', '项目C', '项目D', '项目E'];
    const workshops = ['车间1', '车间2', '车间3', '车间4'];
    const lines = ['产线1', '产线2', '产线3', '产线4', '产线5'];
    const operators = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];

    for (let i = 1; i <= 180; i++) {
      const factory = factories[Math.floor(Math.random() * factories.length)];
      const project = projects[Math.floor(Math.random() * projects.length)];
      const workshop = workshops[Math.floor(Math.random() * workshops.length)];
      const line = lines[Math.floor(Math.random() * lines.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const operator = operators[Math.floor(Math.random() * operators.length)];

      const materialCode = `${material.code_prefix}_${String(i).padStart(4, '0')}`;
      const batchCode = `BATCH_${Date.now()}_${i}`;
      const onlineTrackingId = `TRACK_${Date.now()}_${i}`;
      const defectRate = Math.random() * 0.05; // 0-5%的不良率
      const exceptionCount = Math.floor(Math.random() * 10);

      // 随机生成过去45天内的时间
      const daysAgo = Math.floor(Math.random() * 45);
      const onlineDate = new Date();
      onlineDate.setDate(onlineDate.getDate() - daysAgo);

      await connection.execute(`
        INSERT INTO online_tracking (
          id, factory, project, workshop, line, material_code, material_name,
          supplier_name, batch_code, defect_rate, exception_count,
          online_date, inspection_date, use_time, operator, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        onlineTrackingId,
        factory,
        project,
        workshop,
        line,
        materialCode,
        material.name,
        supplier,
        batchCode,
        defectRate,
        exceptionCount,
        onlineDate,
        onlineDate,
        onlineDate,
        operator
      ]);
    }
    
    // 统计生成的数据
    console.log('\n📊 数据生成完成统计:');
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [inspectionCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [productionCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log(`   库存数据: ${inventoryCount[0].count} 条`);
    console.log(`   检验数据: ${inspectionCount[0].count} 条`);
    console.log(`   生产数据: ${productionCount[0].count} 条`);
    
    console.log('\n🎯 数据生成完成！');
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
  } finally {
    await connection.end();
  }
}

generateMoreData();
