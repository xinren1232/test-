import OptimizedQueryProcessor from './src/services/OptimizedQueryProcessor.js';

async function testOptimizedProcessor() {
  try {
    console.log('🧪 测试OptimizedQueryProcessor...\n');
    
    const processor = new OptimizedQueryProcessor();
    await processor.initialize();
    
    const testQueries = [
      '供应商对比分析',
      '查询电池库存',
      '深圳工厂库存情况'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      console.log('=' + '='.repeat(50));
      
      try {
        const result = await processor.processQuery(query, {});
        
        console.log('📊 OptimizedQueryProcessor结果:');
        console.log(`  ✅ 成功: ${result.success}`);
        console.log(`  📍 来源: ${result.source}`);
        console.log(`  🎯 处理模式: ${result.processingMode}`);
        
        if (result.data) {
          if (Array.isArray(result.data)) {
            console.log(`  📋 数据: ${result.data.length} 条记录`);
          } else {
            console.log(`  📋 数据: ${typeof result.data}`);
          }
        }
        
        if (result.reply) {
          console.log(`  💬 回复: ${result.reply.substring(0, 100)}...`);
        }
        
        if (result.error) {
          console.log(`  ❌ 错误: ${result.error}`);
        }
        
      } catch (error) {
        console.log(`❌ 查询失败: ${error.message}`);
        console.log(`🔍 错误详情: ${error.stack}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testOptimizedProcessor();
