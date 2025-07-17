/**
 * 简化的数据同步脚本
 * 直接从real_data_storage获取数据并同步到MySQL表
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function simpleDataSync() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查real_data_storage表结构
    console.log('\n=== 检查real_data_storage表结构 ===');
    const [fields] = await connection.execute('DESCRIBE real_data_storage');
    console.log('表字段:');
    fields.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type}`);
    });
    
    // 2. 获取数据
    console.log('\n=== 获取存储的数据 ===');
    const [rows] = await connection.execute(`
      SELECT data_type, data_content 
      FROM real_data_storage 
      WHERE is_active = TRUE
    `);
    
    console.log(`找到${rows.length}条数据记录`);
    
    if (rows.length === 0) {
      console.log('❌ 没有找到数据，请先在前端生成数据');
      return;
    }
    
    // 3. 清空目标表
    console.log('\n=== 清空目标表 ===');
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM online_tracking');
    await connection.execute('DELETE FROM lab_tests');
    console.log('✅ 目标表已清空');
    
    // 4. 同步数据
    console.log('\n=== 同步数据 ===');
    for (const row of rows) {
      const dataType = row.data_type;
      const content = row.data_content;
      
      console.log(`\n处理${dataType}数据...`);
      console.log(`内容长度: ${content.length}字符`);
      console.log(`内容预览: ${content.substring(0, 100)}...`);
      
      // 检查数据格式
      if (content.includes('[object Object]')) {
        console.log('❌ 数据格式错误，需要重新生成数据');
        continue;
      }
      
      try {
        const data = JSON.parse(content);
        console.log(`✅ JSON解析成功，${data.length}条记录`);
        
        if (data.length > 0) {
          console.log(`第一条记录字段: ${Object.keys(data[0]).join(', ')}`);
          
          // 根据数据类型同步到对应表
          if (dataType === 'inventory') {
            await syncInventory(connection, data);
          } else if (dataType === 'inspection') {
            await syncInspection(connection, data);
          } else if (dataType === 'production') {
            await syncProduction(connection, data);
          }
        }
        
      } catch (error) {
        console.log(`❌ JSON解析失败: ${error.message}`);
      }
    }
    
    // 5. 验证结果
    console.log('\n=== 验证同步结果 ===');
    await verifyResults(connection);
    
    // 6. 测试规则查询
    console.log('\n=== 测试规则查询 ===');
    await testRules(connection);
    
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
          batch_code, material_code, material_name, material_type,
          supplier_name, quantity, inbound_time, storage_location,
          status, risk_level, inspector, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.batchNo || `BATCH-${item.id}`,
        item.materialCode,
        item.materialName,
        '电子元件',
        item.supplier,
        item.quantity || 0,
        item.inboundTime || new Date().toISOString(),
        `${item.factory || '默认工厂'}-${item.warehouse || '默认仓库'}`,
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
          test_id, batch_code, material_code, material_name,
          project_id, baseline_id, supplier_name, test_date,
          test_item, test_result, conclusion, defect_desc,
          tester, test_duration, notes, quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.test_id || `TEST-${item.id}`,
        item.batchNo || `BATCH-${item.id}`,
        item.materialCode,
        item.materialName,
        item.projectName || 'KI4K',
        item.baselineName || 'I6788',
        item.supplier,
        item.testDate || new Date().toISOString(),
        item.testItem || '外观检查',
        item.testResult || '合格',
        item.conclusion || item.testResult || '合格',
        item.defectPhenomena || '',
        '系统',
        30,
        item.notes || '',
        item.quantity || 1
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
          batch_code, material_code, material_name, supplier_name,
          online_date, use_time, factory, workshop, line,
          project, baseline, defect_rate, exception_count,
          operator, inspection_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.batchNo || `BATCH-${item.id}`,
        item.materialCode,
        item.materialName,
        item.supplier,
        item.onlineDate || new Date().toISOString(),
        item.useTime || new Date().toISOString(),
        item.factory || '深圳工厂',
        '车间A',
        '产线1',
        item.project || 'KI4K',
        item.baselineId || 'I6788',
        defectRate,
        item.weeklyAbnormal === '有异常' ? 1 : 0,
        '系统',
        new Date().toISOString(),
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
      const [sample] = await connection.execute('SELECT material_code, material_name, supplier_name FROM inventory LIMIT 1');
      console.log(`\n✅ inventory表示例: ${sample[0].material_name} (${sample[0].material_code}) - ${sample[0].supplier_name}`);
    }
    
    if (testsCount[0].count > 0) {
      const [sample] = await connection.execute('SELECT material_code, material_name, test_result FROM lab_tests LIMIT 1');
      console.log(`✅ lab_tests表示例: ${sample[0].material_name} (${sample[0].material_code}) - ${sample[0].test_result}`);
    }
    
    if (trackingCount[0].count > 0) {
      const [sample] = await connection.execute('SELECT material_code, material_name, factory FROM online_tracking LIMIT 1');
      console.log(`✅ online_tracking表示例: ${sample[0].material_name} (${sample[0].material_code}) - ${sample[0].factory}`);
    }
    
  } else {
    console.log('\n❌ 数据同步失败，没有数据被同步');
  }
}

async function testRules(connection) {
  // 测试几个简单的规则查询
  const testQueries = [
    {
      name: '库存物料查询',
      sql: 'SELECT material_code, material_name, supplier_name FROM inventory WHERE supplier_name LIKE "%BOE%" LIMIT 3'
    },
    {
      name: '测试结果查询',
      sql: 'SELECT material_code, material_name, test_result FROM lab_tests WHERE test_result = "合格" LIMIT 3'
    },
    {
      name: '工厂生产查询',
      sql: 'SELECT material_code, material_name, factory FROM online_tracking WHERE factory LIKE "%深圳%" LIMIT 3'
    }
  ];
  
  for (const query of testQueries) {
    try {
      const [results] = await connection.execute(query.sql);
      console.log(`✅ ${query.name}: 返回${results.length}条记录`);
      
      if (results.length > 0) {
        const first = results[0];
        console.log(`  示例: ${first.material_name} (${first.material_code})`);
      }
    } catch (error) {
      console.log(`❌ ${query.name}失败: ${error.message}`);
    }
  }
}

// 运行同步
simpleDataSync().catch(console.error);
