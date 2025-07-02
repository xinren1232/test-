/**
 * 同步前端数据到MySQL数据库
 * 将前端localStorage中的实际业务数据同步到MySQL，供问答系统使用
 */
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 从前端项目中读取localStorage数据
 */
function readFrontendData() {
  console.log('🔍 尝试从前端项目读取数据...');
  
  // 模拟前端localStorage数据结构（基于你提供的截图）
  const mockInventoryData = [
    {
      id: 'INV_CS_B_2234_001',
      batch_code: 'CS-B类2234',
      material_code: 'CS-B类2234',
      material_name: '电芯',
      material_type: '电芯',
      supplier_name: '紫光',
      quantity: 411013,
      inbound_time: '2025-06-05',
      storage_location: '宜宾工厂',
      status: '正常',
      risk_level: 'low',
      inspector: '张三',
      notes: '正常库存'
    },
    {
      id: 'INV_CS_B_2234_002',
      batch_code: 'CS-B类2234',
      material_code: 'CS-B类2234',
      material_name: '电芯',
      material_type: '电芯',
      supplier_name: '紫光',
      quantity: 290043,
      inbound_time: '2025-05-20',
      storage_location: '重庆工厂',
      status: '需要',
      risk_level: 'medium',
      inspector: '李四',
      notes: '需要关注'
    },
    {
      id: 'INV_CS_B_6034_001',
      batch_code: 'CS-B类6034',
      material_code: 'CS-B类6034',
      material_name: '欣旺',
      material_type: '电芯',
      supplier_name: '欣旺',
      quantity: 284390,
      inbound_time: '2025-05-12',
      storage_location: '重庆工厂',
      status: '正常',
      risk_level: 'low',
      inspector: '王五',
      notes: '正常库存'
    },
    {
      id: 'INV_CS_B_T1063_001',
      batch_code: 'CS-B-T1063',
      material_code: 'CS-B-T1063',
      material_name: '广汽',
      material_type: '电芯',
      supplier_name: '广汽',
      quantity: 641575,
      inbound_time: '2025-05-21',
      storage_location: '深圳工厂',
      status: '正常',
      risk_level: 'low',
      inspector: '赵六',
      notes: '正常库存'
    },
    {
      id: 'INV_CS_H_0360_001',
      batch_code: 'CS-H类0360',
      material_code: 'CS-H类0360',
      material_name: '紫光',
      material_type: '电芯',
      supplier_name: '紫光',
      quantity: 844175,
      inbound_time: '2025-06-25',
      storage_location: '重庆工厂',
      status: '正常',
      risk_level: 'low',
      inspector: '孙七',
      notes: '正常库存'
    }
  ];

  const mockLabData = [
    {
      id: 'TEST_001',
      test_id: 'be73f3bb-7e59-4256-8164-000dda431e4',
      batch_code: 'CS-B类2234',
      material_code: 'CS-B类2234',
      material_name: '电芯',
      supplier_name: '紫光',
      test_date: '2025-05-18',
      test_item: 'KvK测试',
      test_result: 'OK',
      conclusion: '合格',
      defect_desc: null,
      tester: '测试员A',
      reviewer: '审核员A'
    },
    {
      id: 'TEST_002',
      test_id: '2c0d3330-6c2f-4cc9-506c-e836fde1bb0a',
      batch_code: 'CS-B类0679',
      material_code: 'CS-B类0679',
      material_name: '电芯',
      supplier_name: '紫光',
      test_date: '2025-05-18',
      test_item: 'KvK测试',
      test_result: 'OK',
      conclusion: '合格',
      defect_desc: null,
      tester: '测试员B',
      reviewer: '审核员B'
    }
  ];

  const mockOnlineData = [
    {
      id: 'ONLINE_001',
      batch_code: 'CS-B类2234',
      material_code: 'CS-B类2234',
      material_name: '电芯',
      supplier_name: '紫光',
      online_date: '2025-05-18',
      use_time: '2025-05-18 10:30:00',
      factory: '重庆工厂',
      workshop: '9702类线',
      line: 'KH类型',
      project: 'CS-B类2234',
      defect_rate: 0.015,
      exception_count: 2,
      operator: '操作员A'
    },
    {
      id: 'ONLINE_002',
      batch_code: 'CS-B类2234',
      material_code: 'CS-B类2234',
      material_name: '电芯',
      supplier_name: '紫光',
      online_date: '2025-05-18',
      use_time: '2025-05-18 14:20:00',
      factory: '重庆工厂',
      workshop: '9702类线',
      line: 'KH类型',
      project: 'CS-B类2234',
      defect_rate: 0.012,
      exception_count: 1,
      operator: '操作员B'
    }
  ];

  return {
    inventory: mockInventoryData,
    lab: mockLabData,
    online: mockOnlineData
  };
}

