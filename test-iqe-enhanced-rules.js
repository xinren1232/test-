/**
 * 测试IQE增强规则体系
 * 验证新设计的规则覆盖度和准确性
 */

import { allRules } from './backend/src/services/iqeEnhancedNLPRules.js';

// 测试用例分类
const testCases = {
  // 1. 基础库存查询
  inventory_basic: [
    "查询深圳工厂的库存",
    "BOE供应商有哪些物料",
    "查询OLED显示屏的库存",
    "批次TK240601的库存信息",
    "A区仓库的物料",
    "查询数量大于1000的库存"
  ],
  
  // 2. 基础生产查询
  production_basic: [
    "深圳工厂的生产情况",
    "项目PRJ_001的生产记录",
    "基线I6789的上线情况",
    "查询不良率超过3%的记录",
    "有装配不良的批次"
  ],
  
  // 3. 基础测试查询
  inspection_basic: [
    "查询测试失败的记录",
    "今天的测试情况",
    "项目PRJ_001的测试记录",
    "PASS的测试结果"
  ],
  
  // 4. 状态分析查询
  status_analysis: [
    "目前有哪些风险库存？",
    "查询冻结状态的物料",
    "有哪些高不良率的生产记录？",
    "测试失败的批次"
  ],
  
  // 5. 汇总统计查询
  summary_analysis: [
    "工厂数据汇总",
    "供应商汇总统计",
    "系统数据总览",
    "整体数据统计"
  ],
  
  // 6. 全链路追溯
  trace_analysis: [
    "批次TK240601的全链路追溯",
    "追溯批次SS240602",
    "批次完整跟踪"
  ],
  
  // 7. 复杂组合查询
  complex_queries: [
    "深圳工厂BOE供应商的风险库存",
    "项目PRJ_001中不良率高的物料",
    "聚龙供应商测试失败的批次",
    "上海工厂冻结状态的物料"
  ]
};

// 简化的意图匹配函数
function matchIntent(queryText, rules) {
  const queryLower = queryText.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  
  for (const rule of rules) {
    let score = 0;
    
    // 关键词匹配
    for (const keyword of rule.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    // 示例匹配
    for (const example of rule.examples) {
      const similarity = calculateSimilarity(queryLower, example.toLowerCase());
      if (similarity > 0.7) {
        score += 2;
      } else if (similarity > 0.5) {
        score += 1;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }
  
  return { rule: bestMatch, score: bestScore };
}

// 简单的相似度计算
function calculateSimilarity(str1, str2) {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let commonWords = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1)) {
        commonWords++;
        break;
      }
    }
  }
  
  return commonWords / Math.max(words1.length, words2.length);
}

// 测试规则匹配
function testRuleMatching() {
  console.log("🧪 测试IQE增强规则体系");
  console.log("=" .repeat(60));
  console.log(`📋 总规则数: ${allRules.length}条\n`);
  
  let totalTests = 0;
  let successfulMatches = 0;
  let categoryResults = {};
  
  for (const [category, queries] of Object.entries(testCases)) {
    console.log(`📂 ${category.toUpperCase()} (${queries.length}个测试)`);
    console.log("-" .repeat(40));
    
    let categorySuccess = 0;
    
    for (const query of queries) {
      totalTests++;
      const result = matchIntent(query, allRules);
      
      if (result.rule && result.score > 0) {
        successfulMatches++;
        categorySuccess++;
        console.log(`✅ "${query}"`);
        console.log(`   → ${result.rule.intent} (分数: ${result.score})`);
        console.log(`   → ${result.rule.description}`);
      } else {
        console.log(`❌ "${query}"`);
        console.log(`   → 未找到匹配规则`);
      }
      console.log();
    }
    
    const categoryRate = (categorySuccess / queries.length * 100).toFixed(1);
    categoryResults[category] = {
      total: queries.length,
      success: categorySuccess,
      rate: categoryRate
    };
    
    console.log(`📊 ${category} 匹配率: ${categoryRate}% (${categorySuccess}/${queries.length})\n`);
  }
  
  // 总体统计
  const overallRate = (successfulMatches / totalTests * 100).toFixed(1);
  
  console.log("📈 测试结果汇总");
  console.log("=" .repeat(60));
  console.log(`总测试用例: ${totalTests}个`);
  console.log(`成功匹配: ${successfulMatches}个`);
  console.log(`整体匹配率: ${overallRate}%\n`);
  
  console.log("📊 分类匹配率:");
  for (const [category, result] of Object.entries(categoryResults)) {
    console.log(`${category}: ${result.rate}% (${result.success}/${result.total})`);
  }
  
  // 规则覆盖度分析
  console.log("\n🔍 规则覆盖度分析:");
  const usedIntents = new Set();
  for (const query of Object.values(testCases).flat()) {
    const result = matchIntent(query, allRules);
    if (result.rule) {
      usedIntents.add(result.rule.intent);
    }
  }
  
  const coverageRate = (usedIntents.size / allRules.length * 100).toFixed(1);
  console.log(`规则覆盖率: ${coverageRate}% (${usedIntents.size}/${allRules.length})`);
  
  // 未覆盖的规则
  const uncoveredRules = allRules.filter(rule => !usedIntents.has(rule.intent));
  if (uncoveredRules.length > 0) {
    console.log("\n⚠️ 未覆盖的规则:");
    uncoveredRules.forEach(rule => {
      console.log(`- ${rule.intent}: ${rule.description}`);
    });
  }
  
  return {
    totalTests,
    successfulMatches,
    overallRate,
    categoryResults,
    coverageRate,
    uncoveredRules: uncoveredRules.length
  };
}

// 运行测试
const testResults = testRuleMatching();

// 输出建议
console.log("\n💡 优化建议:");
if (testResults.overallRate < 80) {
  console.log("- 整体匹配率偏低，建议增加更多关键词和示例");
}
if (testResults.coverageRate < 70) {
  console.log("- 规则覆盖率偏低，建议增加更多测试用例");
}
if (testResults.uncoveredRules > 5) {
  console.log("- 存在较多未覆盖规则，建议检查规则设计的实用性");
}

console.log("\n🎯 下一步行动:");
console.log("1. 优化匹配率低的规则类别");
console.log("2. 为未覆盖的规则添加测试用例");
console.log("3. 实现规则处理函数");
console.log("4. 集成到现有系统中");
