import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixFieldMappingIssues() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查实际数据库表结构...\n');
    
    // 1. 检查inventory表结构
    console.log('=== INVENTORY表结构 ===');
    const [inventoryFields] = await connection.execute('DESCRIBE inventory');
    console.log('实际字段:');
    inventoryFields.forEach(field => {
      console.log(`  - ${field.Field} (${field.Type})`);
    });
    
    // 2. 检查样本数据
    console.log('\n=== INVENTORY样本数据 ===');
    const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 1');
    if (inventorySample.length > 0) {
      console.log('样本数据字段和值:');
      Object.entries(inventorySample[0]).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    }
    
    // 3. 检查online_tracking表结构
    console.log('\n=== ONLINE_TRACKING表结构 ===');
    const [onlineFields] = await connection.execute('DESCRIBE online_tracking');
    console.log('实际字段:');
    onlineFields.forEach(field => {
      console.log(`  - ${field.Field} (${field.Type})`);
    });
    
    // 4. 检查lab_tests表结构
    console.log('\n=== LAB_TESTS表结构 ===');
    const [labFields] = await connection.execute('DESCRIBE lab_tests');
    console.log('实际字段:');
    labFields.forEach(field => {
      console.log(`  - ${field.Field} (${field.Type})`);
    });
    
    // 5. 基于实际字段修复规则
    console.log('\n🔧 开始修复规则字段映射...\n');
    
    // 获取实际字段名
    const actualInventoryFields = inventoryFields.map(f => f.Field);
    const actualOnlineFields = onlineFields.map(f => f.Field);
    const actualLabFields = labFields.map(f => f.Field);
    
    console.log('实际inventory字段:', actualInventoryFields);
    console.log('实际online_tracking字段:', actualOnlineFields);
    console.log('实际lab_tests字段:', actualLabFields);
    
    // 6. 修复库存查询规则
    await fixInventoryRules(connection, actualInventoryFields);
    
    // 7. 修复上线跟踪规则
    await fixOnlineTrackingRules(connection, actualOnlineFields);
    
    // 8. 修复测试规则
    await fixLabTestRules(connection, actualLabFields);
    
    console.log('\n✅ 字段映射修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

async function fixInventoryRules(connection, actualFields) {
  console.log('🔧 修复库存查询规则...');
  
  // 基于实际字段构建正确的SQL
  const inventorySQL = buildInventorySQL(actualFields);
  
  console.log('修复后的库存查询SQL:');
  console.log(inventorySQL);
  
  // 更新所有库存相关规则
  const inventoryRuleNames = [
    '物料库存查询',
    '物料库存信息查询',
    '供应商库存查询',
    '库存状态查询',
    '物料库存信息查询_优化',
    '供应商库存查询_优化'
  ];
  
  for (const ruleName of inventoryRuleNames) {
    try {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [inventorySQL, ruleName]
      );
      console.log(`  ✅ 已修复: ${ruleName}`);
    } catch (error) {
      console.log(`  ❌ 修复失败: ${ruleName} - ${error.message}`);
    }
  }
}

function buildInventorySQL(actualFields) {
  // 基于实际字段构建SQL，映射到前端显示字段
  let sql = 'SELECT\n';
  
  // 工厂字段
  if (actualFields.includes('factory')) {
    sql += '  factory as 工厂,\n';
  } else if (actualFields.includes('storage_location')) {
    sql += '  storage_location as 工厂,\n';
  } else {
    sql += '  "未知" as 工厂,\n';
  }
  
  // 仓库字段
  if (actualFields.includes('warehouse')) {
    sql += '  warehouse as 仓库,\n';
  } else if (actualFields.includes('storage_location')) {
    sql += '  storage_location as 仓库,\n';
  } else {
    sql += '  "未知" as 仓库,\n';
  }
  
  // 物料编码
  if (actualFields.includes('material_code')) {
    sql += '  material_code as 物料编码,\n';
  }
  
  // 物料名称
  if (actualFields.includes('material_name')) {
    sql += '  material_name as 物料名称,\n';
  }
  
  // 供应商
  if (actualFields.includes('supplier_name')) {
    sql += '  supplier_name as 供应商,\n';
  }
  
  // 数量
  if (actualFields.includes('quantity')) {
    sql += '  quantity as 数量,\n';
  }
  
  // 状态
  if (actualFields.includes('status')) {
    sql += '  status as 状态,\n';
  }
  
  // 入库时间
  if (actualFields.includes('inbound_time')) {
    sql += '  DATE_FORMAT(inbound_time, "%Y-%m-%d") as 入库时间,\n';
  } else if (actualFields.includes('inboundTime')) {
    sql += '  DATE_FORMAT(inboundTime, "%Y-%m-%d") as 入库时间,\n';
  }
  
  // 到期时间（计算字段）
  if (actualFields.includes('inbound_time')) {
    sql += '  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), "%Y-%m-%d") as 到期时间,\n';
  } else {
    sql += '  "未知" as 到期时间,\n';
  }
  
  // 备注
  if (actualFields.includes('notes')) {
    sql += '  COALESCE(notes, "") as 备注\n';
  } else {
    sql += '  "" as 备注\n';
  }
  
  sql += 'FROM inventory\n';
  sql += 'ORDER BY ';
  
  if (actualFields.includes('inbound_time')) {
    sql += 'inbound_time DESC\n';
  } else if (actualFields.includes('inboundTime')) {
    sql += 'inboundTime DESC\n';
  } else {
    sql += 'id DESC\n';
  }
  
  sql += 'LIMIT 20';
  
  return sql;
}

