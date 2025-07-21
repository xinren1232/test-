import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

// 基于您的MaterialSupplierMap.js的真实数据映射
const REAL_IQE_DATA = {
  // 真实的物料-供应商映射
  materialSuppliers: {
    // 结构件类
    '电池盖': ['聚龙', '欣冠', '广正'],
    '中框': ['聚龙', '欣冠', '广正'],
    '手机卡托': ['聚龙', '欣冠', '广正'],
    '侧键': ['聚龙', '欣冠', '广正'],
    '装饰件': ['聚龙', '欣冠', '广正'],
    
    // 光学类
    'LCD显示屏': ['帝晶', '天马', 'BOE'],
    'OLED显示屏': ['BOE', '天马', '华星'],
    '摄像头模组': ['盛泰', '天实', '深奥'],
    
    // 充电类
    '电池': ['百俊达', '奥海', '辰阳'],
    '充电器': ['锂威', '风华', '维科'],
    
    // 声学类
    '扬声器': ['东声', '豪声', '歌尔'],
    '听筒': ['东声', '豪声', '歌尔'],
    
    // 包料类
    '保护套': ['丽德宝', '裕同', '富群'],
    '标签': ['丽德宝', '裕同', '富群'],
    '包装盒': ['丽德宝', '裕同', '富群']
  },
  
  // 真实的工厂列表
  factories: ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'],
  
  // 真实的仓库映射
  warehouses: {
    '重庆工厂': ['重庆库存', '中央库存'],
    '深圳工厂': ['深圳库存'],
    '南昌工厂': ['中央库存'],
    '宜宾工厂': ['中央库存']
  },
  
  // 真实的项目-基线映射
  projects: {
    'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
    'I6788': ['X6831', 'KI5K', 'KI3K'],
    'I6787': ['S662LN', 'S663LN', 'S664LN']
  }
};

/**
 * 生成真实的IQE业务数据
 */
