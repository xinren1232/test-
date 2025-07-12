/**
 * 测试表格数据返回
 */

async function testTableData() {
  console.log('🧪 测试表格数据返回...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: '查询电池库存'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 查询成功');
      console.log('📊 完整响应结构:');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n🔍 关键字段检查:');
      console.log(`   success: ${result.success}`);
      console.log(`   data存在: ${!!result.data}`);
      console.log(`   answer存在: ${!!result.data?.answer}`);
      console.log(`   tableData存在: ${!!result.data?.tableData}`);
      console.log(`   keyMetrics存在: ${!!result.data?.keyMetrics}`);
      console.log(`   summary存在: ${!!result.data?.summary}`);
      
      if (result.data?.tableData) {
        console.log(`   tableData长度: ${result.data.tableData.length}`);
        if (result.data.tableData.length > 0) {
          console.log(`   首条记录: ${JSON.stringify(result.data.tableData[0])}`);
        }
      }
      
      if (result.data?.keyMetrics) {
        console.log(`   keyMetrics长度: ${result.data.keyMetrics.length}`);
        if (result.data.keyMetrics.length > 0) {
          console.log(`   首个指标: ${JSON.stringify(result.data.keyMetrics[0])}`);
        }
      }
      
    } else {
      console.log(`❌ 查询失败: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 请求异常: ${error.message}`);
  }
}

testTableData();
