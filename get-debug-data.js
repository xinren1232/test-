/**
 * 获取调试数据
 */

const API_BASE_URL = 'http://localhost:3001';

async function getDebugData() {
  try {
    console.log('🔍 获取inventory表调试数据...\n');
    
    const response = await fetch(`${API_BASE_URL}/api/debug/inventory`);
    const result = await response.json();
    
    if (result.success) {
      console.log('📋 表结构:');
      result.tableStructure.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE})`);
      });
      
      console.log('\n📊 前5条实际数据:');
      result.sampleData.forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = value === null ? '[NULL]' : 
                             value === '' ? '[EMPTY]' : 
                             value === undefined ? '[UNDEFINED]' : value;
          console.log(`  ${key}: ${displayValue}`);
        });
      });
      
      console.log('\n📈 空值统计:');
      const stats = result.nullStatistics;
      console.log(`  material_code空值: ${stats.material_code_null}/${stats.total_records}`);
      console.log(`  material_name空值: ${stats.material_name_null}/${stats.total_records}`);
      console.log(`  supplier_name空值: ${stats.supplier_name_null}/${stats.total_records}`);
      console.log(`  总记录数: ${stats.total_records}`);
      
    } else {
      console.log('❌ 获取调试数据失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

getDebugData();
