/**
 * 详细测试智能意图服务
 */
import IntelligentIntentService from './src/services/intelligentIntentService.js';

async function testIntentServiceDetailed() {
  console.log('🧪 详细测试智能意图服务\n');

  try {
    // 创建智能意图服务实例
    const intentService = new IntelligentIntentService();
    
    // 初始化服务
    console.log('🚀 初始化智能意图服务...');
    await intentService.initialize();
    
    // 测试查询
    const testQueries = [
      '查询风险状态的库存',
      '查询冻结状态的库存', 
      '分析欣冠供应商的物料情况'
    ];
    
    console.log('\n🧪 详细测试查询处理:');
    for (const query of testQueries) {
      console.log(`\n🔍 测试: "${query}"`);
      console.log('=' .repeat(50));
      
      try {
        // 调用完整的查询处理方法
        const result = await intentService.processQuery(query, {});
        
        console.log('📊 完整处理结果:');
        console.log(JSON.stringify(result, null, 2));
        
        // 检查关键字段
        console.log('\n🔍 关键字段分析:');
        console.log(`  success: ${result.success} (类型: ${typeof result.success})`);
        console.log(`  source: ${result.source}`);
        console.log(`  data: ${result.data ? '有数据' : '无数据'} (类型: ${typeof result.data})`);
        console.log(`  reply: ${result.reply ? '有回复' : '无回复'} (类型: ${typeof result.reply})`);
        console.log(`  error: ${result.error || '无错误'}`);
        
        if (result.data && typeof result.data === 'string') {
          console.log(`  data长度: ${result.data.length} 字符`);
          if (result.data.length < 200) {
            console.log(`  data内容: ${result.data}`);
          } else {
            console.log(`  data内容: ${result.data.substring(0, 100)}...`);
          }
        }
        
      } catch (error) {
        console.log(`❌ 处理失败: ${error.message}`);
        console.log(`错误详情: ${error.stack}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testIntentServiceDetailed();
