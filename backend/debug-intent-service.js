/**
 * 调试智能意图服务
 */
import IntelligentIntentService from './src/services/intelligentIntentService.js';

async function debugIntentService() {
  console.log('🐛 调试智能意图服务\n');

  try {
    // 创建智能意图服务实例
    const intentService = new IntelligentIntentService();
    
    // 初始化服务
    console.log('🚀 初始化智能意图服务...');
    await intentService.initialize();
    
    // 检查加载的规则
    console.log('\n📋 已加载的规则:');
    console.log(`规则总数: ${intentService.intentRules.length}`);
    
    for (const rule of intentService.intentRules) {
      console.log(`- ${rule.intent_name}: ${rule.description}`);
      console.log(`  触发词: ${JSON.stringify(rule.trigger_words)}`);
      console.log(`  同义词: ${JSON.stringify(rule.synonyms)}`);
      console.log('');
    }
    
    // 测试查询
    const testQueries = [
      '查询风险状态的库存',
      '查询冻结状态的库存', 
      '分析欣冠供应商的物料情况',
      '风险',
      '冻结',
      '状态'
    ];
    
    console.log('\n🧪 测试查询匹配:');
    for (const query of testQueries) {
      console.log(`\n🔍 测试: "${query}"`);
      
      // 直接调用意图识别方法
      const matchedIntent = intentService.identifyIntent(query);
      
      if (matchedIntent) {
        console.log(`✅ 匹配到意图: ${matchedIntent.intent_name}`);
        console.log(`📊 描述: ${matchedIntent.description}`);
      } else {
        console.log('❌ 未匹配到任何意图');
        
        // 手动检查匹配逻辑
        console.log('🔍 手动检查匹配:');
        const queryLower = query.toLowerCase();
        
        for (const rule of intentService.intentRules) {
          if (rule.status !== 'active') continue;
          
          let score = 0;
          let matchDetails = [];
          
          // 检查触发词匹配
          if (rule.trigger_words && Array.isArray(rule.trigger_words)) {
            const triggerMatches = rule.trigger_words.filter(word => 
              queryLower.includes(word.toLowerCase())
            );
            if (triggerMatches.length > 0) {
              score += triggerMatches.length * 2;
              matchDetails.push(`触发词匹配: ${triggerMatches.join(', ')}`);
            }
          }
          
          // 检查同义词匹配
          if (rule.synonyms) {
            for (const [key, synonyms] of Object.entries(rule.synonyms)) {
              if (queryLower.includes(key.toLowerCase())) {
                score += 2;
                matchDetails.push(`同义词匹配: ${key}`);
              }
              if (Array.isArray(synonyms)) {
                for (const synonym of synonyms) {
                  if (queryLower.includes(synonym.toLowerCase())) {
                    score += 1;
                    matchDetails.push(`同义词匹配: ${synonym}`);
                  }
                }
              }
            }
          }
          
          if (score > 0) {
            console.log(`  规则 ${rule.intent_name}: 得分 ${score}`);
            console.log(`    ${matchDetails.join(', ')}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

// 运行调试
debugIntentService();