async function fixOnlineTrackingRules(connection, actualFields) {
  console.log('🔧 修复上线跟踪规则...');
  
  const onlineSQL = buildOnlineTrackingSQL(actualFields);
  
  console.log('修复后的上线跟踪SQL:');
  console.log(onlineSQL);
  
  const onlineRuleNames = [
    '在线跟踪查询',
    '物料上线情况查询',
    '物料上线跟踪查询_优化',
    '批次上线情况查询_优化'
  ];
  
  for (const ruleName of onlineRuleNames) {
    try {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [onlineSQL, ruleName]
      );
      console.log(`  ✅ 已修复: ${ruleName}`);
    } catch (error) {
      console.log(`  ❌ 修复失败: ${ruleName} - ${error.message}`);
    }
  }
}

function buildOnlineTrackingSQL(actualFields) {
  let sql = 'SELECT\n';
  
  // 工厂
  if (actualFields.includes('factory')) {
    sql += '  factory as 工厂,\n';
  } else {
    sql += '  "未知" as 工厂,\n';
  }
  
  // 基线
  if (actualFields.includes('baseline_id')) {
    sql += '  baseline_id as 基线,\n';
  } else if (actualFields.includes('baselineId')) {
    sql += '  baselineId as 基线,\n';
  } else {
    sql += '  "未知" as 基线,\n';
  }
  
  // 项目
  if (actualFields.includes('project_id')) {
    sql += '  project_id as 项目,\n';
  } else if (actualFields.includes('projectId')) {
    sql += '  projectId as 项目,\n';
  } else if (actualFields.includes('project')) {
    sql += '  project as 项目,\n';
  } else {
    sql += '  "未知" as 项目,\n';
  }
  
  // 物料编码
  if (actualFields.includes('material_code')) {
    sql += '  material_code as 物料编码,\n';
  } else if (actualFields.includes('materialCode')) {
    sql += '  materialCode as 物料编码,\n';
  }
  
  // 物料名称
  if (actualFields.includes('material_name')) {
    sql += '  material_name as 物料名称,\n';
  } else if (actualFields.includes('materialName')) {
    sql += '  materialName as 物料名称,\n';
  }
  
  // 供应商
  if (actualFields.includes('supplier_name')) {
    sql += '  supplier_name as 供应商,\n';
  } else if (actualFields.includes('supplier')) {
    sql += '  supplier as 供应商,\n';
  }
  
  // 批次号
  if (actualFields.includes('batch_code')) {
    sql += '  batch_code as 批次号,\n';
  } else if (actualFields.includes('batchNo')) {
    sql += '  batchNo as 批次号,\n';
  }
  
  // 不良率
  if (actualFields.includes('defect_rate')) {
    sql += '  defect_rate as 不良率,\n';
  } else if (actualFields.includes('defectRate')) {
    sql += '  defectRate as 不良率,\n';
  } else {
    sql += '  0 as 不良率,\n';
  }
  
  // 本周异常
  if (actualFields.includes('exception_count')) {
    sql += '  exception_count as 本周异常,\n';
  } else {
    sql += '  0 as 本周异常,\n';
  }
  
  // 检验日期
  if (actualFields.includes('online_date')) {
    sql += '  DATE_FORMAT(online_date, "%Y-%m-%d") as 检验日期,\n';
  } else if (actualFields.includes('onlineTime')) {
    sql += '  DATE_FORMAT(onlineTime, "%Y-%m-%d") as 检验日期,\n';
  } else {
    sql += '  "未知" as 检验日期,\n';
  }
  
  // 备注
  sql += '  "" as 备注\n';
  
  sql += 'FROM online_tracking\n';
  sql += 'ORDER BY ';
  
  if (actualFields.includes('online_date')) {
    sql += 'online_date DESC\n';
  } else if (actualFields.includes('onlineTime')) {
    sql += 'onlineTime DESC\n';
  } else {
    sql += 'id DESC\n';
  }
  
  sql += 'LIMIT 20';
  
  return sql;
}

