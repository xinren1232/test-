import fetch from 'node-fetch';

async function testRiskQuery() {
  try {
    console.log('🧪 测试风险状态物料查询...\n');
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '查询风险状态的物料'
      })
    });
    
    const result = await response.json();
    
    console.log('📊 查询结果:');
    console.log('状态码:', response.status);
    console.log('匹配的规则:', result.intent || '未知');
    console.log('数据条数:', result.data?.length || 0);
    
    if (result.data && result.data.length > 0) {
      console.log('\n✅ 返回的字段:');
      console.log(Object.keys(result.data[0]).join(', '));
      
      console.log('\n📋 前3条记录:');
      result.data.slice(0, 3).forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      });
      
      // 检查是否包含期望的字段
      const expectedFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
      const actualFields = Object.keys(result.data[0]);
      const missingFields = expectedFields.filter(field => !actualFields.includes(field));
      
      if (missingFields.length === 0) {
        console.log('\n✅ 所有期望字段都存在！');
      } else {
        console.log('\n❌ 缺少字段:', missingFields.join(', '));
      }
      
      // 检查是否都是风险状态
      const riskRecords = result.data.filter(record => record.状态 === '风险');
      console.log(`\n🔍 风险状态记录: ${riskRecords.length}/${result.data.length}`);
      
    } else {
      console.log('\n❌ 没有返回数据');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testRiskQuery();