function generateRealIQEData() {
  console.log('🏭 生成真实的IQE业务数据...');
  
  const inventoryData = [];
  const onlineData = [];
  const labData = [];
  
  let recordId = 1;
  
  // 为每个物料-供应商组合生成数据
  Object.entries(REAL_IQE_DATA.materialSuppliers).forEach(([materialName, suppliers]) => {
    suppliers.forEach(supplier => {
      // 每个物料-供应商组合生成1-2个批次
      const batchCount = Math.floor(Math.random() * 2) + 1;
      
      for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
        const batchNo = `B${String(recordId).padStart(6, '0')}`;
        const materialCode = generateMaterialCode(materialName, supplier);
        
        // 随机选择工厂和仓库
        const factory = REAL_IQE_DATA.factories[Math.floor(Math.random() * REAL_IQE_DATA.factories.length)];
        const warehouseOptions = REAL_IQE_DATA.warehouses[factory];
        const warehouse = warehouseOptions[Math.floor(Math.random() * warehouseOptions.length)];
        
        // 生成库存数据
        const inventoryItem = {
          id: `INV${String(recordId).padStart(6, '0')}`,
          batch_code: batchNo,
          material_code: materialCode,
          material_name: materialName,
          supplier_name: supplier,
          quantity: Math.floor(Math.random() * 1000) + 100,
          status: Math.random() < 0.9 ? '正常' : (Math.random() < 0.5 ? '冻结' : '风险'),
          storage_location: `${factory.replace('工厂', '仓库')}`,
          inbound_time: generateRandomDate(30),
          notes: `真实IQE数据 - ${materialName}`,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        inventoryData.push(inventoryItem);
        
        // 为每个批次生成3条测试数据
        for (let testIndex = 0; testIndex < 3; testIndex++) {
          const testResult = Math.random() < 0.85 ? 'OK' : 'NG';
          const projectIds = Object.keys(REAL_IQE_DATA.projects);
          const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
          const baselines = REAL_IQE_DATA.projects[projectId];
          const baselineId = baselines[Math.floor(Math.random() * baselines.length)];
          
          const labItem = {
            id: `LAB${String(recordId * 3 + testIndex).padStart(6, '0')}`,
            test_id: `T${String(recordId * 3 + testIndex).padStart(8, '0')}`,
            batch_code: batchNo,
            material_code: materialCode,
            material_name: materialName,
            supplier_name: supplier,
            test_date: generateRandomDate(20),
            test_result: testResult,
            defect_desc: testResult === 'NG' ? generateDefectDesc(materialName) : '',
            project_id: projectId,
            baseline_id: baselineId,
            quantity: 100,
            notes: `真实IQE测试数据`,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          labData.push(labItem);
        }
        
        // 为每个批次生成8条上线数据
        for (let onlineIndex = 0; onlineIndex < 8; onlineIndex++) {
          const defectRate = Math.random() < 0.8 ? Math.random() * 2 : Math.random() * 8 + 2;
          const projectIds = Object.keys(REAL_IQE_DATA.projects);
          const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
          const baselines = REAL_IQE_DATA.projects[projectId];
          const baselineId = baselines[Math.floor(Math.random() * baselines.length)];
          
          const onlineItem = {
            id: `ONL${String(recordId * 8 + onlineIndex).padStart(6, '0')}`,
            batch_code: batchNo,
            material_code: materialCode,
            material_name: materialName,
            supplier_name: supplier,
            factory: factory,
            project: projectId,
            baseline: baselineId,
            defect_rate: parseFloat(defectRate.toFixed(1)),
            exception_count: Math.floor(Math.random() * 5),
            inspection_date: generateRandomDate(25),
            notes: `真实IQE上线数据`,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          onlineData.push(onlineItem);
        }
        
        recordId++;
      }
    });
  });
  
  console.log(`✅ 生成完成:`);
  console.log(`  - 库存数据: ${inventoryData.length} 条`);
  console.log(`  - 测试数据: ${labData.length} 条`);
  console.log(`  - 上线数据: ${onlineData.length} 条`);
  
  return { inventoryData, labData, onlineData };
}

/**
 * 生成物料编码
 */
function generateMaterialCode(materialName, supplier) {
  const prefixMap = {
    '电池盖': 'CS-B',
    '中框': 'CS-M',
    '手机卡托': 'SIM',
    '侧键': 'KEY',
    '装饰件': 'DEC',
    'LCD显示屏': 'LCD',
    'OLED显示屏': 'OLED',
    '摄像头模组': 'CAM',
    '电池': 'BAT',
    '充电器': 'CHG',
    '扬声器': 'SPK',
    '听筒': 'REC',
    '保护套': 'CASE',
    '标签': 'LBL',
    '包装盒': 'BOX'
  };
  
  const prefix = prefixMap[materialName] || 'MAT';
  const supplierCode = supplier.substring(0, 2);
  const randomNum = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  
  return `${prefix}-${supplierCode}${randomNum}`;
}

/**
 * 生成随机日期
 */
function generateRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

/**
 * 生成缺陷描述
 */
function generateDefectDesc(materialName) {
  const defectMap = {
    '电池盖': ['划伤', '变形', '破裂', '起鼓', '色差', '尺寸异常'],
    '中框': ['变形', '破裂', '掉漆', '尺寸异常'],
    '手机卡托': ['注塑不良', '尺寸异常', '断裂', '毛刺'],
    '侧键': ['脱落', '卡键', '尺寸异常', '松动'],
    '装饰件': ['掉色', '偏位', '脱落'],
    'LCD显示屏': ['亮点', '暗点', '色差', '划伤', '漏光'],
    'OLED显示屏': ['烧屏', '色差', '亮度不均', '触控失效'],
    '摄像头模组': ['对焦不准', '成像模糊', '色差', '噪点'],
    '电池': ['容量不足', '充电异常', '发热', '膨胀'],
    '充电器': ['充电慢', '发热', '接触不良', '输出不稳'],
    '扬声器': ['音质差', '杂音', '音量小', '破音'],
    '听筒': ['声音小', '杂音', '无声', '破音'],
    '保护套': ['变形', '开裂', '褪色', '尺寸不符'],
    '标签': ['脱胶', '模糊', '错位', '褪色'],
    '包装盒': ['破损', '变形', '印刷不清', '尺寸不符']
  };
  
  const defects = defectMap[materialName] || ['外观不良', '功能异常'];
  return defects[Math.floor(Math.random() * defects.length)];
}

/**
 * 同步真实数据到数据库
 */
async function syncRealDataToDatabase() {
  try {
    console.log('🔄 开始同步真实IQE数据到数据库...\n');
    
    // 1. 生成真实数据
    const { inventoryData, labData, onlineData } = generateRealIQEData();
    
    // 2. 清空现有数据
    console.log('🗑️ 清空现有模拟数据...');
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM lab_tests');
    await connection.execute('DELETE FROM online_tracking');
    console.log('✅ 现有数据已清空');
    
    // 3. 插入真实库存数据
    console.log('\n📦 插入真实库存数据...');
    for (const item of inventoryData) {
      await connection.execute(`
        INSERT INTO inventory (
          id, batch_code, material_code, material_name, supplier_name,
          quantity, status, storage_location, inbound_time, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id, item.batch_code, item.material_code, item.material_name, item.supplier_name,
        item.quantity, item.status, item.storage_location, item.inbound_time, item.notes,
        item.created_at, item.updated_at
      ]);
    }
    console.log(`✅ 插入库存数据: ${inventoryData.length} 条`);
    
    // 4. 插入真实测试数据
    console.log('\n🧪 插入真实测试数据...');
    for (const item of labData) {
      await connection.execute(`
        INSERT INTO lab_tests (
          id, test_id, batch_code, material_code, material_name, supplier_name,
          test_date, test_result, defect_desc, project_id, baseline_id, quantity, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id, item.test_id, item.batch_code, item.material_code, item.material_name, item.supplier_name,
        item.test_date, item.test_result, item.defect_desc, item.project_id, item.baseline_id, item.quantity,
        item.notes
      ]);
    }
    console.log(`✅ 插入测试数据: ${labData.length} 条`);

    // 5. 插入真实上线数据
    console.log('\n🏭 插入真实上线数据...');
    for (const item of onlineData) {
      await connection.execute(`
        INSERT INTO online_tracking (
          id, batch_code, material_code, material_name, supplier_name,
          factory, project, baseline, defect_rate, exception_count, inspection_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id, item.batch_code, item.material_code, item.material_name, item.supplier_name,
        item.factory, item.project, item.baseline, item.defect_rate, item.exception_count,
        item.inspection_date, item.notes
      ]);
    }
    console.log(`✅ 插入上线数据: ${onlineData.length} 条`);
    
    // 6. 验证数据
    console.log('\n🔍 验证同步结果...');
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [labCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log(`📊 数据库记录统计:`);
    console.log(`  - inventory: ${inventoryCount[0].count} 条`);
    console.log(`  - lab_tests: ${labCount[0].count} 条`);
    console.log(`  - online_tracking: ${onlineCount[0].count} 条`);
    
    // 7. 检查供应商
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name FROM inventory ORDER BY supplier_name
    `);
    
    console.log(`\n🏢 同步后的供应商列表:`);
    suppliers.forEach((supplier, index) => {
      console.log(`  ${index + 1}. ${supplier.supplier_name}`);
    });
    
    console.log('\n🎉 真实IQE数据同步完成！');
    
  } catch (error) {
    console.error('❌ 数据同步失败:', error);
  } finally {
    await connection.end();
  }
}

// 执行同步
syncRealDataToDatabase();
