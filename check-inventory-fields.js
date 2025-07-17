/**
 * 检查inventory表的实际字段内容
 */

const API_BASE_URL = 'http://localhost:3001';

async function checkInventoryFields() {
  try {
    console.log('🔍 检查inventory表的实际字段内容...\n');
    
    // 直接执行SQL查询来检查字段
    const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT * FROM inventory LIMIT 5'
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.tableData) {
      console.log('📊 前5条记录的实际字段内容:');
      result.data.tableData.forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = value === null ? '[NULL]' : 
                             value === '' ? '[EMPTY]' : 
                             value === undefined ? '[UNDEFINED]' : value;
          console.log(`  ${key}: ${displayValue}`);
        });
      });
      
      // 检查哪些字段是空的
      console.log('\n📋 字段空值统计:');
      const fields = Object.keys(result.data.tableData[0] || {});
      fields.forEach(field => {
        const emptyCount = result.data.tableData.filter(record => 
          record[field] === null || 
          record[field] === '' || 
          record[field] === undefined
        ).length;
        const totalCount = result.data.tableData.length;
        console.log(`  ${field}: ${emptyCount}/${totalCount} 条空值`);
      });
    } else {
      console.log('❌ 查询失败或无数据');
      console.log('响应:', result);
    }
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

checkInventoryFields();
