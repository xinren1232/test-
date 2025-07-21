import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 修复数据生成逻辑，实现正确的数据量和关联关系
 * 
 * 正确的数据生成逻辑：
 * - 库存：132条（基础数据）
 * - 测试记录：每个批次3条测试记录 = 132 × 3 = 396条
 * - 上线记录：每个批次8条上线记录 = 132 × 8 = 1056条
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

async function fixCorrectDataGeneration() {
  let connection;
  
  try {
    console.log('🔧 修复数据生成逻辑，实现正确的数据量和关联关系...\n');
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查当前数据量
    console.log('📊 检查当前数据量...');
    const [invCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    
    console.log(`当前数据量:`);
    console.log(`  库存记录: ${invCount[0].count} 条`);
    console.log(`  上线记录: ${onlineCount[0].count} 条`);
    console.log(`  测试记录: ${testCount[0].count} 条`);
    
    console.log(`\n目标数据量:`);
    console.log(`  库存记录: 132 条`);
    console.log(`  测试记录: 396 条 (132 × 3)`);
    console.log(`  上线记录: 1056 条 (132 × 8)`);
    
    // 2. 清空现有数据
    console.log('\n🗑️  清空现有数据...');
    await connection.execute('DELETE FROM lab_tests');
    await connection.execute('DELETE FROM online_tracking');
    await connection.execute('DELETE FROM inventory');
    console.log('✅ 现有数据已清空');
    
    // 3. 生成132条库存数据（基础数据）
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
      
      // 插入库存数据
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
    
    // 4. 为每个批次生成3条测试记录（总计396条）
    console.log('\n🧪 为每个批次生成3条测试记录...');
    
    const testResults = ['合格', '不合格'];
    const defectDescs = ['外观缺陷', '功能异常', '尺寸偏差', '性能不达标', '显示异常'];
    let testRecordId = 1;
    
    for (const inventory of inventoryData) {
      // 为每个库存批次生成3条测试记录
      for (let testIndex = 1; testIndex <= 3; testIndex++) {
        const project = PROJECTS[testRecordId % PROJECTS.length];
        const baseline = BASELINES[testRecordId % BASELINES.length];
        const testResult = testResults[Math.floor(Math.random() * testResults.length)];
        
        // 测试时间应该在入库时间之后
        const testTime = new Date(inventory.inbound_time.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);
        
        await connection.execute(`
          INSERT INTO lab_tests (
            id, test_id, batch_code, material_code, material_name, project_id, baseline_id,
            supplier_name, test_date, test_item, test_result, conclusion, defect_desc,
            tester, test_duration, notes, reviewer, created_at, quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `, [
          `LAB-${testRecordId}`,
          `TEST-${testRecordId}`,
          inventory.batch_code,
          inventory.material_code,
          inventory.material_name,
          project,
          baseline,
          inventory.supplier_name,
          testTime.toISOString().split('T')[0],
          `功能测试${testIndex}`,
          testResult,
          testResult,
          testResult === '不合格' ? defectDescs[Math.floor(Math.random() * defectDescs.length)] : '',
          '系统',
          Math.floor(Math.random() * 60) + 30, // 30-90分钟
          `检验备注${testRecordId}`,
          null,
          Math.floor(Math.random() * 10) + 1 // 1-10个测试数量
        ]);
        
        testRecordId++;
      }
    }
    
    console.log('✅ 396条测试数据生成完成 (132批次 × 3条/批次)');
    
    // 5. 为每个批次生成8条上线记录（总计1056条）
    console.log('\n🏭 为每个批次生成8条上线记录...');
    
    let onlineRecordId = 1;
    
    for (const inventory of inventoryData) {
      // 为每个库存批次生成8条上线记录
      for (let onlineIndex = 1; onlineIndex <= 8; onlineIndex++) {
        const factory = FACTORIES[onlineRecordId % FACTORIES.length];
        const project = PROJECTS[onlineRecordId % PROJECTS.length];
        const baseline = BASELINES[onlineRecordId % BASELINES.length];
        
        // 上线时间应该晚于入库时间
        const onlineTime = new Date(inventory.inbound_time.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000);
        const inspectionTime = new Date(onlineTime.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000);
        
        await connection.execute(`
          INSERT INTO online_tracking (
            id, batch_code, material_code, material_name, supplier_name,
            online_date, use_time, factory, workshop, line, project, baseline,
            defect_rate, exception_count, operator, inspection_date, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          `TRK-${onlineRecordId}`,
          inventory.batch_code,
          inventory.material_code,
          inventory.material_name,
          inventory.supplier_name,
          onlineTime.toISOString().split('T')[0],
          onlineTime,
          factory,
          `车间${(onlineIndex % 4) + 1}`,
          `产线${onlineIndex}`,
          project,
          baseline,
          Math.random() * 0.05, // 0-5%不良率
          Math.floor(Math.random() * 3), // 0-2个异常
          '系统',
          inspectionTime,
          `生产备注${onlineRecordId}`
        ]);
        
        onlineRecordId++;
      }
    }
    
    console.log('✅ 1056条上线数据生成完成 (132批次 × 8条/批次)');
    
    // 6. 验证最终数据量
    console.log('\n📊 验证最终数据量...');
    const [finalInvCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [finalOnlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    const [finalTestCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    
    console.log(`最终数据量:`);
    console.log(`  库存记录: ${finalInvCount[0].count} 条 (目标: 132) ${finalInvCount[0].count === 132 ? '✅' : '❌'}`);
    console.log(`  测试记录: ${finalTestCount[0].count} 条 (目标: 396) ${finalTestCount[0].count === 396 ? '✅' : '❌'}`);
    console.log(`  上线记录: ${finalOnlineCount[0].count} 条 (目标: 1056) ${finalOnlineCount[0].count === 1056 ? '✅' : '❌'}`);
    
    // 7. 验证数据关联关系
    console.log('\n🔗 验证数据关联关系...');
    
    // 检查每个批次的测试记录数
    const [testCountPerBatch] = await connection.execute(`
      SELECT batch_code, COUNT(*) as test_count 
      FROM lab_tests 
      GROUP BY batch_code 
      HAVING COUNT(*) != 3
      LIMIT 5
    `);
    
    if (testCountPerBatch.length === 0) {
      console.log('✅ 每个批次都有3条测试记录');
    } else {
      console.log('❌ 发现批次测试记录数不正确:');
      testCountPerBatch.forEach(batch => {
        console.log(`  ${batch.batch_code}: ${batch.test_count} 条`);
      });
    }
    
    // 检查每个批次的上线记录数
    const [onlineCountPerBatch] = await connection.execute(`
      SELECT batch_code, COUNT(*) as online_count 
      FROM online_tracking 
      GROUP BY batch_code 
      HAVING COUNT(*) != 8
      LIMIT 5
    `);
    
    if (onlineCountPerBatch.length === 0) {
      console.log('✅ 每个批次都有8条上线记录');
    } else {
      console.log('❌ 发现批次上线记录数不正确:');
      onlineCountPerBatch.forEach(batch => {
        console.log(`  ${batch.batch_code}: ${batch.online_count} 条`);
      });
    }
    
    console.log('\n🎉 数据生成修复完成！');
    console.log('现在的数据结构符合要求：');
    console.log('- 132个批次的库存数据');
    console.log('- 每个批次3条测试记录，总计396条');
    console.log('- 每个批次8条上线记录，总计1056条');
    console.log('- 所有数据通过batch_code关联');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixCorrectDataGeneration().catch(console.error);
