import RealDataQueryProcessor from './src/services/realDataQueryProcessor.js';

async function testRealDataQuery() {
  console.log('🧪 测试真实数据查询处理器...\n');
  
  const processor = new RealDataQueryProcessor();
  
  // 测试查询列表
  const testQueries = [
    'BOE供应商有哪些物料',
    '聚龙的库存情况',
    '查询LCD显示屏的供应商',
    '深圳工厂的库存',
    '电池盖的库存情况',
    '风险状态的物料',
    '天马供应商的测试情况',
    '查询所有供应商',
    '华星供应商的物料分布'
  ];
  
  try {
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`\n${i + 1}. 测试查询: "${query}"`);
      console.log('=' .repeat(50));
      
      const result = await processor.processRealDataQuery(query);
      
      if (result.success) {
        console.log('✅ 查询成功');
        console.log('查询类型:', result.queryType);
        console.log('提取参数:', JSON.stringify(result.params, null, 2));
        console.log('\n📋 查询结果:');
        console.log(result.data);
      } else {
        console.log('❌ 查询失败');
        console.log('错误信息:', result.error);
        console.log('返回数据:', result.data);
      }
      
      // 添加延迟避免数据库连接问题
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ 所有测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await processor.close();
  }
}

testRealDataQuery();
