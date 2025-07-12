import IntelligentIntentService from './src/services/intelligentIntentService.js';

async function debugIntelligentIntent() {
  console.log('🔍 调试智能意图服务...\n');
  
  const service = new IntelligentIntentService();
  
  try {
    // 初始化服务
    console.log('1. 初始化智能意图服务...');
    await service.initialize();
    console.log('✅ 初始化成功\n');
    
    // 测试查询
    const testQueries = [
      '查询电池库存',
      '查询BOE供应商的物料',
      '深圳工厂库存情况',
      '查询风险库存'
    ];
    
    for (const query of testQueries) {
      console.log(`📋 测试查询: "${query}"`);
      
      try {
        const result = await service.processQuery(query);
        
        console.log(`  结果:`);
        console.log(`    成功: ${result?.success || false}`);
        console.log(`    意图: ${result?.intent || '未识别'}`);
        console.log(`    匹配规则: ${result?.matchedRule || '无'}`);
        console.log(`    数据条数: ${result?.data ? result.data.length : 0}`);
        
        if (result?.error) {
          console.log(`    错误: ${result.error}`);
        }
        
        if (result?.data && result.data.length > 0) {
          console.log(`    数据示例:`);
          result.data.slice(0, 2).forEach((item, index) => {
            const material = item.物料名称 || item.material_name || '未知';
            const supplier = item.供应商 || item.supplier_name || item.supplier || '未知';
            console.log(`      ${index + 1}. ${material} | ${supplier}`);
          });
        }
        
      } catch (error) {
        console.log(`  ❌ 处理失败: ${error.message}`);
      }
      
      console.log('');
    }
    
    // 测试意图匹配逻辑
    console.log('2. 测试意图匹配逻辑:');
    
    // 直接调用内部的匹配方法（如果可以访问）
    if (service.intentRules && service.intentRules.length > 0) {
      console.log(`  加载了 ${service.intentRules.length} 条规则`);
      
      const testQuery = '查询电池库存';
      console.log(`  测试查询: "${testQuery}"`);
      
      // 手动模拟匹配逻辑
      const queryLower = testQuery.toLowerCase();
      let bestMatch = null;
      let bestScore = 0;
      
      for (const rule of service.intentRules) {
        if (rule.status !== 'active') continue;
        
        let score = 0;
        
        // 解析触发词
        let triggerWords = rule.trigger_words;
        if (typeof triggerWords === 'string' && triggerWords.startsWith('[')) {
          try {
            triggerWords = JSON.parse(triggerWords);
          } catch (e) {
            continue;
          }
        }
        
        if (!Array.isArray(triggerWords)) {
          triggerWords = triggerWords ? triggerWords.split(',').map(w => w.trim()) : [];
        }
        
        // 检查触发词匹配
        const matchedWords = [];
        for (const word of triggerWords) {
          if (queryLower.includes(word.toLowerCase())) {
            score += word.length * 2;
            matchedWords.push(word);
          }
        }
        
        if (score > bestScore && score >= 2) {
          bestScore = score;
          bestMatch = {
            rule: rule,
            score: score,
            matchedWords: matchedWords
          };
        }
      }
      
      if (bestMatch) {
        console.log(`  ✅ 最佳匹配: ${bestMatch.rule.intent_name}`);
        console.log(`     分数: ${bestMatch.score}`);
        console.log(`     匹配词: ${bestMatch.matchedWords.join(', ')}`);
        console.log(`     优先级: ${bestMatch.rule.priority}`);
      } else {
        console.log(`  ❌ 没有找到匹配的规则`);
      }
    } else {
      console.log(`  ⚠️ 没有加载到规则`);
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  }
}

debugIntelligentIntent();
