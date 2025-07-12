import IntelligentIntentService from './src/services/intelligentIntentService.js';

async function testCurrentIntentService() {
  try {
    console.log('🧪 测试当前智能意图服务...\n');
    
    const service = new IntelligentIntentService();
    await service.initialize();
    
    const testQueries = [
      '物料测试情况查询',
      '查询电池库存',
      '深圳工厂库存情况',
      '供应商对比分析'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      console.log('=' + '='.repeat(50));
      
      try {
        const result = await service.processQuery(query, {});
        
        console.log('📊 处理结果:');
        console.log(`  ✅ 成功: ${result.success}`);
        console.log(`  📍 来源: ${result.source}`);
        console.log(`  🎯 意图: ${result.intent || '未识别'}`);
        
        if (result.data) {
          if (Array.isArray(result.data)) {
            console.log(`  📋 数据: ${result.data.length} 条记录`);
            if (result.data.length > 0) {
              console.log(`  📄 样本: ${JSON.stringify(result.data[0])}`);
            }
          } else {
            console.log(`  📋 数据: ${typeof result.data} - ${result.data.toString().substring(0, 100)}...`);
          }
        }
        
        if (result.reply) {
          console.log(`  💬 回复: ${result.reply.substring(0, 200)}...`);
        }
        
        if (result.sql) {
          console.log(`  🗃️ SQL: ${result.sql.substring(0, 100)}...`);
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

testCurrentIntentService();
