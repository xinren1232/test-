/**
 * 修复real_data_storage中的数据格式问题
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixDataStorageFormat() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查数据格式问题
    console.log('\n=== 检查数据格式问题 ===');
    const [rows] = await connection.execute(`
      SELECT id, data_type, data_content, created_at
      FROM real_data_storage 
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);
    
    console.log(`找到${rows.length}条记录:`);
    
    for (const row of rows) {
      console.log(`\n记录ID: ${row.id}, 类型: ${row.data_type}`);
      const content = row.data_content;
      
      console.log(`内容长度: ${content.length}字符`);
      console.log(`内容预览: ${content.substring(0, 100)}...`);
      
      // 检查是否是[object Object]格式
      if (content.includes('[object Object]')) {
        console.log('❌ 数据格式错误：对象被toString()了');
        
        // 尝试从前端重新获取数据
        console.log('⚠️ 需要重新生成数据');
        
      } else {
        // 尝试解析JSON
        try {
          const parsed = JSON.parse(content);
          console.log('✅ JSON格式正确');
          console.log(`数据类型: ${typeof parsed}`);
          
          if (Array.isArray(parsed)) {
            console.log(`数组长度: ${parsed.length}`);
            if (parsed.length > 0) {
              console.log(`第一个元素字段: ${Object.keys(parsed[0]).join(', ')}`);
              
              // 检查字段格式
              const firstItem = parsed[0];
              if (firstItem.materialCode) {
                console.log('✅ 包含materialCode字段');
              }
              if (firstItem.materialName) {
                console.log('✅ 包含materialName字段');
              }
              if (firstItem.supplier) {
                console.log('✅ 包含supplier字段');
              }
            }
          }
          
          // 如果数据格式正确，直接同步到MySQL表
          await syncDataToTables(connection, row.data_type, parsed);
          
        } catch (error) {
          console.log('❌ JSON解析失败:', error.message);
        }
      }
    }
    
    // 验证同步结果
    console.log('\n=== 验证同步结果 ===');
    await verifySyncResults(connection);
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function syncDataToTables(connection, dataType, data) {
  console.log(`\n开始同步${dataType}数据到MySQL表...`);
  
  try {
    if (dataType === 'inventory') {
      // 清空inventory表
      await connection.execute('DELETE FROM inventory');
      
      for (const item of data) {
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
      }
      console.log(`✅ inventory表同步完成: ${data.length}条记录`);
      
    } else if (dataType === 'inspection') {
      // 清空lab_tests表
      await connection.execute('DELETE FROM lab_tests');
      
      for (const item of data) {
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
      }
      console.log(`✅ lab_tests表同步完成: ${data.length}条记录`);
      
    } else if (dataType === 'production') {
      // 清空online_tracking表
      await connection.execute('DELETE FROM online_tracking');
      
      for (const item of data) {
        // 处理defectRate字段（去掉%符号）
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
      }
      console.log(`✅ online_tracking表同步完成: ${data.length}条记录`);
    }
    
  } catch (error) {
    console.error(`❌ 同步${dataType}数据失败:`, error.message);
  }
}

async function verifySyncResults(connection) {
  const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
  const [trackingCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
  const [testsCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
  
  console.log(`\n📊 同步结果统计:`);
  console.log(`  inventory表: ${inventoryCount[0].count}条记录`);
  console.log(`  online_tracking表: ${trackingCount[0].count}条记录`);
  console.log(`  lab_tests表: ${testsCount[0].count}条记录`);
  
  // 测试查询
  if (inventoryCount[0].count > 0) {
    const [sample] = await connection.execute('SELECT material_code, material_name, supplier_name FROM inventory LIMIT 1');
    console.log(`\n✅ inventory表示例数据:`);
    console.log(`  物料编码: ${sample[0].material_code}`);
    console.log(`  物料名称: ${sample[0].material_name}`);
    console.log(`  供应商: ${sample[0].supplier_name}`);
  }
  
  if (testsCount[0].count > 0) {
    const [sample] = await connection.execute('SELECT material_code, material_name, test_result FROM lab_tests LIMIT 1');
    console.log(`\n✅ lab_tests表示例数据:`);
    console.log(`  物料编码: ${sample[0].material_code}`);
    console.log(`  物料名称: ${sample[0].material_name}`);
    console.log(`  测试结果: ${sample[0].test_result}`);
  }
  
  if (trackingCount[0].count > 0) {
    const [sample] = await connection.execute('SELECT material_code, material_name, factory FROM online_tracking LIMIT 1');
    console.log(`\n✅ online_tracking表示例数据:`);
    console.log(`  物料编码: ${sample[0].material_code}`);
    console.log(`  物料名称: ${sample[0].material_name}`);
    console.log(`  工厂: ${sample[0].factory}`);
  }
  
  const totalRecords = inventoryCount[0].count + trackingCount[0].count + testsCount[0].count;
  if (totalRecords > 0) {
    console.log(`\n🎉 数据同步成功！总共${totalRecords}条记录`);
    console.log('✅ 现在可以使用规则查询真实数据了');
  } else {
    console.log('\n❌ 数据同步失败，没有数据被同步');
  }
}

// 运行修复
fixDataStorageFormat().catch(console.error);
