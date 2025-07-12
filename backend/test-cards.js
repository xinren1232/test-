import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function testCards() {
  try {
    console.log('🧪 测试不同场景的卡片生成功能');
    
    // 测试场景1：库存查询
    console.log('\n=== 测试场景1：库存查询 ===');
    await testScenario('查询库存信息', '库存查询场景');
    
    // 测试场景2：供应商查询
    console.log('\n=== 测试场景2：供应商查询 ===');
    await testScenario('查询BOE供应商物料', '供应商查询场景');
    
    // 测试场景3：测试查询
    console.log('\n=== 测试场景3：测试查询 ===');
    await testScenario('查询测试失败的记录', '测试查询场景');
    
    // 测试场景4：生产查询
    console.log('\n=== 测试场景4：生产查询 ===');
    await testScenario('查询生产线数据', '生产查询场景');
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

async function testScenario(query, scenarioName) {
  try {
    console.log(`🔍 测试查询: "${query}"`);
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      console.log(`✅ ${scenarioName} - API调用成功`);
      console.log(`📊 数据统计:`);
      console.log(`  - 匹配规则: ${result.data?.analysis?.intent || '未知'}`);
      console.log(`  - 数据条数: ${result.data?.tableData?.length || 0}`);
      console.log(`  - 卡片数量: ${result.data?.cards?.length || 0}`);
      
      if (result.data?.cards && result.data.cards.length > 0) {
        console.log(`🎯 卡片详情:`);
        result.data.cards.forEach((card, index) => {
          if (card.splitData) {
            console.log(`  ${index + 1}. ${card.title} (${card.icon})`);
            console.log(`     - ${card.splitData.material.label}: ${card.splitData.material.value}${card.splitData.material.unit}`);
            console.log(`     - ${card.splitData.batch.label}: ${card.splitData.batch.value}${card.splitData.batch.unit}`);
          } else {
            console.log(`  ${index + 1}. ${card.title}: ${card.value} (${card.icon}) - ${card.subtitle || ''}`);
          }
        });
      } else {
        console.log(`⚠️  没有生成卡片数据`);
      }
      
    } else {
      console.log(`❌ ${scenarioName} - API调用失败:`, response.status);
    }
    
  } catch (error) {
    console.error(`❌ ${scenarioName} - 测试出错:`, error.message);
  }
}

testCards();
