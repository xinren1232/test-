import fetch from 'node-fetch';

async function testTianmaSpecific() {
  try {
    console.log('🧪 专门测试天马供应商识别...');
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: '查询天马库存' })
    });
    
    const result = await response.json();

    console.log('📊 完整响应结构:');
    console.log('- result.success:', result.success);
    console.log('- result.data 类型:', typeof result.data);
    console.log('- result.data 键:', result.data ? Object.keys(result.data) : 'null');

    console.log('📊 查询结果分析:');
    console.log('- 查询成功:', result.success);
    console.log('- 总记录数:', result.data?.tableData?.length || 0);

    // 统计天马供应商的记录
    if (result.data?.tableData) {
      const tianmaRecords = result.data.tableData.filter(item =>
        item.供应商 && item.供应商.includes('天马')
      );
      
      console.log('- 天马供应商记录数:', tianmaRecords.length);
      
      if (tianmaRecords.length > 0) {
        console.log('\n🎯 天马供应商数据样例:');
        tianmaRecords.slice(0, 3).forEach((record, index) => {
          console.log(`${index + 1}. ${record.物料名称} - ${record.供应商} - ${record.工厂} - 数量:${record.数量} - 状态:${record.状态}`);
        });
        
        // 统计天马供应商的物料类型
        const materialTypes = [...new Set(tianmaRecords.map(r => r.物料名称))];
        console.log('\n📋 天马供应商物料类型:', materialTypes.join(', '));
        
        // 统计天马供应商的工厂分布
        const factories = [...new Set(tianmaRecords.map(r => r.工厂))];
        console.log('🏭 天马供应商工厂分布:', factories.join(', '));
        
        console.log('\n✅ 结论: 系统已正确识别天马供应商并返回相关数据');
      } else {
        console.log('❌ 未找到天马供应商的记录');
      }
    }
    
    // 检查卡片数据
    if (result.data?.cards) {
      console.log('\n📊 卡片统计:');
      result.data.cards.forEach(card => {
        console.log(`- ${card.title}: ${card.value} ${card.subtitle}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testTianmaSpecific();
