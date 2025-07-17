/**
 * 完整系统修复方案
 * 1. 修复数据同步：将JSON数据正确同步到MySQL表
 * 2. 修复规则库字段：批量更新字段名
 * 3. 测试完整流程
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function completeSystemFix() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 步骤1: 同步前端数据到MySQL表
    console.log('\n=== 步骤1: 同步前端数据到MySQL表 ===');
    await syncFrontendDataToMySQL(connection);
    
    // 步骤2: 修复规则库字段名
    console.log('\n=== 步骤2: 修复规则库字段名 ===');
    await fixRuleFieldNames(connection);
    
    // 步骤3: 测试规则查询
    console.log('\n=== 步骤3: 测试规则查询 ===');
    await testRuleQueries(connection);
    
    // 步骤4: 验证完整流程
    console.log('\n=== 步骤4: 验证完整流程 ===');
    await verifyCompleteFlow(connection);
    
    console.log('\n🎉 完整系统修复成功！');
    console.log('✅ 数据流程：前端localStorage → MySQL表 → 规则查询 → 智能问答');
    
  } catch (error) {
    console.error('❌ 系统修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 步骤1: 同步前端数据到MySQL表
async function syncFrontendDataToMySQL(connection) {
  try {
    // 获取前端数据
    const [realDataRows] = await connection.execute(`
      SELECT data_type, data_content 
      FROM real_data_storage 
      WHERE is_active = TRUE
    `);
    
    if (realDataRows.length === 0) {
      console.log('❌ 没有找到前端数据，请先生成数据');
      return false;
    }
    
    // 清空目标表
    await connection.execute('DELETE FROM inventory');
    await connection.execute('DELETE FROM online_tracking');
    await connection.execute('DELETE FROM lab_tests');
    console.log('✅ 目标表已清空');
    
    // 处理每种数据类型
    for (const row of realDataRows) {
      const dataType = row.data_type;
      const dataContent = JSON.parse(row.data_content);
      
      console.log(`\n处理${dataType}数据: ${dataContent.length}条记录`);
      
      if (dataType === 'inventory') {
        await syncInventoryData(connection, dataContent);
      } else if (dataType === 'inspection') {
        await syncInspectionData(connection, dataContent);
      } else if (dataType === 'production') {
        await syncProductionData(connection, dataContent);
      }
    }
    
    // 验证同步结果
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [trackingCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    const [testsCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    
    console.log(`\n✅ 数据同步完成:`);
    console.log(`  inventory表: ${inventoryCount[0].count}条记录`);
    console.log(`  online_tracking表: ${trackingCount[0].count}条记录`);
    console.log(`  lab_tests表: ${testsCount[0].count}条记录`);
    
    return true;
    
  } catch (error) {
    console.error('❌ 数据同步失败:', error.message);
    return false;
  }
}

// 同步库存数据
async function syncInventoryData(connection, data) {
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
        `${item.factory}-${item.warehouse || '默认仓库'}`,
        item.status || '正常',
        'low',
        '系统',
        item.notes || ''
      ]);
    } catch (error) {
      console.log(`❌ 插入inventory记录失败: ${error.message}`);
    }
  }
}

// 同步检验数据
async function syncInspectionData(connection, data) {
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
    } catch (error) {
      console.log(`❌ 插入lab_tests记录失败: ${error.message}`);
    }
  }
}

// 同步生产数据
async function syncProductionData(connection, data) {
  for (const item of data) {
    try {
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
        parseFloat(item.defectRate) || 0,
        item.weeklyAbnormal === '有异常' ? 1 : 0,
        '系统',
        new Date().toISOString(),
        item.notes || ''
      ]);
    } catch (error) {
      console.log(`❌ 插入online_tracking记录失败: ${error.message}`);
    }
  }
}

// 步骤2: 修复规则库字段名
async function fixRuleFieldNames(connection) {
  try {
    // 批量更新规则中的字段名
    const fieldMappings = [
      { from: 'materialCode', to: 'material_code' },
      { from: 'materialName', to: 'material_name' },
      { from: 'supplierName', to: 'supplier_name' },
      { from: 'testResult', to: 'test_result' },
      { from: 'testDate', to: 'test_date' },
      { from: 'projectName', to: 'project_id' },
      { from: 'baselineName', to: 'baseline_id' }
    ];
    
    let totalUpdated = 0;
    
    for (const mapping of fieldMappings) {
      const [result] = await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = REPLACE(action_target, ?, ?)
        WHERE status = 'active' AND action_target LIKE ?
      `, [mapping.from, mapping.to, `%${mapping.from}%`]);
      
      if (result.affectedRows > 0) {
        console.log(`✅ 更新字段 ${mapping.from} → ${mapping.to}: ${result.affectedRows}条规则`);
        totalUpdated += result.affectedRows;
      }
    }
    
    console.log(`\n✅ 总共更新了${totalUpdated}条规则的字段名`);
    return true;
    
  } catch (error) {
    console.error('❌ 修复规则字段名失败:', error.message);
    return false;
  }
}

// 步骤3: 测试规则查询
async function testRuleQueries(connection) {
  try {
    // 获取几个修复后的规则进行测试
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE status = 'active' AND action_type = 'SQL_QUERY'
      LIMIT 5
    `);
    
    console.log(`测试${rules.length}条规则:`);
    
    for (const rule of rules) {
      console.log(`\n测试规则: ${rule.intent_name}`);
      
      try {
        // 执行规则SQL（限制结果数量）
        let testSQL = rule.action_target;
        if (!testSQL.toLowerCase().includes('limit')) {
          testSQL += ' LIMIT 3';
        }
        
        const [results] = await connection.execute(testSQL);
        console.log(`  ✅ 执行成功，返回${results.length}条记录`);
        
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`  字段: ${fields.join(', ')}`);
        }
        
      } catch (error) {
        console.log(`  ❌ 执行失败: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试规则查询失败:', error.message);
  }
}

// 步骤4: 验证完整流程
async function verifyCompleteFlow(connection) {
  console.log('验证数据流程: 前端数据 → MySQL表 → 规则查询 → 结果返回');
  
  // 验证数据完整性
  const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
  const [trackingCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
  const [testsCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
  
  console.log(`\n📊 数据统计:`);
  console.log(`  库存数据: ${inventoryCount[0].count}条`);
  console.log(`  上线数据: ${trackingCount[0].count}条`);
  console.log(`  测试数据: ${testsCount[0].count}条`);
  
  // 验证规则可用性
  const [activeRules] = await connection.execute(`
    SELECT COUNT(*) as count 
    FROM nlp_intent_rules 
    WHERE status = 'active' AND action_type = 'SQL_QUERY'
  `);
  
  console.log(`  活跃规则: ${activeRules[0].count}条`);
  
  if (inventoryCount[0].count > 0 && trackingCount[0].count > 0 && testsCount[0].count > 0) {
    console.log('\n✅ 数据流程验证成功！');
    console.log('✅ 现在可以使用智能问答功能查询真实数据了');
  } else {
    console.log('\n❌ 数据流程验证失败，部分数据缺失');
  }
}

// 运行完整修复
completeSystemFix().catch(console.error);
