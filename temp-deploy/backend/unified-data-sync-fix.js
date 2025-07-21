/**
 * 统一数据同步修复方案
 * 确保前端数据能够正确同步到MySQL表中，供规则查询使用
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 字段映射：前端字段 -> 数据库字段
const FIELD_MAPPING = {
  inventory: {
    materialCode: 'material_code',
    materialName: 'material_name',
    supplier: 'supplier_name',
    quantity: 'quantity',
    status: 'status',
    inboundTime: 'inbound_time',
    factory: 'storage_location', // 前端factory映射到storage_location
    warehouse: 'storage_location',
    batchNo: 'batch_code',
    notes: 'notes'
  },
  inspection: {
    materialCode: 'material_code',
    materialName: 'material_name',
    supplier: 'supplier_name',
    test_id: 'test_id',
    test_date: 'test_date',
    project_id: 'project_id',
    baseline_id: 'baseline_id',
    test_result: 'test_result',
    defect_desc: 'defect_desc',
    quantity: 'quantity',
    notes: 'notes',
    batchNo: 'batch_code'
  },
  production: {
    materialCode: 'material_code',
    materialName: 'material_name',
    supplier: 'supplier_name',
    factory: 'factory',
    onlineDate: 'online_date',
    useTime: 'use_time',
    defectRate: 'defect_rate',
    project: 'project',
    baselineId: 'baseline',
    weeklyAbnormal: 'exception_count',
    batchNo: 'batch_code',
    notes: 'notes'
  }
};

async function unifiedDataSyncFix() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查当前数据状态
    console.log('\n=== 检查当前数据状态 ===');
    
    const [realDataStorage] = await connection.execute(`
      SELECT data_type, data_content 
      FROM real_data_storage 
      WHERE is_active = TRUE
    `);
    
    if (realDataStorage.length === 0) {
      console.log('❌ real_data_storage中没有数据，请先生成前端数据');
      return;
    }
    
    console.log(`找到${realDataStorage.length}种数据类型`);
    
    // 2. 清空目标表
    console.log('\n=== 清空目标表 ===');
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM online_tracking');
    await connection.execute('DELETE FROM lab_tests');
    console.log('✅ 目标表已清空');
    
    // 3. 同步数据到具体表
    console.log('\n=== 同步数据到具体表 ===');
    
    for (const row of realDataStorage) {
      const dataType = row.data_type;
      let dataContent;
      
      try {
        dataContent = JSON.parse(row.data_content);
      } catch (error) {
        console.log(`❌ 解析${dataType}数据失败:`, error.message);
        continue;
      }
      
      console.log(`\n处理${dataType}数据: ${dataContent.length}条记录`);
      
      if (dataType === 'inventory') {
        await syncInventoryData(connection, dataContent);
      } else if (dataType === 'inspection') {
        await syncInspectionData(connection, dataContent);
      } else if (dataType === 'production') {
        await syncProductionData(connection, dataContent);
      }
    }
    
    // 4. 验证同步结果
    console.log('\n=== 验证同步结果 ===');
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [trackingCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    const [testsCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    
    console.log(`inventory表: ${inventoryCount[0].count}条记录`);
    console.log(`online_tracking表: ${trackingCount[0].count}条记录`);
    console.log(`lab_tests表: ${testsCount[0].count}条记录`);
    
    // 5. 测试规则查询
    console.log('\n=== 测试规则查询 ===');
    await testRuleQueries(connection);
    
    console.log('\n🎉 统一数据同步修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 同步库存数据
async function syncInventoryData(connection, data) {
  const mapping = FIELD_MAPPING.inventory;
  
  for (const item of data) {
    const mappedData = {};
    
    // 映射字段
    for (const [frontendField, dbField] of Object.entries(mapping)) {
      if (item[frontendField] !== undefined) {
        mappedData[dbField] = item[frontendField];
      }
    }
    
    // 设置默认值
    mappedData.material_type = '电子元件';
    mappedData.risk_level = 'low';
    mappedData.inspector = '系统';
    
    try {
      await connection.execute(`
        INSERT INTO inventory (
          batch_code, material_code, material_name, material_type,
          supplier_name, quantity, inbound_time, storage_location,
          status, risk_level, inspector, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mappedData.batch_code || `BATCH-${Date.now()}`,
        mappedData.material_code,
        mappedData.material_name,
        mappedData.material_type,
        mappedData.supplier_name,
        mappedData.quantity || 0,
        mappedData.inbound_time || new Date().toISOString(),
        mappedData.storage_location || '默认仓库',
        mappedData.status || '正常',
        mappedData.risk_level,
        mappedData.inspector,
        mappedData.notes || ''
      ]);
    } catch (error) {
      console.log(`❌ 插入inventory记录失败:`, error.message);
    }
  }
  
  console.log(`✅ inventory数据同步完成: ${data.length}条`);
}

// 同步检验数据
async function syncInspectionData(connection, data) {
  const mapping = FIELD_MAPPING.inspection;
  
  for (const item of data) {
    const mappedData = {};
    
    // 映射字段
    for (const [frontendField, dbField] of Object.entries(mapping)) {
      if (item[frontendField] !== undefined) {
        mappedData[dbField] = item[frontendField];
      }
    }
    
    // 设置默认值
    mappedData.conclusion = mappedData.test_result || '合格';
    mappedData.tester = '系统';
    mappedData.test_duration = 30;
    
    try {
      await connection.execute(`
        INSERT INTO lab_tests (
          test_id, batch_code, material_code, material_name,
          project_id, baseline_id, supplier_name, test_date,
          test_item, test_result, conclusion, defect_desc,
          tester, test_duration, notes, quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mappedData.test_id || `TEST-${Date.now()}`,
        mappedData.batch_code || `BATCH-${Date.now()}`,
        mappedData.material_code,
        mappedData.material_name,
        mappedData.project_id || 'KI4K',
        mappedData.baseline_id || 'I6788',
        mappedData.supplier_name,
        mappedData.test_date || new Date().toISOString(),
        '外观检查',
        mappedData.test_result || '合格',
        mappedData.conclusion,
        mappedData.defect_desc || '',
        mappedData.tester,
        mappedData.test_duration,
        mappedData.notes || '',
        mappedData.quantity || 1
      ]);
    } catch (error) {
      console.log(`❌ 插入lab_tests记录失败:`, error.message);
    }
  }
  
  console.log(`✅ lab_tests数据同步完成: ${data.length}条`);
}

// 同步生产数据
async function syncProductionData(connection, data) {
  const mapping = FIELD_MAPPING.production;
  
  for (const item of data) {
    const mappedData = {};
    
    // 映射字段
    for (const [frontendField, dbField] of Object.entries(mapping)) {
      if (item[frontendField] !== undefined) {
        mappedData[dbField] = item[frontendField];
      }
    }
    
    // 设置默认值
    mappedData.workshop = '车间A';
    mappedData.line = '产线1';
    mappedData.operator = '系统';
    mappedData.inspection_date = new Date().toISOString();
    
    try {
      await connection.execute(`
        INSERT INTO online_tracking (
          batch_code, material_code, material_name, supplier_name,
          online_date, use_time, factory, workshop, line,
          project, baseline, defect_rate, exception_count,
          operator, inspection_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mappedData.batch_code || `BATCH-${Date.now()}`,
        mappedData.material_code,
        mappedData.material_name,
        mappedData.supplier_name,
        mappedData.online_date || new Date().toISOString(),
        mappedData.use_time || new Date().toISOString(),
        mappedData.factory || '深圳工厂',
        mappedData.workshop,
        mappedData.line,
        mappedData.project || 'KI4K',
        mappedData.baseline || 'I6788',
        mappedData.defect_rate || '0%',
        mappedData.exception_count || 0,
        mappedData.operator,
        mappedData.inspection_date,
        mappedData.notes || ''
      ]);
    } catch (error) {
      console.log(`❌ 插入online_tracking记录失败:`, error.message);
    }
  }
  
  console.log(`✅ online_tracking数据同步完成: ${data.length}条`);
}

// 测试规则查询
async function testRuleQueries(connection) {
  const testQueries = [
    {
      name: '库存查询测试',
      sql: 'SELECT material_code, material_name, supplier_name FROM inventory LIMIT 3'
    },
    {
      name: '检验查询测试',
      sql: 'SELECT material_code, material_name, test_result FROM lab_tests LIMIT 3'
    },
    {
      name: '生产查询测试',
      sql: 'SELECT material_code, material_name, factory FROM online_tracking LIMIT 3'
    }
  ];
  
  for (const query of testQueries) {
    try {
      const [results] = await connection.execute(query.sql);
      console.log(`✅ ${query.name}: 返回${results.length}条记录`);
      if (results.length > 0) {
        console.log(`  示例: ${results[0].material_name} (${results[0].material_code})`);
      }
    } catch (error) {
      console.log(`❌ ${query.name}失败: ${error.message}`);
    }
  }
}

// 运行修复
unifiedDataSyncFix().catch(console.error);
