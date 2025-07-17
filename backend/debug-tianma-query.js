import fetch from 'node-fetch';

async function debugTianmaQuery() {
  try {
    console.log('🔍 调试天马查询过程...');
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        query: '查询天马库存'
      })
    });
    
    const result = await response.json();
    
    console.log('📊 API响应分析:');
    console.log('- 成功:', result.success);
    console.log('- 匹配的规则:', result.data?.metadata?.rule);
    console.log('- 数据来源:', result.data?.metadata?.dataSource);
    console.log('- 总记录数:', result.data?.tableData?.length);
    
    // 检查是否有天马供应商的数据
    if (result.data?.tableData) {
      const tianmaRecords = result.data.tableData.filter(item => 
        item.供应商 && item.供应商.includes('天马')
      );
      console.log('- 天马供应商记录数:', tianmaRecords.length);
      
      // 统计所有供应商
      const allSuppliers = [...new Set(result.data.tableData.map(item => item.供应商))];
      console.log('- 返回的供应商数:', allSuppliers.length);
      console.log('- 前10个供应商:', allSuppliers.slice(0, 10).join(', '));
      
      // 如果返回了所有数据而不是只有天马的数据，说明过滤没有生效
      if (result.data.tableData.length > 20 && tianmaRecords.length < result.data.tableData.length) {
        console.log('\n⚠️ 问题确认: 查询返回了所有供应商的数据，而不是只有天马的数据');
        console.log('这说明SQL查询的WHERE条件没有生效');
      }
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugTianmaQuery();
