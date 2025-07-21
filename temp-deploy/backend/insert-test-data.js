import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function insertTestData() {
  try {
    console.log('🔄 插入测试数据到数据库...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 插入库存数据
    console.log('📦 插入库存数据...');
    const inventoryData = [
      {
        id: 'INV001',
        batch_code: 'BATCH001',
        material_code: 'MAT001',
        material_name: '聚龙物料A',
        material_type: '原材料',
        supplier_name: '聚龙供应商A',
        quantity: 1500,
        inbound_time: '2024-01-15 10:30:00',
        storage_location: '深圳工厂-A仓库',
        status: '正常',
        risk_level: '低',
        inspector: '检验员张三',
        notes: '质量良好，符合标准'
      },
      {
        id: 'INV002',
        batch_code: 'BATCH002',
        material_code: 'MAT002',
        material_name: '聚龙物料B',
        material_type: '辅助材料',
        supplier_name: '聚龙供应商B',
        quantity: 800,
        inbound_time: '2024-01-20 14:15:00',
        storage_location: '深圳工厂-B仓库',
        status: '库存不足',
        risk_level: '中',
        inspector: '检验员李四',
        notes: '需要补充库存'
      },
      {
        id: 'INV003',
        batch_code: 'BATCH003',
        material_code: 'MAT003',
        material_name: '聚龙物料C',
        material_type: '包装材料',
        supplier_name: '聚龙供应商C',
        quantity: 2200,
        inbound_time: '2024-02-01 09:00:00',
        storage_location: '东莞工厂-C仓库',
        status: '正常',
        risk_level: '低',
        inspector: '检验员王五',
        notes: '包装完整，质量优良'
      },
      {
        id: 'INV004',
        batch_code: 'BATCH004',
        material_code: 'MAT004',
        material_name: '聚龙物料D',
        material_type: '原材料',
        supplier_name: '聚龙供应商A',
        quantity: 0,
        inbound_time: '2024-01-10 16:45:00',
        storage_location: '深圳工厂-A仓库',
        status: '缺货',
        risk_level: '高',
        inspector: '检验员张三',
        notes: '急需补货'
      },
      {
        id: 'INV005',
        batch_code: 'BATCH005',
        material_code: 'MAT005',
        material_name: '聚龙物料E',
        material_type: '辅助材料',
        supplier_name: '聚龙供应商D',
        quantity: 1200,
        inbound_time: '2024-02-10 11:20:00',
        storage_location: '东莞工厂-D仓库',
        status: '正常',
        risk_level: '低',
        inspector: '检验员赵六',
        notes: '质量稳定'
      }
    ];

    for (const item of inventoryData) {
      await connection.execute(`
        INSERT INTO inventory (id, batch_code, material_code, material_name, material_type, supplier_name, quantity, inbound_time, storage_location, status, risk_level, inspector, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW()
      `, [item.id, item.batch_code, item.material_code, item.material_name, item.material_type, item.supplier_name, item.quantity, item.inbound_time, item.storage_location, item.status, item.risk_level, item.inspector, item.notes]);
    }
    console.log(`✅ 插入了 ${inventoryData.length} 条库存数据`);

    // 2. 插入实验室测试数据
    console.log('🔬 插入实验室测试数据...');
    const labTestData = [
      {
        id: 'LAB001',
        test_id: 'TEST001',
        batch_code: 'BATCH001',
        material_code: 'MAT001',
        material_name: '聚龙物料A',
        supplier_name: '聚龙供应商A',
        test_date: '2024-01-16',
        test_item: '外观检验',
        test_result: '合格',
        conclusion: '外观良好，无缺陷',
        defect_desc: '',
        tester: '测试员甲',
        reviewer: '审核员乙'
      },
      {
        id: 'LAB002',
        test_id: 'TEST002',
        batch_code: 'BATCH002',
        material_code: 'MAT002',
        material_name: '聚龙物料B',
        supplier_name: '聚龙供应商B',
        test_date: '2024-01-21',
        test_item: '尺寸检验',
        test_result: '不合格',
        conclusion: '尺寸超出公差范围',
        defect_desc: '长度超出标准0.5mm',
        tester: '测试员丙',
        reviewer: '审核员丁'
      },
      {
        id: 'LAB003',
        test_id: 'TEST003',
        batch_code: 'BATCH003',
        material_code: 'MAT003',
        material_name: '聚龙物料C',
        supplier_name: '聚龙供应商C',
        test_date: '2024-02-02',
        test_item: '强度测试',
        test_result: '合格',
        conclusion: '强度符合要求',
        defect_desc: '',
        tester: '测试员戊',
        reviewer: '审核员己'
      }
    ];

    for (const test of labTestData) {
      await connection.execute(`
        INSERT INTO lab_tests (id, test_id, batch_code, material_code, material_name, supplier_name, test_date, test_item, test_result, conclusion, defect_desc, tester, reviewer, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE created_at = created_at
      `, [test.id, test.test_id, test.batch_code, test.material_code, test.material_name, test.supplier_name, test.test_date, test.test_item, test.test_result, test.conclusion, test.defect_desc, test.tester, test.reviewer]);
    }
    console.log(`✅ 插入了 ${labTestData.length} 条实验室测试数据`);

    // 3. 插入在线跟踪数据
    console.log('📊 插入在线跟踪数据...');
    const onlineTrackingData = [
      {
        id: 'OT001',
        batch_code: 'BATCH001',
        material_code: 'MAT001',
        material_name: '聚龙物料A',
        supplier_name: '聚龙供应商A',
        online_date: '2024-01-17',
        use_time: '2024-01-17 08:30:00',
        factory: '深圳工厂',
        workshop: '车间A',
        line: '产线1',
        project: '项目Alpha',
        defect_rate: 0.0025,
        exception_count: 1,
        operator: '操作员小明',
        inspection_date: '2024-01-17 16:00:00'
      },
      {
        id: 'OT002',
        batch_code: 'BATCH002',
        material_code: 'MAT002',
        material_name: '聚龙物料B',
        supplier_name: '聚龙供应商B',
        online_date: '2024-01-22',
        use_time: '2024-01-22 10:15:00',
        factory: '深圳工厂',
        workshop: '车间B',
        line: '产线2',
        project: '项目Beta',
        defect_rate: 0.0080,
        exception_count: 3,
        operator: '操作员小红',
        inspection_date: '2024-01-22 18:30:00'
      },
      {
        id: 'OT003',
        batch_code: 'BATCH003',
        material_code: 'MAT003',
        material_name: '聚龙物料C',
        supplier_name: '聚龙供应商C',
        online_date: '2024-02-03',
        use_time: '2024-02-03 14:20:00',
        factory: '东莞工厂',
        workshop: '车间C',
        line: '产线3',
        project: '项目Gamma',
        defect_rate: 0.0015,
        exception_count: 0,
        operator: '操作员小李',
        inspection_date: '2024-02-03 20:00:00'
      }
    ];

    for (const tracking of onlineTrackingData) {
      await connection.execute(`
        INSERT INTO online_tracking (id, batch_code, material_code, material_name, supplier_name, online_date, use_time, factory, workshop, line, project, defect_rate, exception_count, operator, inspection_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE created_at = created_at
      `, [tracking.id, tracking.batch_code, tracking.material_code, tracking.material_name, tracking.supplier_name, tracking.online_date, tracking.use_time, tracking.factory, tracking.workshop, tracking.line, tracking.project, tracking.defect_rate, tracking.exception_count, tracking.operator, tracking.inspection_date]);
    }
    console.log(`✅ 插入了 ${onlineTrackingData.length} 条在线跟踪数据`);

    await connection.end();
    console.log('\n🎉 测试数据插入完成！');
    
  } catch (error) {
    console.error('❌ 插入测试数据失败:', error.message);
  }
}

insertTestData().catch(console.error);