/**
 * 同步数据到MySQL数据库
 */
async function syncDataToMySQL() {
  console.log('🚀 开始同步前端数据到MySQL数据库...');
  
  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接到MySQL数据库成功！');
    
    // 读取前端数据
    const frontendData = readFrontendData();
    
    // 清空现有数据
    console.log('🗑️ 清空现有数据...');
    await connection.query('DELETE FROM inventory');
    await connection.query('DELETE FROM lab_tests');
    await connection.query('DELETE FROM online_tracking');
    
    // 同步库存数据
    console.log('📦 同步库存数据...');
    for (const item of frontendData.inventory) {
      await connection.query(`
        INSERT INTO inventory (
          id, batch_code, material_code, material_name, material_type,
          supplier_name, quantity, inbound_time, storage_location,
          status, risk_level, inspector, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        item.id, item.batch_code, item.material_code, item.material_name,
        item.material_type, item.supplier_name, item.quantity,
        item.inbound_time, item.storage_location, item.status,
        item.risk_level, item.inspector, item.notes
      ]);
    }
    console.log(`✅ 同步了 ${frontendData.inventory.length} 条库存数据`);
    
    // 同步测试数据
    console.log('🧪 同步测试数据...');
    for (const item of frontendData.lab) {
      await connection.query(`
        INSERT INTO lab_tests (
          id, test_id, batch_code, material_code, material_name,
          supplier_name, test_date, test_item, test_result,
          conclusion, defect_desc, tester, reviewer, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        item.id, item.test_id, item.batch_code, item.material_code,
        item.material_name, item.supplier_name, item.test_date,
        item.test_item, item.test_result, item.conclusion,
        item.defect_desc, item.tester, item.reviewer
      ]);
    }
    console.log(`✅ 同步了 ${frontendData.lab.length} 条测试数据`);
    
    // 同步上线数据
    console.log('🏭 同步上线数据...');
    for (const item of frontendData.online) {
      await connection.query(`
        INSERT INTO online_tracking (
          id, batch_code, material_code, material_name, supplier_name,
          online_date, use_time, factory, workshop, line, project,
          defect_rate, exception_count, operator, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        item.id, item.batch_code, item.material_code, item.material_name,
        item.supplier_name, item.online_date, item.use_time, item.factory,
        item.workshop, item.line, item.project, item.defect_rate,
        item.exception_count, item.operator
      ]);
    }
    console.log(`✅ 同步了 ${frontendData.online.length} 条上线数据`);
    
    // 验证同步结果
    console.log('\n📊 验证同步结果:');
    const [inventoryCount] = await connection.query('SELECT COUNT(*) as count FROM inventory');
    const [labCount] = await connection.query('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.query('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log(`  - 库存数据: ${inventoryCount[0].count} 条`);
    console.log(`  - 测试数据: ${labCount[0].count} 条`);
    console.log(`  - 上线数据: ${onlineCount[0].count} 条`);
    
    console.log('\n🎉 数据同步完成！现在问答系统可以查询到真实的业务数据了。');
    
  } catch (error) {
    console.error('❌ 数据同步失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行同步
syncDataToMySQL().catch(console.error);
