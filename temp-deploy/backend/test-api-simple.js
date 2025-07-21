import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🔍 测试API调用...');
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '深圳工厂的库存情况'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API响应成功:');
    console.log('📊 数据记录数:', data.data?.tableData?.length || 0);
    console.log('📈 关键指标:', data.data?.keyMetrics || []);
    console.log('🔍 查询结果预览:');
    
    if (data.data?.tableData && data.data.tableData.length > 0) {
      console.table(data.data.tableData.slice(0, 5)); // 显示前5条记录
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

testAPI();
