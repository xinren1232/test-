/**
 * 直接测试智能意图服务
 */
import IntelligentIntentService from './backend/src/services/intelligentIntentService.js';

async function testIntentServiceDirect() {
  console.log('🧪 直接测试智能意图服务\n');

  try {
    // 创建智能意图服务实例
    const intentService = new IntelligentIntentService();
    
    // 初始化服务
    console.log('🚀 初始化智能意图服务...');
    await intentService.initialize();
    console.log('✅ 智能意图服务初始化完成\n');
    
    // 检查加载的规则
    console.log('📋 已加载的规则:');
    console.log(`规则总数: ${intentService.intentRules.length}`);
    
    if (intentService.intentRules.length > 0) {
      console.log('\n规则详情:');
      for (let i = 0; i < Math.min(5, intentService.intentRules.length); i++) {
        const rule = intentService.intentRules[i];
        console.log(`${i + 1}. ${rule.intent_name}`);
        console.log(`   描述: ${rule.description}`);
        console.log(`   状态: ${rule.status}`);
        console.log(`   优先级: ${rule.priority}`);
        console.log(`   触发词: ${JSON.stringify(rule.trigger_words)}`);
        console.log('');
      }
    }
    
    // 测试查询
    const testQueries = [
      '重庆工厂的库存情况',
      '聚龙供应商的材料状态如何？',
      '风险状态的材料有哪些？'
    ];
    
    console.log('🧪 测试查询处理:');
    for (const query of testQueries) {
      console.log(`\n🔍 测试: "${query}"`);
      console.log('=' .repeat(50));
      
      try {
        // 测试意图识别
        const matchedIntent = intentService.identifyIntent(query);
        if (matchedIntent) {
          console.log(`✅ 匹配意图: ${matchedIntent.intent_name}`);
          console.log(`   优先级: ${matchedIntent.priority}`);
          console.log(`   状态: ${matchedIntent.status}`);
          
          // 测试参数提取
          const extractedParams = intentService.extractParameters(query, matchedIntent);
          console.log(`📊 提取参数:`, extractedParams);
          
        } else {
          console.log('❌ 未找到匹配的意图');
        }
        
      } catch (error) {
        console.log(`❌ 处理异常: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testIntentServiceDirect();
