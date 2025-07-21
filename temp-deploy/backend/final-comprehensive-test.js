import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalComprehensiveTest() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🎯 IQE规则库最终综合测试\n');
    console.log('=' .repeat(60));
    
    // 1. 获取所有规则
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        description,
        action_type,
        action_target,
        trigger_words,
        example_query,
        category,
        status
      FROM nlp_intent_rules 
      ORDER BY category, intent_name
    `);
    
    console.log(`\n📊 规则库概况:`);
    console.log(`  规则总数: ${rules.length}条`);
    
    // 2. 按分类统计
    const categoryStats = {};
    rules.forEach(rule => {
      const category = rule.category || '未分类';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    console.log(`\n📋 分类统计:`);
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}条`);
    });
    
    // 3. 测试结果统计
    const testResults = {
      logicComplete: 0,
      sqlWorking: 0,
      ruleComplete: 0,
      total: rules.length
    };
    
    const failedRules = [];
    
    console.log(`\n🔍 开始逐个测试规则:\n`);
    
    for (const rule of rules) {
      console.log(`📝 测试: ${rule.intent_name} (${rule.category})`);
      
      // 测试1: 逻辑完整性
      let logicComplete = true;
      if (!rule.trigger_words) {
        logicComplete = false;
        console.log('   ❌ 缺少触发词');
      }
      if (!rule.example_query) {
        logicComplete = false;
        console.log('   ❌ 缺少示例查询');
      }
      if (!rule.description) {
        logicComplete = false;
        console.log('   ❌ 缺少描述');
      }
      
      if (logicComplete) {
        testResults.logicComplete++;
        console.log('   ✅ 逻辑完整');
      }
      
      // 测试2: SQL功能性
      let sqlWorking = false;
      if (rule.action_target) {
        try {
          let testSQL = rule.action_target.trim();
          
          // 替换参数占位符
          testSQL = testSQL.replace(/\?/g, "'test'");
          
          // 添加LIMIT如果没有
          if (!testSQL.toUpperCase().includes('LIMIT')) {
            testSQL += ' LIMIT 1';
          }
          
          await connection.execute(testSQL);
          sqlWorking = true;
          testResults.sqlWorking++;
          console.log('   ✅ SQL执行成功');
        } catch (error) {
          console.log(`   ❌ SQL错误: ${error.message.substring(0, 50)}...`);
          failedRules.push({
            name: rule.intent_name,
            category: rule.category,
            error: error.message
          });
        }
      } else {
        console.log('   ❌ 缺少SQL语句');
      }
      
      // 测试3: 规则完整性
      let ruleComplete = true;
      if (!rule.category) {
        ruleComplete = false;
        console.log('   ❌ 缺少分类');
      }
      if (rule.status !== 'active') {
        ruleComplete = false;
        console.log('   ❌ 状态非活跃');
      }
      
      if (ruleComplete) {
        testResults.ruleComplete++;
        console.log('   ✅ 规则完整');
      }
      
      console.log('');
    }
    
    // 4. 生成最终测试报告
    generateFinalTestReport(testResults, failedRules, categoryStats);
    
    // 5. 生成修复建议
    generateFixRecommendations(failedRules);
    
    return testResults;
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return null;
  } finally {
    await connection.end();
  }
}

