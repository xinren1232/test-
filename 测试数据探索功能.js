/**
 * 测试数据探索功能
 * 演示两步查询流程：先探索数据，再执行具体查询
 */

async function testDataExploration() {
  console.log('🔍 IQE数据探索功能测试');
  console.log('=======================');
  
  try {
    // 步骤1: 探索系统中有哪些供应商
    console.log('\n📋 步骤1: 探索系统中的供应商');
    console.log('用户查询: "系统里有哪些供应商？"');
    
    const explorationResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "系统里有哪些供应商？" })
    });
    
    const explorationResult = await explorationResponse.json();
    console.log('🤖 系统回复:', explorationResult.reply?.data?.answer || explorationResult.reply?.message);
    
    // 步骤2: 基于探索结果，执行具体查询
    console.log('\n🎯 步骤2: 基于探索结果执行具体查询');
    console.log('用户查询: "查询聚龙供应商的库存"');
    
    const specificResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "查询聚龙供应商的库存" })
    });
    
    const specificResult = await specificResponse.json();
    console.log('🤖 系统回复:', specificResult.reply?.data?.answer || specificResult.reply?.message);
    
    // 步骤3: 探索物料信息
    console.log('\n📋 步骤3: 探索系统中的物料');
    console.log('用户查询: "系统里有哪些物料？"');
    
    const materialResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "系统里有哪些物料？" })
    });
    
    const materialResult = await materialResponse.json();
    console.log('🤖 系统回复:', materialResult.reply?.data?.answer || materialResult.reply?.message);
    
    // 步骤4: 探索工厂信息
    console.log('\n📋 步骤4: 探索系统中的工厂');
    console.log('用户查询: "系统里有哪些工厂？"');
    
    const factoryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "系统里有哪些工厂？" })
    });
    
    const factoryResult = await factoryResponse.json();
    console.log('🤖 系统回复:', factoryResult.reply?.data?.answer || factoryResult.reply?.message);
    
    // 步骤5: 探索状态分布
    console.log('\n📊 步骤5: 探索库存状态分布');
    console.log('用户查询: "库存状态都有哪些？"');
    
    const statusResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "库存状态都有哪些？" })
    });
    
    const statusResult = await statusResponse.json();
    console.log('🤖 系统回复:', statusResult.reply?.data?.answer || statusResult.reply?.message);
    
    console.log('\n✅ 数据探索功能测试完成');
    console.log('\n💡 使用建议:');
    console.log('1. 用户可以先问"系统里有哪些供应商？"了解可用选项');
    console.log('2. 然后问"查询[具体供应商]的库存"执行精确查询');
    console.log('3. 同样适用于物料、工厂、仓库等其他字段');
    console.log('4. 支持组合查询，如"各个供应商都提供哪些物料？"');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testDataExploration();
