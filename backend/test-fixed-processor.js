import OptimizedQueryProcessor from './src/services/OptimizedQueryProcessor.js';

async function testFixedProcessor() {
  try {
    console.log('🧪 测试修复后的OptimizedQueryProcessor...\n');
    
    const processor = new OptimizedQueryProcessor();
    await processor.initialize();
    
    const query = '供应商对比分析';
    console.log(`🔍 测试查询: "${query}"`);
    
    const result = await processor.processQuery(query, {});
    
    console.log('📊 处理结果:');
    console.log(`  ✅ 成功: ${result.success}`);
    console.log(`  📍 来源: ${result.source}`);
    console.log(`  🎯 处理模式: ${result.processingMode}`);
    
    if (result.data) {
      if (Array.isArray(result.data)) {
        console.log(`  📋 数据: ${result.data.length} 条记录`);
        if (result.data.length > 0) {
          console.log(`  📄 样本: ${JSON.stringify(result.data[0])}`);
        }
      } else {
        console.log(`  📋 数据: ${typeof result.data}`);
      }
    }
    
    if (result.reply) {
      console.log(`  💬 回复: ${result.reply.substring(0, 200)}...`);
    }
    
    if (result.error) {
      console.log(`  ❌ 错误: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('🔍 错误详情:', error.stack);
  }
}

testFixedProcessor();
