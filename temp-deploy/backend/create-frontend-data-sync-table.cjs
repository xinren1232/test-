// 创建前端数据同步表
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function createFrontendDataSyncTable() {
  let connection;
  try {
    console.log('🔧 创建前端数据同步表...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 创建前端数据同步表
    console.log('1. 创建frontend_data_sync表:');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS frontend_data_sync (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data_type VARCHAR(50) NOT NULL COMMENT '数据类型: inventory, inspection, production',
        data_content JSON NOT NULL COMMENT '数据内容',
        record_count INT DEFAULT 0 COMMENT '记录数量',
        sync_source VARCHAR(100) DEFAULT 'generated' COMMENT '同步来源',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_data_type (data_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='前端数据同步表'
    `);
    
    console.log('✅ frontend_data_sync表创建成功');
    
    // 2. 生成示例数据
    console.log('\n2. 生成示例数据:');
    
    // 库存数据
    const inventoryData = [
      {
        id: 'INV_001',
        factory: '重庆工厂',
        warehouse: '重庆库存',
        materialCode: 'CS-广1083',
        materialName: '电容',
        supplier: '广正',
        batchCode: '105281',
        quantity: 294,
        status: '正常',
        inspectionDate: '2025-08-26',
        shelfLife: '2025-12-26',
        remark: '-'
      },
      {
        id: 'INV_002',
        factory: '深圳工厂',
        warehouse: '深圳库存',
        materialCode: 'CS-B-第2236',
        materialName: '电容',
        supplier: '黑龙',
        batchCode: '411013',
        quantity: 1500,
        status: '风险',
        inspectionDate: '2025-06-15',
        shelfLife: '2025-11-15',
        remark: '需要重点关注'
      },
      {
        id: 'INV_003',
        factory: '东莞工厂',
        warehouse: '东莞库存',
        materialCode: 'OLED-聚龙-001',
        materialName: 'OLED显示屏',
        supplier: '聚龙光电',
        batchCode: 'JL20250115',
        quantity: 150,
        status: '正常',
        inspectionDate: '2025-01-15',
        shelfLife: '2025-07-15',
        remark: '高端显示屏'
      },
      {
        id: 'INV_004',
        factory: '苏州工厂',
        warehouse: '苏州库存',
        materialCode: 'IC-BOE-8719',
        materialName: '触控IC芯片',
        supplier: 'BOE科技',
        batchCode: 'BOE20250117',
        quantity: 500,
        status: '正常',
        inspectionDate: '2025-01-17',
        shelfLife: '2025-12-17',
        remark: '触控芯片'
      },
      {
        id: 'INV_005',
        factory: '武汉工厂',
        warehouse: '武汉库存',
        materialCode: 'CAM-华星-48MP',
        materialName: '摄像头模组',
        supplier: '华星光电',
        batchCode: 'HX20250118',
        quantity: 80,
        status: '正常',
        inspectionDate: '2025-01-18',
        shelfLife: '2025-06-18',
        remark: '48MP高清摄像头'
      }
    ];
    
    // 检验数据
    const inspectionData = [
      {
        id: 'TEST_001',
        materialCode: 'CS-广1083',
        materialName: '电容',
        supplier: '广正',
        batchCode: '105281',
        testResult: '合格',
        defectPhenomena: '无',
        testDate: '2025-08-26',
        projectName: '项目A',
        baselineName: '基线1.0',
        conclusion: '质量良好'
      },
      {
        id: 'TEST_002',
        materialCode: 'OLED-聚龙-001',
        materialName: 'OLED显示屏',
        supplier: '聚龙光电',
        batchCode: 'JL20250115',
        testResult: '合格',
        defectPhenomena: '无',
        testDate: '2025-01-15',
        projectName: '项目B',
        baselineName: '基线2.0',
        conclusion: '显示效果优秀'
      },
      {
        id: 'TEST_003',
        materialCode: 'IC-BOE-8719',
        materialName: '触控IC芯片',
        supplier: 'BOE科技',
        batchCode: 'BOE20250117',
        testResult: '不合格',
        defectPhenomena: '响应延迟',
        testDate: '2025-01-17',
        projectName: '项目C',
        baselineName: '基线1.5',
        conclusion: '需要返工'
      }
    ];
    
    // 生产数据
    const productionData = [
      {
        id: 'PROD_001',
        materialCode: 'CS-广1083',
        materialName: '电容',
        supplier: '广正',
        batchNo: '105281',
        factory: '重庆工厂',
        useTime: '2025-08-27',
        defectRate: 0.02,
        projectId: '项目A',
        baselineId: '基线1.0'
      },
      {
        id: 'PROD_002',
        materialCode: 'OLED-聚龙-001',
        materialName: 'OLED显示屏',
        supplier: '聚龙光电',
        batchNo: 'JL20250115',
        factory: '东莞工厂',
        useTime: '2025-01-16',
        defectRate: 0.01,
        projectId: '项目B',
        baselineId: '基线2.0'
      },
      {
        id: 'PROD_003',
        materialCode: 'IC-BOE-8719',
        materialName: '触控IC芯片',
        supplier: 'BOE科技',
        batchNo: 'BOE20250117',
        factory: '苏州工厂',
        useTime: '2025-01-18',
        defectRate: 0.08,
        projectId: '项目C',
        baselineId: '基线1.5'
      }
    ];
    
    // 3. 插入数据到同步表
    console.log('\n3. 插入数据到同步表:');
    
    // 清空现有数据
    await connection.execute('DELETE FROM frontend_data_sync');
    
    // 插入库存数据
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, record_count, sync_source)
      VALUES ('inventory', ?, ?, 'generated')
    `, [JSON.stringify(inventoryData), inventoryData.length]);
    console.log(`✅ 插入库存数据: ${inventoryData.length} 条`);
    
    // 插入检验数据
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, record_count, sync_source)
      VALUES ('inspection', ?, ?, 'generated')
    `, [JSON.stringify(inspectionData), inspectionData.length]);
    console.log(`✅ 插入检验数据: ${inspectionData.length} 条`);
    
    // 插入生产数据
    await connection.execute(`
      INSERT INTO frontend_data_sync (data_type, data_content, record_count, sync_source)
      VALUES ('production', ?, ?, 'generated')
    `, [JSON.stringify(productionData), productionData.length]);
    console.log(`✅ 插入生产数据: ${productionData.length} 条`);
    
    // 4. 验证数据
    console.log('\n4. 验证数据:');
    const [records] = await connection.execute(`
      SELECT data_type, record_count, created_at 
      FROM frontend_data_sync 
      ORDER BY created_at DESC
    `);
    
    for (const record of records) {
      console.log(`  ✅ ${record.data_type}: ${record.record_count} 条数据 (${record.created_at})`);
    }
    
    console.log('\n🎉 前端数据同步表创建并初始化完成！');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createFrontendDataSyncTable();