function generateFinalTestReport(results, failedRules, categoryStats) {
  console.log('📊 最终测试报告\n');
  console.log('=' .repeat(60));
  
  // 计算通过率
  const logicRate = ((results.logicComplete / results.total) * 100).toFixed(1);
  const sqlRate = ((results.sqlWorking / results.total) * 100).toFixed(1);
  const ruleRate = ((results.ruleComplete / results.total) * 100).toFixed(1);
  
  console.log(`\n📈 测试结果统计:`);
  console.log(`  规则总数: ${results.total}条`);
  console.log(`  逻辑完整性: ${results.logicComplete}/${results.total} (${logicRate}%)`);
  console.log(`  SQL功能性: ${results.sqlWorking}/${results.total} (${sqlRate}%)`);
  console.log(`  规则完整性: ${results.ruleComplete}/${results.total} (${ruleRate}%)`);
  
  // 计算总体质量分数
  const overallScore = ((results.logicComplete + results.sqlWorking + results.ruleComplete) / (results.total * 3) * 100).toFixed(1);
  
  console.log(`\n🎯 总体质量评分: ${overallScore}%`);
  
  // 质量等级评定
  if (overallScore >= 95) {
    console.log('🏆 A+级 - 优秀！规则库质量极高，可以投入生产使用！');
  } else if (overallScore >= 90) {
    console.log('🥇 A级 - 优秀！规则库质量很高，基本可以投入使用！');
  } else if (overallScore >= 85) {
    console.log('🥈 B+级 - 良好！规则库质量较高，大部分功能可用！');
  } else if (overallScore >= 80) {
    console.log('🥉 B级 - 良好！规则库质量尚可，需要小幅优化！');
  } else if (overallScore >= 70) {
    console.log('⚠️  C级 - 一般！规则库需要进一步优化！');
  } else {
    console.log('❌ D级 - 较差！规则库需要大幅改进！');
  }
  
  // 按分类显示问题统计
  console.log(`\n📋 分类问题统计:`);
  const categoryIssues = {};
  failedRules.forEach(rule => {
    const category = rule.category || '未分类';
    categoryIssues[category] = (categoryIssues[category] || 0) + 1;
  });
  
  Object.entries(categoryStats).forEach(([category, total]) => {
    const issues = categoryIssues[category] || 0;
    const successRate = ((total - issues) / total * 100).toFixed(1);
    console.log(`  ${category}: ${total - issues}/${total} 成功 (${successRate}%)`);
  });
}

function generateFixRecommendations(failedRules) {
  console.log(`\n🔧 修复建议 (${failedRules.length}条问题规则):\n`);
  
  if (failedRules.length === 0) {
    console.log('🎉 恭喜！所有规则都已正常工作！');
    return;
  }
  
  // 按错误类型分组
  const errorTypes = {};
  failedRules.forEach(rule => {
    const errorType = getErrorType(rule.error);
    if (!errorTypes[errorType]) {
      errorTypes[errorType] = [];
    }
    errorTypes[errorType].push(rule);
  });
  
  console.log('🚨 问题类型分析:');
  Object.entries(errorTypes).forEach(([errorType, rules]) => {
    console.log(`\n${errorType} (${rules.length}条):`);
    rules.slice(0, 3).forEach(rule => {
      console.log(`  - ${rule.name} (${rule.category})`);
    });
    if (rules.length > 3) {
      console.log(`  ... 还有${rules.length - 3}条`);
    }
  });
  
  console.log('\n💡 修复优先级建议:');
  console.log('1. 🔴 高优先级: 修复SQL语法错误的规则');
  console.log('2. 🟡 中优先级: 修复字段不存在的规则');
  console.log('3. 🟢 低优先级: 优化GROUP BY和聚合函数的规则');
  
  console.log('\n🛠️  具体修复方案:');
  console.log('1. 检查数据库表结构，确认字段名称');
  console.log('2. 修复SQL语法，特别是GROUP BY子句');
  console.log('3. 统一字段别名，避免中文字段名冲突');
  console.log('4. 使用参数化查询，避免SQL注入');
  console.log('5. 建立SQL模板库，标准化查询格式');
}

function getErrorType(errorMessage) {
  if (errorMessage.includes('Unknown column')) {
    return '🔍 字段不存在错误';
  } else if (errorMessage.includes('GROUP BY clause')) {
    return '📊 GROUP BY语法错误';
  } else if (errorMessage.includes('SQL syntax')) {
    return '⚠️  SQL语法错误';
  } else if (errorMessage.includes('Malformed communication packet')) {
    return '📡 通信包错误';
  } else if (errorMessage.includes('Assignment to constant variable')) {
    return '🔧 JavaScript执行错误';
  } else {
    return '❓ 其他错误';
  }
}

// 运行最终测试
console.log('🚀 启动IQE规则库最终综合测试...\n');
finalComprehensiveTest().then(results => {
  if (results) {
    console.log('\n✅ 测试完成！');
    console.log('\n📋 后续建议:');
    console.log('1. 根据修复建议优化剩余问题规则');
    console.log('2. 建立规则质量监控机制');
    console.log('3. 定期进行规则库健康检查');
    console.log('4. 为新规则建立标准化模板');
  }
}).catch(error => {
  console.error('❌ 测试异常:', error);
});
