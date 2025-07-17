/**
 * 调试production_tracking表的字段结构
 */

const API_BASE_URL = 'http://localhost:3001';

async function debugProductionTrackingFields() {
  try {
    console.log('🔍 调试production_tracking表的字段结构...\n');
    
    // 1. 检查production_tracking表结构
    console.log('1️⃣ 检查production_tracking表结构...');
    const structureResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = 'production_tracking'
          ORDER BY ORDINAL_POSITION
        `
      })
    });
    
    if (structureResponse.ok) {
      const structureResult = await structureResponse.json();
      const columns = structureResult.result;
      
      console.log('📊 production_tracking表结构:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE})`);
      });
      
      // 检查关键字段是否存在
      const fieldCheck = {
        'factory': columns.some(col => col.COLUMN_NAME === 'factory'),
        'baseline_id': columns.some(col => col.COLUMN_NAME === 'baseline_id'),
        'project_id': columns.some(col => col.COLUMN_NAME === 'project_id'),
        'material_code': columns.some(col => col.COLUMN_NAME === 'material_code'),
        'material_name': columns.some(col => col.COLUMN_NAME === 'material_name'),
        'supplier_name': columns.some(col => col.COLUMN_NAME === 'supplier_name'),
        'batch_code': columns.some(col => col.COLUMN_NAME === 'batch_code'),
        'defect_rate': columns.some(col => col.COLUMN_NAME === 'defect_rate'),
        'defect_phenomenon': columns.some(col => col.COLUMN_NAME === 'defect_phenomenon'),
        'inspection_date': columns.some(col => col.COLUMN_NAME === 'inspection_date')
      };
      
      console.log('\n🔍 关键字段检查:');
      Object.entries(fieldCheck).forEach(([field, exists]) => {
        console.log(`  ${field}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
      });
      
      // 查询前5条实际数据
      console.log('\n2️⃣ 查询前5条实际数据...');
      const dataResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT * FROM production_tracking LIMIT 5'
        })
      });
      
      if (dataResponse.ok) {
        const dataResult = await dataResponse.json();
        const records = dataResult.result;
        
        console.log('📋 前5条记录:');
        records.forEach((record, index) => {
          console.log(`\n记录 ${index + 1}:`);
          Object.entries(record).forEach(([key, value]) => {
            const displayValue = value === null ? '[NULL]' : 
                               value === '' ? '[EMPTY]' : 
                               value === undefined ? '[UNDEFINED]' : value;
            console.log(`  ${key}: ${displayValue}`);
          });
        });
      }
      
      // 3. 根据实际字段生成正确的SQL
      console.log('\n3️⃣ 根据实际字段生成正确的SQL...');
      generateCorrectSQL(columns);
      
    } else {
      console.log('❌ 获取表结构失败');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  }
}

function generateCorrectSQL(columns) {
  const columnNames = columns.map(col => col.COLUMN_NAME);
  
  console.log('🔧 生成正确的上线查询SQL:');
  
  // 根据实际字段生成SQL映射
  const sqlMappings = [];
  
  // 工厂字段
  if (columnNames.includes('factory')) {
    sqlMappings.push("COALESCE(factory, '未知工厂') as 工厂");
  } else {
    sqlMappings.push("'未知工厂' as 工厂");
  }
  
  // 基线字段
  if (columnNames.includes('baseline_id')) {
    sqlMappings.push("COALESCE(baseline_id, '') as 基线");
  } else if (columnNames.includes('baseline')) {
    sqlMappings.push("COALESCE(baseline, '') as 基线");
  } else {
    sqlMappings.push("'' as 基线");
  }
  
  // 项目字段
  if (columnNames.includes('project_id')) {
    sqlMappings.push("COALESCE(project_id, '') as 项目");
  } else if (columnNames.includes('project')) {
    sqlMappings.push("COALESCE(project, '') as 项目");
  } else {
    sqlMappings.push("'' as 项目");
  }
  
  // 其他字段
  sqlMappings.push("COALESCE(material_code, '') as 物料编码");
  sqlMappings.push("COALESCE(material_name, '') as 物料名称");
  sqlMappings.push("COALESCE(supplier_name, '') as 供应商");
  sqlMappings.push("COALESCE(batch_code, '') as 批次号");
  
  // 不良率字段
  if (columnNames.includes('defect_rate')) {
    sqlMappings.push("COALESCE(CONCAT(ROUND(defect_rate * 100, 2), '%'), '0%') as 不良率");
  } else {
    sqlMappings.push("'0%' as 不良率");
  }
  
  // 不良现象字段
  if (columnNames.includes('defect_phenomenon')) {
    sqlMappings.push("COALESCE(defect_phenomenon, '') as 不良现象");
  } else if (columnNames.includes('weekly_anomaly')) {
    sqlMappings.push("COALESCE(weekly_anomaly, '') as 不良现象");
  } else {
    sqlMappings.push("'' as 不良现象");
  }
  
  // 检验日期字段
  if (columnNames.includes('inspection_date')) {
    sqlMappings.push("DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期");
  } else if (columnNames.includes('online_date')) {
    sqlMappings.push("DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期");
  } else {
    sqlMappings.push("DATE_FORMAT(created_at, '%Y-%m-%d') as 检验日期");
  }
  
  // 备注字段
  sqlMappings.push("COALESCE(notes, '') as 备注");
  
  const correctSQL = `SELECT 
  ${sqlMappings.join(',\n  ')}
FROM production_tracking 
ORDER BY ${columnNames.includes('inspection_date') ? 'inspection_date' : 'created_at'} DESC 
LIMIT 50`;
  
  console.log('\n正确的SQL模板:');
  console.log(correctSQL);
  
  console.log('\n💡 使用此SQL模板更新上线规则');
}

debugProductionTrackingFields();
