import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 最终优化报告和验证
 * 生成完整的规则系统优化成果报告
 */

async function generateFinalOptimizationReport() {
  try {
    console.log('📊 生成最终优化报告...\n');
    
    // 1. 获取所有规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY intent_name
    `);
    
    console.log(`📋 总规则数: ${allRules.length}\n`);
    
    // 2. 全面测试所有规则
    console.log('🧪 全面测试所有规则...');
    const testResults = await testAllRules(allRules);
    
    // 3. 按场景分析成功率
    console.log('\n📊 按场景分析成功率:');
    const scenarioResults = await analyzeByScenario(allRules);
    
    // 4. 生成详细报告
    console.log('\n📄 详细优化报告:');
    generateDetailedReport(testResults, scenarioResults);
    
    // 5. 展示成功规则示例
    console.log('\n✅ 成功规则示例:');
    await showSuccessfulExamples(testResults.successfulRules);
    
    // 6. 问题规则分析
    console.log('\n❌ 问题规则分析:');
    analyzeFailedRules(testResults.failedRules);
    
    // 7. 优化建议
    console.log('\n💡 进一步优化建议:');
    generateOptimizationSuggestions(testResults, scenarioResults);
    
    console.log('\n🎉 最终优化报告生成完成！');
    
  } catch (error) {
    console.error('❌ 报告生成过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 测试所有规则
 */
async function testAllRules(rules) {
  const results = {
    total: rules.length,
    successful: 0,
    failed: 0,
    successfulRules: [],
    failedRules: [],
    executionTimes: []
  };
  
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    
    try {
      const startTime = Date.now();
      const [queryResults] = await connection.execute(rule.action_target);
      const executionTime = Date.now() - startTime;
      
      results.successful++;
      results.successfulRules.push({
        ...rule,
        recordCount: queryResults.length,
        executionTime: executionTime,
        fields: queryResults.length > 0 ? Object.keys(queryResults[0]) : []
      });
      results.executionTimes.push(executionTime);
      
    } catch (error) {
      results.failed++;
      results.failedRules.push({
        ...rule,
        error: error.message
      });
    }
    
    // 显示进度
    if ((i + 1) % 20 === 0) {
      console.log(`  进度: ${i + 1}/${rules.length} (${Math.round((i + 1) / rules.length * 100)}%)`);
    }
  }
  
  return results;
}

/**
 * 按场景分析
 */
async function analyzeByScenario(rules) {
  const scenarios = {
    inventory: { total: 0, successful: 0, rules: [] },
    online: { total: 0, successful: 0, rules: [] },
    testing: { total: 0, successful: 0, rules: [] },
    batch: { total: 0, successful: 0, rules: [] },
    other: { total: 0, successful: 0, rules: [] }
  };
  
  for (const rule of rules) {
    const name = rule.intent_name.toLowerCase();
    const sql = rule.action_target.toLowerCase();
    
    let scenario = 'other';
    if ((name.includes('库存') || name.includes('仓库')) && sql.includes('inventory')) {
      scenario = 'inventory';
    } else if (name.includes('上线') && sql.includes('online_tracking')) {
      scenario = 'online';
    } else if ((name.includes('测试') || name.includes('检验')) && sql.includes('lab_tests')) {
      scenario = 'testing';
    } else if (name.includes('批次')) {
      scenario = 'batch';
    }
    
    scenarios[scenario].total++;
    scenarios[scenario].rules.push(rule);
    
    // 测试规则
    try {
      await connection.execute(rule.action_target);
      scenarios[scenario].successful++;
    } catch (error) {
      // 失败
    }
  }
  
  return scenarios;
}

/**
 * 生成详细报告
 */
function generateDetailedReport(testResults, scenarioResults) {
  const successRate = Math.round((testResults.successful / testResults.total) * 100);
  const avgExecutionTime = testResults.executionTimes.length > 0 
    ? Math.round(testResults.executionTimes.reduce((a, b) => a + b, 0) / testResults.executionTimes.length)
    : 0;
  
  console.log(`\n📈 整体成果:`);
  console.log(`  总规则数: ${testResults.total}`);
  console.log(`  成功规则: ${testResults.successful} (${successRate}%)`);
  console.log(`  失败规则: ${testResults.failed} (${Math.round((testResults.failed / testResults.total) * 100)}%)`);
  console.log(`  平均执行时间: ${avgExecutionTime}ms`);
  
  console.log(`\n📊 各场景成功率:`);
  Object.entries(scenarioResults).forEach(([scenario, data]) => {
    const rate = data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0;
    console.log(`  ${scenario}: ${data.successful}/${data.total} (${rate}%)`);
  });
}

/**
 * 展示成功规则示例
 */
async function showSuccessfulExamples(successfulRules) {
  // 按场景选择示例
  const examplesByScenario = {
    inventory: [],
    online: [],
    testing: [],
    batch: [],
    other: []
  };
  
  successfulRules.forEach(rule => {
    const name = rule.intent_name.toLowerCase();
    const sql = rule.action_target.toLowerCase();
    
    if ((name.includes('库存') || name.includes('仓库')) && sql.includes('inventory')) {
      examplesByScenario.inventory.push(rule);
    } else if (name.includes('上线') && sql.includes('online_tracking')) {
      examplesByScenario.online.push(rule);
    } else if ((name.includes('测试') || name.includes('检验')) && sql.includes('lab_tests')) {
      examplesByScenario.testing.push(rule);
    } else if (name.includes('批次')) {
      examplesByScenario.batch.push(rule);
    } else {
      examplesByScenario.other.push(rule);
    }
  });
  
  // 每个场景显示一个示例
  for (const [scenario, rules] of Object.entries(examplesByScenario)) {
    if (rules.length > 0) {
      const example = rules[0];
      console.log(`\n📋 ${scenario}场景示例 - ${example.intent_name}:`);
      console.log(`  记录数: ${example.recordCount}`);
      console.log(`  执行时间: ${example.executionTime}ms`);
      console.log(`  字段数: ${example.fields.length}`);
      console.log(`  字段: ${example.fields.slice(0, 5).join(', ')}${example.fields.length > 5 ? '...' : ''}`);
    }
  }
}

/**
 * 分析失败规则
 */
function analyzeFailedRules(failedRules) {
  // 按错误类型分组
  const errorTypes = {};
  
  failedRules.forEach(rule => {
    const errorMsg = rule.error.substring(0, 50);
    if (!errorTypes[errorMsg]) {
      errorTypes[errorMsg] = [];
    }
    errorTypes[errorMsg].push(rule.intent_name);
  });
  
  console.log(`\n📊 错误类型分析:`);
  Object.entries(errorTypes).forEach(([error, rules]) => {
    console.log(`  ${error}... (${rules.length}个规则)`);
    if (rules.length <= 3) {
      rules.forEach(ruleName => console.log(`    - ${ruleName}`));
    } else {
      rules.slice(0, 2).forEach(ruleName => console.log(`    - ${ruleName}`));
      console.log(`    - ... 还有${rules.length - 2}个规则`);
    }
  });
}

/**
 * 生成优化建议
 */
function generateOptimizationSuggestions(testResults, scenarioResults) {
  const suggestions = [];
  
  // 基于成功率生成建议
  const successRate = (testResults.successful / testResults.total) * 100;
  
  if (successRate < 60) {
    suggestions.push('🔧 继续修复SQL语法错误，目标成功率达到80%+');
  } else if (successRate < 80) {
    suggestions.push('⚡ 优化查询性能，添加数据库索引');
  } else {
    suggestions.push('🎯 系统已达到良好状态，可进行功能扩展');
  }
  
  // 基于场景分析生成建议
  Object.entries(scenarioResults).forEach(([scenario, data]) => {
    const rate = data.total > 0 ? (data.successful / data.total) * 100 : 0;
    if (rate < 80 && data.total > 0) {
      suggestions.push(`📋 重点优化${scenario}场景规则 (当前${Math.round(rate)}%)`);
    }
  });
  
  // 基于性能生成建议
  const avgTime = testResults.executionTimes.length > 0 
    ? testResults.executionTimes.reduce((a, b) => a + b, 0) / testResults.executionTimes.length
    : 0;
  
  if (avgTime > 1000) {
    suggestions.push('⚡ 查询平均耗时较长，建议添加数据库索引');
  }
  
  suggestions.forEach((suggestion, index) => {
    console.log(`  ${index + 1}. ${suggestion}`);
  });
  
  if (suggestions.length === 0) {
    console.log('  🎉 系统已达到优秀状态，无需进一步优化！');
  }
}

// 执行报告生成
generateFinalOptimizationReport();
