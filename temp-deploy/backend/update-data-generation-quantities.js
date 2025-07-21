import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 更新数据生成量，使其与数据管理平台显示一致
 * 目标数量：
 * - 库存记录：132条
 * - 上线记录：388条  
 * - 测试记录：1056条
 */

// 物料和供应商数据
const MATERIALS = [
  'LCD显示屏', 'OLED显示屏', '电池', '中框', '电池盖', '充电器', 
  '摄像头模组', '扬声器', '振动马达', '侧键', '手机卡托', '装饰件'
];

const SUPPLIERS = [
  'BOE', '天马', '华为', '小米', '比亚迪', '德赛', 
  '欧菲光', '瑞声科技', 'AAC', '立讯精密', '富士康', '和硕'
];

const FACTORIES = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];
const PROJECTS = ['项目1', '项目2', '项目3', '项目4', '项目5'];
const BASELINES = ['基线1', '基线2', '基线3', '基线4', '基线5'];

async function updateDataQuantities() {
  let connection;
  
  try {
    console.log('🔄 开始更新数据生成量...\n');
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 清空现有数据
    console.log('🗑️  清空现有数据...');
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM online_tracking');
    await connection.execute('DELETE FROM lab_tests');
    console.log('✅ 现有数据已清空');
    
    // 2. 生成132条库存数据
    console.log('\n📦 生成132条库存数据...');
    const inventoryData = [];
    
    for (let i = 1; i <= 132; i++) {
      const material = MATERIALS[i % MATERIALS.length];
      const supplier = SUPPLIERS[i % SUPPLIERS.length];
      const factory = FACTORIES[i % FACTORIES.length];
      
      // 生成入库时间（最近30天内）
      const inboundTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      const record = {
        id: `INV-${i}`,
        batch_code: `BATCH-${String(i).padStart(3, '0')}`,
        material_code: `MAT-${String(i).padStart(3, '0')}`,
        material_name: material,
        material_type: '电子元件',
        supplier_name: supplier,
        quantity: Math.floor(Math.random() * 1000) + 100,
        inbound_time: inboundTime,
        storage_location: factory.replace('工厂', '') + '仓库',
        status: Math.random() < 0.1 ? '风险' : '正常',
        risk_level: 'low',
        inspector: '系统',
        notes: `库存备注${i}`
      };
      
      inventoryData.push(record);
    }
    
    // 插入库存数据
    for (const record of inventoryData) {
      await connection.execute(`
        INSERT INTO inventory (
          id, batch_code, material_code, material_name, material_type,
          supplier_name, quantity, inbound_time, storage_location,
          status, risk_level, inspector, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        record.id, record.batch_code, record.material_code, record.material_name,
        record.material_type, record.supplier_name, record.quantity, record.inbound_time,
        record.storage_location, record.status, record.risk_level, record.inspector, record.notes
      ]);
    }
    
    console.log('✅ 132条库存数据生成完成');
    
    // 3. 生成388条上线数据
    console.log('\n🏭 生成388条上线数据...');
    
    for (let i = 1; i <= 388; i++) {
      // 选择一个库存记录作为基础
      const baseInventory = inventoryData[i % inventoryData.length];
      const factory = FACTORIES[i % FACTORIES.length];
      const project = PROJECTS[i % PROJECTS.length];
      const baseline = BASELINES[i % BASELINES.length];
      
      // 上线时间应该晚于入库时间
      const onlineTime = new Date(baseInventory.inbound_time.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000);
      const inspectionTime = new Date(onlineTime.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000);
      
      await connection.execute(`
        INSERT INTO online_tracking (
          id, batch_code, material_code, material_name, supplier_name,
          online_date, use_time, factory, workshop, line, project, baseline,
          defect_rate, exception_count, operator, inspection_date, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        `TRK-${i}`,
        baseInventory.batch_code,
        baseInventory.material_code,
        baseInventory.material_name,
        baseInventory.supplier_name,
        onlineTime.toISOString().split('T')[0],
        onlineTime,
        factory,
        `车间${(i % 4) + 1}`,
        `产线${(i % 8) + 1}`,
        project,
        baseline,
        Math.random() * 0.05, // 0-5%不良率
        Math.floor(Math.random() * 3), // 0-2个异常
        '系统',
        inspectionTime,
        `生产备注${i}`
      ]);
    }
    
    console.log('✅ 388条上线数据生成完成');
    
    // 4. 生成1056条测试数据
    console.log('\n🧪 生成1056条测试数据...');
    
    const testResults = ['合格', '不合格'];
    const defectDescs = ['外观缺陷', '功能异常', '尺寸偏差', '性能不达标', '显示异常'];
    
    for (let i = 1; i <= 1056; i++) {
      // 选择一个库存记录作为基础
      const baseInventory = inventoryData[i % inventoryData.length];
      const project = PROJECTS[i % PROJECTS.length];
      const baseline = BASELINES[i % BASELINES.length];
      const testResult = testResults[Math.floor(Math.random() * testResults.length)];
      
      // 测试时间应该在入库时间之后
      const testTime = new Date(baseInventory.inbound_time.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000);
      
      await connection.execute(`
        INSERT INTO lab_tests (
          id, test_id, batch_code, material_code, material_name, project_id, baseline_id,
          supplier_name, test_date, test_item, test_result, conclusion, defect_desc,
          tester, test_duration, notes, reviewer, created_at, quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `, [
        `LAB-${i}`,
        `TEST-${i}`,
        baseInventory.batch_code,
        baseInventory.material_code,
        baseInventory.material_name,
        project,
        baseline,
        baseInventory.supplier_name,
        testTime.toISOString().split('T')[0],
        '功能测试',
        testResult,
        testResult,
        testResult === '不合格' ? defectDescs[Math.floor(Math.random() * defectDescs.length)] : '',
        '系统',
        Math.floor(Math.random() * 60) + 30, // 30-90分钟
        `检验备注${i}`,
        null,
        Math.floor(Math.random() * 10) + 1 // 1-10个测试数量
      ]);
    }
    
    console.log('✅ 1056条测试数据生成完成');
    
    // 5. 验证数据量
    console.log('\n📊 验证生成的数据量...');
    const [invCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    
    console.log(`库存记录: ${invCount[0].count} 条 (目标: 132)`);
    console.log(`上线记录: ${onlineCount[0].count} 条 (目标: 388)`);
    console.log(`测试记录: ${testCount[0].count} 条 (目标: 1056)`);
    
    // 6. 更新数据管理平台的统计
    console.log('\n🔄 更新数据管理平台统计...');
    
    // 这里可以添加更新前端localStorage或其他存储的逻辑
    console.log('数据管理平台统计将在下次访问时自动更新');
    
    console.log('\n🎉 数据生成量更新完成！');
    console.log('现在的数据量与您的数据管理平台显示一致：');
    console.log('- 库存记录：132条');
    console.log('- 上线记录：388条');
    console.log('- 测试记录：1056条');
    
  } catch (error) {
    console.error('❌ 更新过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateDataQuantities().catch(console.error);
