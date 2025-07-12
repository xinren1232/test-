import RealDataQueryProcessor from './src/services/realDataQueryProcessor.js';

async function testSingleQuery() {
  console.log('🧪 测试单个查询...\n');
  
  const processor = new RealDataQueryProcessor();
  
  try {
    const query = '天马供应商的测试情况';
    console.log(`测试查询: "${query}"`);
    
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
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await processor.close();
  }
}

testSingleQuery();