async function fixLabTestRules(connection, actualFields) {
  console.log('🔧 修复测试规则...');

  const labSQL = buildLabTestSQL(actualFields);

  console.log('修复后的测试SQL:');
  console.log(labSQL);

  const labRuleNames = [
    'NG测试结果查询',
    '物料测试结果查询_优化',
    'NG测试结果查询_优化',
    '批次测试情况查询'
  ];

  for (const ruleName of labRuleNames) {
    try {
      await connection.execute(
        'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE intent_name = ?',
        [labSQL, ruleName]
      );
      console.log(`  ✅ 已修复: ${ruleName}`);
    } catch (error) {
      console.log(`  ❌ 修复失败: ${ruleName} - ${error.message}`);
    }
  }
}

function buildLabTestSQL(actualFields) {
  let sql = 'SELECT\n';

  // 测试编号
  if (actualFields.includes('test_id')) {
    sql += '  test_id as 测试编号,\n';
  } else {
    sql += '  id as 测试编号,\n';
  }

  // 日期
  if (actualFields.includes('test_date')) {
    sql += '  DATE_FORMAT(test_date, "%Y-%m-%d") as 日期,\n';
  } else {
    sql += '  "未知" as 日期,\n';
  }

  // 项目
  if (actualFields.includes('project_id')) {
    sql += '  project_id as 项目,\n';
  } else if (actualFields.includes('projectId')) {
    sql += '  projectId as 项目,\n';
  } else {
    sql += '  "未知" as 项目,\n';
  }

  // 基线
  if (actualFields.includes('baseline_id')) {
    sql += '  baseline_id as 基线,\n';
  } else if (actualFields.includes('baselineId')) {
    sql += '  baselineId as 基线,\n';
  } else {
    sql += '  "未知" as 基线,\n';
  }

  // 物料编码
  if (actualFields.includes('material_code')) {
    sql += '  material_code as 物料编码,\n';
  } else if (actualFields.includes('materialCode')) {
    sql += '  materialCode as 物料编码,\n';
  }

  // 数量
  if (actualFields.includes('quantity')) {
    sql += '  quantity as 数量,\n';
  } else {
    sql += '  1 as 数量,\n';
  }

  // 物料名称
  if (actualFields.includes('material_name')) {
    sql += '  material_name as 物料名称,\n';
  } else if (actualFields.includes('materialName')) {
    sql += '  materialName as 物料名称,\n';
  }

  // 供应商
  if (actualFields.includes('supplier_name')) {
    sql += '  supplier_name as 供应商,\n';
  } else if (actualFields.includes('supplier')) {
    sql += '  supplier as 供应商,\n';
  }

  // 测试结果
  if (actualFields.includes('test_result')) {
    sql += '  test_result as 测试结果,\n';
  } else if (actualFields.includes('result')) {
    sql += '  result as 测试结果,\n';
  } else {
    sql += '  "未知" as 测试结果,\n';
  }

  // 不合格描述
  if (actualFields.includes('defect_desc')) {
    sql += '  defect_desc as 不合格描述,\n';
  } else if (actualFields.includes('defect')) {
    sql += '  defect as 不合格描述,\n';
  } else {
    sql += '  "" as 不合格描述,\n';
  }

  // 备注
  if (actualFields.includes('notes')) {
    sql += '  COALESCE(notes, "") as 备注\n';
  } else {
    sql += '  "" as 备注\n';
  }

  sql += 'FROM lab_tests\n';
  sql += 'ORDER BY ';

  if (actualFields.includes('test_date')) {
    sql += 'test_date DESC\n';
  } else {
    sql += 'id DESC\n';
  }

  sql += 'LIMIT 20';

  return sql;
}

// 运行修复
fixFieldMappingIssues().catch(console.error);
