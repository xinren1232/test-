/**
 * 最终数据同步脚本
 * 将real_data_storage中的JSON对象数据同步到MySQL表
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 日期格式转换函数
function formatDateForMySQL(isoString) {
  if (!isoString) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
}

function formatDateOnlyForMySQL(isoString) {
  if (!isoString) return new Date().toISOString().slice(0, 10);
  return new Date(isoString).toISOString().slice(0, 10);
}

async function finalDataSync() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 获取数据
    console.log('\n=== 获取存储的数据 ===');
    const [rows] = await connection.execute(`
      SELECT data_type, data_content 
      FROM real_data_storage 
      WHERE is_active = TRUE
    `);
    
    console.log(`找到${rows.length}条数据记录`);
    
    // 2. 清空目标表
    console.log('\n=== 清空目标表 ===');
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM online_tracking');
    await connection.execute('DELETE FROM lab_tests');
    console.log('✅ 目标表已清空');
    
    // 3. 同步数据
    console.log('\n=== 同步数据 ===');
    for (const row of rows) {
      const dataType = row.data_type;
      const data = row.data_content; // 直接使用对象，不需要JSON.parse
      
      console.log(`\n处理${dataType}数据: ${data.length}条记录`);
      
      if (dataType === 'inventory') {
        await syncInventory(connection, data);
      } else if (dataType === 'inspection') {
        await syncInspection(connection, data);
      } else if (dataType === 'production') {
        await syncProduction(connection, data);
      }
    }
    
    // 4. 验证结果
    console.log('\n=== 验证同步结果 ===');
    await verifyResults(connection);
    
    // 5. 测试规则查询
    console.log('\n=== 测试规则查询 ===');
    await testRules(connection);
    
    console.log('\n🎉 最终数据同步完成！');
    console.log('✅ 现在可以使用智能问答功能查询真实数据了');
    
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function syncInventory(connection, data) {
  let successCount = 0;
  
  for (const item of data) {
    try {
      await connection.execute(`
        INSERT INTO inventory (
          id, batch_code, material_code, material_name, material_type,
          supplier_name, quantity, inbound_time, storage_location,
          status, risk_level, inspector, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `INV-${item.id}`,
        item.batchNo || `BATCH-${item.id}`,
        item.materialCode,
        item.materialName,
        '电子元件',
        item.supplier,
        item.quantity || 0,
        formatDateForMySQL(item.inboundTime),
        item.storageLocation || `${item.factory}-仓库A`,
        item.status || '正常',
        'low',
        '系统',
        item.notes || ''
      ]);
      successCount++;
    } catch (error) {
      console.log(`❌ 插入inventory记录失败: ${error.message}`);
    }
  }
  
  console.log(`✅ inventory表同步完成: ${successCount}/${data.length}条记录`);
}

async function syncInspection(connection, data) {
  let successCount = 0;
  
  for (const item of data) {
    try {
      await connection.execute(`
        INSERT INTO lab_tests (
          id, test_id, batch_code, material_code, material_name,
          project_id, baseline_id, supplier_name, test_date,
          test_item, test_result, conclusion, defect_desc,
          tester, test_duration, notes, quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `LAB-${item.id}`,
        `TEST-${item.id}`,
        `BATCH-${item.id}`,
        item.materialCode,
        item.materialName,
        item.projectName || 'KI4K',
        item.baselineName || 'I6788',
        item.supplier,
        formatDateOnlyForMySQL(item.testDate),
        item.testItem || '外观检查',
        item.testResult || '合格',
        item.conclusion || item.testResult || '合格',
        item.defectPhenomena || '',
        '系统',
        30,
        item.notes || '',
        1
      ]);
      successCount++;
    } catch (error) {
      console.log(`❌ 插入lab_tests记录失败: ${error.message}`);
    }
  }
  
  console.log(`✅ lab_tests表同步完成: ${successCount}/${data.length}条记录`);
}

async function syncProduction(connection, data) {
  let successCount = 0;
  
  for (const item of data) {
    try {
      // 处理defectRate字段
      let defectRate = 0;
      if (item.defectRate) {
        defectRate = parseFloat(item.defectRate.toString().replace('%', '')) / 100;
      }
      
      await connection.execute(`
        INSERT INTO online_tracking (
          id, batch_code, material_code, material_name, supplier_name,
          online_date, use_time, factory, workshop, line,
          project, baseline, defect_rate, exception_count,
          operator, inspection_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `TRK-${item.id}`,
        `BATCH-${item.id}`,
        item.materialCode,
        item.materialName,
        item.supplier,
        formatDateOnlyForMySQL(item.onlineDate),
        formatDateForMySQL(item.useTime),
        item.factory || '深圳工厂',
        '车间A',
        '产线1',
        item.project || 'KI4K',
        item.baselineId || 'I6788',
        defectRate,
        item.weeklyAbnormal === '有异常' ? 1 : 0,
        '系统',
        formatDateForMySQL(new Date().toISOString()),
        item.notes || ''
      ]);
      successCount++;
    } catch (error) {
      console.log(`❌ 插入online_tracking记录失败: ${error.message}`);
    }
  }
  
  console.log(`✅ online_tracking表同步完成: ${successCount}/${data.length}条记录`);
}

async function verifyResults(connection) {
  const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
  const [trackingCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
  const [testsCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
  
  console.log(`📊 同步结果统计:`);
  console.log(`  inventory表: ${inventoryCount[0].count}条记录`);
  console.log(`  online_tracking表: ${trackingCount[0].count}条记录`);
  console.log(`  lab_tests表: ${testsCount[0].count}条记录`);
  
  const totalRecords = inventoryCount[0].count + trackingCount[0].count + testsCount[0].count;
  
  if (totalRecords > 0) {
    console.log(`\n🎉 数据同步成功！总共${totalRecords}条记录`);
    
    // 显示示例数据
    if (inventoryCount[0].count > 0) {
      const [sample] = await connection.execute('SELECT material_code, material_name, supplier_name, status FROM inventory LIMIT 3');
      console.log(`\n✅ inventory表示例数据:`);
      sample.forEach(item => {
        console.log(`  ${item.material_name} (${item.material_code}) - ${item.supplier_name} [${item.status}]`);
      });
    }
    
    if (testsCount[0].count > 0) {
      const [sample] = await connection.execute('SELECT material_code, material_name, test_result, project_id FROM lab_tests LIMIT 3');
      console.log(`\n✅ lab_tests表示例数据:`);
      sample.forEach(item => {
        console.log(`  ${item.material_name} (${item.material_code}) - ${item.test_result} [${item.project_id}]`);
      });
    }
    
    if (trackingCount[0].count > 0) {
      const [sample] = await connection.execute('SELECT material_code, material_name, factory, project FROM online_tracking LIMIT 3');
      console.log(`\n✅ online_tracking表示例数据:`);
      sample.forEach(item => {
        console.log(`  ${item.material_name} (${item.material_code}) - ${item.factory} [${item.project}]`);
      });
    }
    
  } else {
    console.log('\n❌ 数据同步失败，没有数据被同步');
  }
}

async function testRules(connection) {
  console.log('测试修复后的规则查询:');
  
  const testQueries = [
    {
      name: 'BOE供应商物料查询',
      sql: 'SELECT material_code, material_name, supplier_name FROM inventory WHERE supplier_name = "BOE" LIMIT 3'
    },
    {
      name: 'LCD显示屏库存查询',
      sql: 'SELECT material_code, material_name, supplier_name, quantity FROM inventory WHERE material_name LIKE "%LCD%" LIMIT 3'
    },
    {
      name: '深圳工厂生产查询',
      sql: 'SELECT material_code, material_name, factory, project FROM online_tracking WHERE factory = "深圳工厂" LIMIT 3'
    },
    {
      name: '合格测试结果查询',
      sql: 'SELECT material_code, material_name, test_result, project_id FROM lab_tests WHERE test_result = "合格" LIMIT 3'
    },
    {
      name: 'NG测试结果查询',
      sql: 'SELECT material_code, material_name, test_result, project_id FROM lab_tests WHERE test_result = "NG" LIMIT 3'
    }
  ];
  
  for (const query of testQueries) {
    try {
      const [results] = await connection.execute(query.sql);
      console.log(`\n✅ ${query.name}: 返回${results.length}条记录`);
      
      if (results.length > 0) {
        results.forEach(item => {
          const keys = Object.keys(item);
          const values = keys.map(key => item[key]).join(' | ');
          console.log(`  ${values}`);
        });
      }
    } catch (error) {
      console.log(`❌ ${query.name}失败: ${error.message}`);
    }
  }
}

// 运行同步
finalDataSync().catch(console.error);
