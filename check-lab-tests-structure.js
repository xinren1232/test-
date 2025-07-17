/**
 * 检查lab_tests表的实际结构
 */

const API_BASE_URL = 'http://localhost:3001';

async function checkLabTestsStructure() {
  try {
    console.log('🔍 检查lab_tests表的实际结构...\n');
    
    const response = await fetch(`${API_BASE_URL}/api/debug/lab_tests`);
    const result = await response.json();
    
    if (result.success) {
      console.log('📊 lab_tests表结构:');
      result.tableStructure.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE})`);
      });
      
      console.log('\n📋 前5条实际数据:');
      if (result.sampleData && result.sampleData.length > 0) {
        result.sampleData.forEach((record, index) => {
          console.log(`\n记录 ${index + 1}:`);
          Object.entries(record).forEach(([key, value]) => {
            const displayValue = value === null ? '[NULL]' : 
                               value === '' ? '[EMPTY]' : 
                               value === undefined ? '[UNDEFINED]' : value;
            console.log(`  ${key}: ${displayValue}`);
          });
        });
      } else {
        console.log('  无数据记录');
      }
      
      console.log('\n📈 空值统计:');
      const stats = result.nullStatistics;
      console.log(`  material_code空值: ${stats.material_code_null}/${stats.total_records}`);
      console.log(`  material_name空值: ${stats.material_name_null}/${stats.total_records}`);
      console.log(`  supplier_name空值: ${stats.supplier_name_null}/${stats.total_records}`);
      console.log(`  总记录数: ${stats.total_records}`);
      
      // 分析字段映射问题
      console.log('\n🔧 字段映射分析:');
      const actualFields = result.tableStructure.map(col => col.COLUMN_NAME);
      
      // 检查我们需要的字段是否存在
      const requiredMappings = {
        '工厂': ['factory', 'storage_location', 'project_id'],
        '基线': ['baseline_id', 'baseline'],
        '项目': ['project_id', 'project'],
        '物料编码': ['material_code'],
        '物料名称': ['material_name'],
        '供应商': ['supplier_name'],
        '批次': ['batch_code'],
        '不良率': ['defect_rate'],
        '不良现象': ['defect_desc'],
        '检验日期': ['test_date'],
        '备注': ['notes']
      };
      
      console.log('\n字段映射建议:');
      Object.entries(requiredMappings).forEach(([displayName, possibleFields]) => {
        const availableField = possibleFields.find(field => actualFields.includes(field));
        if (availableField) {
          console.log(`  ${displayName} -> ${availableField} ✅`);
        } else {
          console.log(`  ${displayName} -> 无可用字段 ❌ (尝试过: ${possibleFields.join(', ')})`);
        }
      });
      
      // 生成正确的SQL模板
      generateCorrectSQL(actualFields);
      
    } else {
      console.log('❌ 获取lab_tests表结构失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

function generateCorrectSQL(actualFields) {
  console.log('\n🔧 生成正确的测试查询SQL模板:\n');
  
  // 根据实际字段生成SQL
  const sqlMappings = [];
  
  // 工厂字段
  if (actualFields.includes('factory')) {
    sqlMappings.push("COALESCE(factory, '未知工厂') as 工厂");
  } else if (actualFields.includes('project_id')) {
    sqlMappings.push("COALESCE(project_id, '未知工厂') as 工厂");
  } else {
    sqlMappings.push("'未知工厂' as 工厂");
  }
  
  // 基线字段
  if (actualFields.includes('baseline_id')) {
    sqlMappings.push("COALESCE(baseline_id, '') as 基线");
  } else if (actualFields.includes('baseline')) {
    sqlMappings.push("COALESCE(baseline, '') as 基线");
  } else {
    sqlMappings.push("'' as 基线");
  }
  
  // 项目字段
  if (actualFields.includes('project_id')) {
    sqlMappings.push("COALESCE(project_id, '') as 项目");
  } else if (actualFields.includes('project')) {
    sqlMappings.push("COALESCE(project, '') as 项目");
  } else {
    sqlMappings.push("'' as 项目");
  }
  
  // 其他字段
  sqlMappings.push("COALESCE(material_code, '') as 物料编码");
  sqlMappings.push("COALESCE(material_name, '') as 物料名称");
  sqlMappings.push("COALESCE(supplier_name, '') as 供应商");
  sqlMappings.push("COALESCE(batch_code, '') as 批次");
  
  // 不良率字段
  if (actualFields.includes('defect_rate')) {
    sqlMappings.push("COALESCE(defect_rate, '0%') as 不良率");
  } else {
    sqlMappings.push("'0%' as 不良率");
  }
  
  // 不良现象字段
  sqlMappings.push("COALESCE(defect_desc, '') as 不良现象");
  
  // 检验日期字段
  sqlMappings.push("DATE_FORMAT(test_date, '%Y-%m-%d') as 检验日期");
  
  // 备注字段
  sqlMappings.push("COALESCE(notes, '') as 备注");
  
  const correctSQL = `SELECT 
  ${sqlMappings.join(',\n  ')}
FROM lab_tests 
ORDER BY test_date DESC 
LIMIT 50`;
  
  console.log(correctSQL);
  
  console.log('\n💡 使用此SQL模板更新测试规则');
}

checkLabTestsStructure();
