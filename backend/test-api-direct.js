import fetch from 'node-fetch';

async function testAPIDirect() {
  try {
    console.log('🔍 直接测试API端点...');
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        query: '查询天马库存'
      })
    });
    
    if (!response.ok) {
      console.error('❌ HTTP错误:', response.status, response.statusText);
      return;
    }
    
    const result = await response.json();
    
    console.log('📊 API响应分析:');
    console.log('- 成功:', result.success);
    console.log('- 总记录数:', result.data?.tableData?.length || 0);
    
    if (result.data?.tableData && result.data.tableData.length > 0) {
      // 统计供应商
      const suppliers = [...new Set(result.data.tableData.map(item => item.供应商))];
      console.log('- 供应商数量:', suppliers.length);
      console.log('- 供应商列表:', suppliers.slice(0, 5).join(', ') + (suppliers.length > 5 ? '...' : ''));
      
      // 检查是否只有天马
      const tianmaCount = result.data.tableData.filter(item => 
        item.供应商 && item.供应商.includes('天马')
      ).length;
      
      console.log('- 天马记录数:', tianmaCount);
      
      if (suppliers.length === 1 && suppliers[0] === '天马') {
        console.log('✅ 成功: 只返回天马供应商数据');
      } else {
        console.log('⚠️ 问题: 返回了多个供应商的数据');
        console.log('前5条记录:');
        result.data.tableData.slice(0, 5).forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.物料名称} - ${record.供应商}`);
        });
      }
    } else {
      console.log('❌ 没有返回数据');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPIDirect();
