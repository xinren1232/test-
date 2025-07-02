/**
 * 插入符合IQE业务场景的测试数据
 * 按照你的设计：每个批次有3次测试记录和8次生产记录
 */
import mysql from 'mysql2/promise';

async function insertTestData() {
  console.log('🔄 开始插入IQE业务测试数据...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 连接到数据库成功！');
    
    // 清空现有数据
    await connection.query('DELETE FROM online_tracking');
    await connection.query('DELETE FROM lab_tests');
    await connection.query('DELETE FROM inventory');
    
    // 定义基础数据
    const suppliers = ['欣旺达', '比亚迪', '宁德时代', '富士康', '立讯精密'];
    const materialTypes = ['电子元件', '电池组件', '连接器', '传感器', '控制器'];
    const factories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
    const projects = ['P001', 'P002', 'P003', 'P004', 'P005'];
    
    // 生成5个批次的数据
    const batches = [
      { batch_code: 'BATCH001', material_code: 'M12345', material_name: '电阻器', supplier: '欣旺达', type: '电子元件' },
      { batch_code: 'BATCH002', material_code: 'M67890', material_name: '电容器', supplier: '比亚迪', type: '电子元件' },
      { batch_code: 'BATCH003', material_code: 'M11111', material_name: '传感器', supplier: '宁德时代', type: '传感器' },
      { batch_code: 'BATCH004', material_code: 'M22222', material_name: '连接器', supplier: '富士康', type: '连接器' },
      { batch_code: 'BATCH005', material_code: 'M33333', material_name: '控制器', supplier: '立讯精密', type: '控制器' }
    ];
    
    let inventoryId = 1;
    let testId = 1;
    let trackingId = 1;
    
    for (const batch of batches) {
      console.log(`📦 处理批次: ${batch.batch_code}`);
      
      // 1. 插入库存数据
      const riskLevel = Math.random() > 0.7 ? 'high' : (Math.random() > 0.5 ? 'medium' : 'low');
      const status = riskLevel === 'high' ? '风险' : '正常';
      
      await connection.query(`
        INSERT INTO inventory (id, batch_code, material_code, material_name, material_type, supplier_name, 
                              quantity, inbound_time, storage_location, status, risk_level, inspector, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `INV${String(inventoryId).padStart(3, '0')}`,
        batch.batch_code,
        batch.material_code,
        batch.material_name,
        batch.type,
        batch.supplier,
        Math.floor(Math.random() * 1000) + 100,
        new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 最近30天内
        `仓库A-${String(inventoryId).padStart(2, '0')}`,
        status,
        riskLevel,
        ['张三', '李四', '王五'][Math.floor(Math.random() * 3)],
        riskLevel === 'high' ? '需要重点关注' : '正常入库'
      ]);
      inventoryId++;
      
      // 2. 插入3次测试记录
      for (let i = 0; i < 3; i++) {
        const testResult = Math.random() > 0.8 ? 'NG' : 'OK';
        const conclusion = testResult === 'OK' ? '合格' : '不合格';
        const defectDesc = testResult === 'NG' ? 
          ['容量偏差超标', '电阻值异常', '外观不良', '性能测试异常'][Math.floor(Math.random() * 4)] : null;
        
        await connection.query(`
          INSERT INTO lab_tests (id, test_id, batch_code, material_code, material_name, supplier_name,
                                test_date, test_item, test_result, conclusion, defect_desc, tester, reviewer)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `TEST${String(testId).padStart(3, '0')}`,
          `TEST${String(testId).padStart(3, '0')}`,
          batch.batch_code,
          batch.material_code,
          batch.material_name,
          batch.supplier,
          new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000), // 最近25天内
          ['电阻值测试', '容量测试', '外观检查', '性能测试', '安规测试'][Math.floor(Math.random() * 5)],
          testResult,
          conclusion,
          defectDesc,
          ['王五', '赵六', '孙七'][Math.floor(Math.random() * 3)],
          ['赵六', '孙七', '周八'][Math.floor(Math.random() * 3)]
        ]);
        testId++;
      }
      
      // 3. 插入8次生产记录
      for (let i = 0; i < 8; i++) {
        const defectRate = Math.random() * 0.1; // 0-10%的不良率
        const exceptionCount = Math.floor(Math.random() * 5);
        
        await connection.query(`
          INSERT INTO online_tracking (id, batch_code, material_code, material_name, supplier_name,
                                     online_date, use_time, factory, workshop, line, project, 
                                     defect_rate, exception_count, operator)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `TRACK${String(trackingId).padStart(3, '0')}`,
          batch.batch_code,
          batch.material_code,
          batch.material_name,
          batch.supplier,
          new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000), // 最近20天内
          new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
          factories[Math.floor(Math.random() * factories.length)],
          `车间${Math.floor(Math.random() * 3) + 1}`,
          `产线${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`, // 产线A, B, C
          projects[Math.floor(Math.random() * projects.length)],
          defectRate,
          exceptionCount,
          ['操作员A', '操作员B', '操作员C', '操作员D'][Math.floor(Math.random() * 4)]
        ]);
        trackingId++;
      }
    }
    
    // 统计插入的数据
    const [inventoryCount] = await connection.query('SELECT COUNT(*) as count FROM inventory');
    const [testCount] = await connection.query('SELECT COUNT(*) as count FROM lab_tests');
    const [trackingCount] = await connection.query('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log('📊 数据插入统计:');
    console.log(`  - 库存记录: ${inventoryCount[0].count} 条`);
    console.log(`  - 测试记录: ${testCount[0].count} 条`);
    console.log(`  - 生产记录: ${trackingCount[0].count} 条`);
    
    await connection.end();
    console.log('🎉 IQE业务测试数据插入完成！');
    
  } catch (error) {
    console.error('❌ 测试数据插入失败:', error);
    process.exit(1);
  }
}

insertTestData();
