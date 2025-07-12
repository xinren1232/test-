import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 实际前端页面显示字段
const ACTUAL_FRONTEND_FIELDS = {
  inventory: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
  online_tracking: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
  lab_tests: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
  batch_management: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
};

async function checkActualDatabaseFields() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查实际数据库字段定义...\n');
    
    const tables = ['inventory', 'online_tracking', 'lab_tests'];
    const tableFieldMapping = {};
    
    for (const table of tables) {
      console.log(`📋 表: ${table}`);
      
      // 获取表结构
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      const dbFields = columns.map(col => col.Field);
      
      console.log('  数据库字段:');
      dbFields.forEach(field => {
        console.log(`    - ${field}`);
      });
      
      // 获取样本数据
      const [sampleData] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
      if (sampleData.length > 0) {
        console.log('  样本数据:');
        Object.entries(sampleData[0]).forEach(([field, value]) => {
          console.log(`    ${field}: ${value}`);
        });
      }
      
      tableFieldMapping[table] = dbFields;
      console.log('');
    }
    
    // 生成字段映射关系
    console.log('🗂️  字段映射分析:\n');
    
    Object.entries(ACTUAL_FRONTEND_FIELDS).forEach(([table, frontendFields]) => {
      if (tableFieldMapping[table]) {
        console.log(`📊 ${table} 字段映射:`);
        console.log('  前端显示 → 数据库字段');
        
        const dbFields = tableFieldMapping[table];
        const mapping = generateFieldMapping(frontendFields, dbFields, table);
        
        frontendFields.forEach(frontendField => {
          const dbField = mapping[frontendField];
          if (dbField) {
            console.log(`  ${frontendField} → ${dbField} ✅`);
          } else {
            console.log(`  ${frontendField} → 未找到匹配字段 ❌`);
          }
        });
        console.log('');
      }
    });
    
    // 生成正确的SQL模板
    generateCorrectSQLTemplates(tableFieldMapping);
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

// 生成字段映射
function generateFieldMapping(frontendFields, dbFields, table) {
  const mapping = {};
  
  // 基于实际字段名称的映射规则
  const mappingRules = {
    inventory: {
      '工厂': 'storage_location', // 可能需要拆分
      '仓库': 'storage_location', // 可能需要拆分
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': 'inbound_time',
      '到期时间': 'inbound_time', // 需要计算
      '备注': 'notes'
    },
    online_tracking: {
      '工厂': 'factory',
      '基线': 'baseline_id', // 需要确认字段
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '不良率': 'defect_rate',
      '本周异常': 'exception_count', // 需要计算
      '检验日期': 'inspection_date',
      '备注': 'notes' // 需要确认字段
    },
    lab_tests: {
      '测试编号': 'test_id',
      '日期': 'test_date',
      '项目': 'project_id',
      '基线': 'baseline_id',
      '物料编码': 'material_code',
      '数量': 'quantity', // 需要确认字段
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'test_result',
      '不合格描述': 'defect_desc',
      '备注': 'conclusion'
    }
  };
  
  if (mappingRules[table]) {
    frontendFields.forEach(frontendField => {
      const suggestedField = mappingRules[table][frontendField];
      if (suggestedField && dbFields.includes(suggestedField)) {
        mapping[frontendField] = suggestedField;
      }
    });
  }
  
  return mapping;
}

// 生成正确的SQL模板
function generateCorrectSQLTemplates(tableFieldMapping) {
  console.log('📝 基于实际字段的SQL模板:\n');
  
  // 库存查询模板
  console.log('-- 库存查询模板');
  console.log(`SELECT 
    storage_location as 工厂,
    storage_location as 仓库,
    material_code as 物料编码,
    material_name as 物料名称,
    supplier_name as 供应商,
    quantity as 数量,
    status as 状态,
    DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
    DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
    notes as 备注
  FROM inventory 
  WHERE material_name LIKE CONCAT('%', ?, '%')
  ORDER BY inbound_time DESC 
  LIMIT 10;`);
  
  console.log('\n-- 上线跟踪查询模板');
  console.log(`SELECT 
    factory as 工厂,
    baseline_id as 基线,
    project as 项目,
    material_code as 物料编码,
    material_name as 物料名称,
    supplier_name as 供应商,
    batch_code as 批次号,
    CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
    exception_count as 本周异常,
    DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
    'N/A' as 备注
  FROM online_tracking 
  WHERE material_name LIKE CONCAT('%', ?, '%')
  ORDER BY inspection_date DESC 
  LIMIT 10;`);
  
  console.log('\n-- 测试查询模板');
  console.log(`SELECT 
    test_id as 测试编号,
    DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
    project_id as 项目,
    baseline_id as 基线,
    material_code as 物料编码,
    'N/A' as 数量,
    material_name as 物料名称,
    supplier_name as 供应商,
    test_result as 测试结果,
    defect_desc as 不合格描述,
    conclusion as 备注
  FROM lab_tests 
  WHERE material_name LIKE CONCAT('%', ?, '%')
  ORDER BY test_date DESC 
  LIMIT 10;`);
}

checkActualDatabaseFields();
