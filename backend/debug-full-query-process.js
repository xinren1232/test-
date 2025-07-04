/**
 * 调试完整查询处理流程
 */
import IntelligentIntentService from './src/services/intelligentIntentService.js';

async function debugFullQueryProcess() {
  console.log('🐛 调试完整查询处理流程\n');

  try {
    // 创建智能意图服务实例
    const intentService = new IntelligentIntentService();
    
    // 初始化服务
    console.log('🚀 初始化智能意图服务...');
    await intentService.initialize();
    
    // 测试完整的查询处理
    const testQueries = [
      '查询风险状态的库存',
      '查询冻结状态的库存', 
      '分析欣冠供应商的物料情况'
    ];
    
    console.log('\n🧪 测试完整查询处理:');
    for (const query of testQueries) {
      console.log(`\n🔍 测试: "${query}"`);
      
      try {
        // 调用完整的查询处理方法
        const result = await intentService.processQuery(query, {});
        
        console.log('📊 处理结果:');
        console.log(`  成功: ${result.success}`);
        console.log(`  来源: ${result.source}`);
        console.log(`  回复长度: ${result.reply ? result.reply.length : 0} 字符`);
        
        if (result.reply && result.reply.length < 200) {
          console.log(`  回复内容: ${result.reply}`);
        } else if (result.reply) {
          console.log(`  回复内容: ${result.reply.substring(0, 100)}...`);
        }
        
        if (result.error) {
          console.log(`  错误: ${result.error}`);
        }
        
      } catch (error) {
        console.log(`❌ 处理失败: ${error.message}`);
        console.log(`错误详情: ${error.stack}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

// 运行调试
debugFullQueryProcess();
