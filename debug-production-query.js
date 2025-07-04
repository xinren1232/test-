/**
 * 调试生产查询的意图识别问题
 */
import IntelligentIntentService from './backend/src/services/intelligentIntentService.js';

async function debugProductionQuery() {
  console.log('🔍 调试生产查询的意图识别问题\n');

  try {
    // 创建智能意图服务实例
    const intentService = new IntelligentIntentService();
    
    // 初始化服务
    console.log('🚀 初始化智能意图服务...');
    await intentService.initialize();
    console.log('✅ 智能意图服务初始化完成\n');
    
    // 检查加载的规则
    console.log('📋 已加载的规则:');
    console.log(`规则总数: ${intentService.intentRules.length}\n`);
    
    // 显示与生产相关的规则
    console.log('🏭 生产相关规则:');
    intentService.intentRules.forEach((rule, index) => {
      const triggerWords = Array.isArray(rule.trigger_words) ? rule.trigger_words : JSON.parse(rule.trigger_words || '[]');
      const hasProductionTrigger = triggerWords.some(word => 
        word.includes('生产') || word.includes('产能') || word.includes('效率') || word.includes('工厂')
      );
      
      if (hasProductionTrigger) {
        console.log(`${index + 1}. ${rule.intent_name}`);
        console.log(`   描述: ${rule.description}`);
        console.log(`   优先级: ${rule.priority}`);
        console.log(`   触发词: ${JSON.stringify(triggerWords)}`);
        console.log('');
      }
    });
    
    // 测试问题查询
    const problemQuery = '重庆工厂的生产情况';
    console.log(`🧪 测试问题查询: "${problemQuery}"`);
    console.log('=' .repeat(60));
    
    // 测试意图识别
    const matchedIntent = intentService.identifyIntent(problemQuery);
    if (matchedIntent) {
      console.log(`✅ 匹配意图: ${matchedIntent.intent_name}`);
      console.log(`   优先级: ${matchedIntent.priority}`);
      console.log(`   状态: ${matchedIntent.status}`);
      
      // 测试参数提取
      const extractedParams = intentService.extractParameters(problemQuery, matchedIntent);
      console.log(`📊 提取参数:`, extractedParams);
      
      // 测试完整处理
      console.log('\n🔄 测试完整处理...');
      const result = await intentService.processQuery(problemQuery);
      console.log(`处理结果:`);
      console.log(`   成功: ${result.success}`);
      console.log(`   来源: ${result.source}`);
      console.log(`   服务: ${result.service || '未知'}`);
      
    } else {
      console.log('❌ 未找到匹配的意图');
      
      // 分析为什么没有匹配
      console.log('\n🔍 分析匹配失败原因:');
      const queryLower = problemQuery.toLowerCase();
      console.log(`查询词: ${queryLower}`);
      
      intentService.intentRules.forEach((rule, index) => {
        const triggerWords = Array.isArray(rule.trigger_words) ? rule.trigger_words : JSON.parse(rule.trigger_words || '[]');
        let score = 0;
        const matchedWords = [];
        
        triggerWords.forEach(word => {
          if (queryLower.includes(word.toLowerCase())) {
            score += 10;
            matchedWords.push(word);
          }
        });
        
        if (score > 0) {
          console.log(`规则 ${index + 1}: ${rule.intent_name}`);
          console.log(`   匹配分数: ${score}`);
          console.log(`   匹配词: ${matchedWords.join(', ')}`);
          console.log(`   优先级: ${rule.priority}`);
        }
      });
    }
    
    // 测试相关的其他查询
    console.log('\n🧪 测试相关查询:');
    const relatedQueries = [
      '重庆工厂生产效率',
      '重庆工厂的产能分析',
      '重庆工厂缺陷率',
      '重庆工厂库存',
      '生产情况'
    ];
    
    for (const query of relatedQueries) {
      console.log(`\n🔍 测试: "${query}"`);
      const intent = intentService.identifyIntent(query);
      if (intent) {
        console.log(`   ✅ 匹配: ${intent.intent_name} (优先级: ${intent.priority})`);
      } else {
        console.log(`   ❌ 无匹配`);
      }
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugProductionQuery();
