import fetch from 'node-fetch';

async function checkRunningServices() {
  console.log('🔍 检查当前运行的服务...');
  
  // 检查主要的API端点
  const endpoints = [
    'http://localhost:3001/api/assistant/query',
    'http://localhost:3001/api/intelligent-qa/ask',
    'http://localhost:3002/api/intelligent-qa/ask'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: '查询天马库存',
          question: '查询天马库存'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`\n✅ ${endpoint} - 可用`);
        console.log(`   - 成功: ${result.success}`);
        console.log(`   - 数据记录数: ${result.data?.tableData?.length || result.data?.queryData?.length || '未知'}`);
        
        // 检查是否只有天马数据
        const tableData = result.data?.tableData || result.data?.queryData || [];
        if (tableData.length > 0) {
          const suppliers = [...new Set(tableData.map(item => item.供应商))];
          console.log(`   - 供应商数: ${suppliers.length}`);
          console.log(`   - 供应商: ${suppliers.slice(0, 3).join(', ')}${suppliers.length > 3 ? '...' : ''}`);
          
          if (suppliers.length === 1 && suppliers[0] === '天马') {
            console.log(`   ✅ 正确: 只返回天马数据`);
          } else {
            console.log(`   ⚠️ 问题: 返回了多个供应商数据`);
          }
        }
      } else {
        console.log(`\n❌ ${endpoint} - 不可用 (${response.status})`);
      }
    } catch (error) {
      console.log(`\n❌ ${endpoint} - 连接失败: ${error.message}`);
    }
  }
}

checkRunningServices();
