import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalRulesValidation() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🎯 最终规则验证...\n');
    
    // 获取所有规则
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
    
    console.log(`📊 规则总数: ${rules.length}条\n`);
    
    const results = {
      logicDesign: { passed: 0, failed: 0, issues: [] },
      functionality: { passed: 0, failed: 0, issues: [] },
      completeness: { passed: 0, failed: 0, issues: [] }
    };
    
    for (const rule of rules) {
      console.log(`📝 验证规则: ${rule.intent_name}`);
      
      // 检查1: 逻辑设计完整性
      const logicCheck = checkLogicCompleteness(rule);
      if (logicCheck.passed) {
        results.logicDesign.passed++;
        console.log('   ✅ 逻辑设计: 完整');
      } else {
        results.logicDesign.failed++;
        results.logicDesign.issues.push({
          rule: rule.intent_name,
          issues: logicCheck.issues
        });
        console.log('   ❌ 逻辑设计: 不完整');
        logicCheck.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      // 检查2: SQL功能性
      const functionalityCheck = await checkSQLFunctionality(rule, connection);
      if (functionalityCheck.passed) {
        results.functionality.passed++;
        console.log('   ✅ SQL功能: 正常');
      } else {
        results.functionality.failed++;
        results.functionality.issues.push({
          rule: rule.intent_name,
          issues: functionalityCheck.issues
        });
        console.log('   ❌ SQL功能: 异常');
        functionalityCheck.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      // 检查3: 规则完整性
      const completenessCheck = checkRuleCompleteness(rule);
      if (completenessCheck.passed) {
        results.completeness.passed++;
        console.log('   ✅ 规则完整性: 完整');
      } else {
        results.completeness.failed++;
        results.completeness.issues.push({
          rule: rule.intent_name,
          issues: completenessCheck.issues
        });
        console.log('   ❌ 规则完整性: 不完整');
        completenessCheck.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      console.log('');
    }
    
    // 生成最终报告
    generateFinalReport(results, rules.length);
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await connection.end();
  }
}

// 检查逻辑设计完整性
function checkLogicCompleteness(rule) {
  const issues = [];
  
  // 检查触发词
  if (!rule.trigger_words) {
    issues.push('缺少触发词');
  } else {
    try {
      const triggerWords = typeof rule.trigger_words === 'string' 
        ? JSON.parse(rule.trigger_words) 
        : rule.trigger_words;
      if (!Array.isArray(triggerWords) || triggerWords.length === 0) {
        issues.push('触发词格式错误或为空');
      }
    } catch (error) {
      issues.push('触发词JSON格式错误');
    }
  }
  
  // 检查示例查询
  if (!rule.example_query || rule.example_query.trim() === '') {
    issues.push('缺少示例查询');
  }
  
  // 检查描述
  if (!rule.description || rule.description.trim() === '') {
    issues.push('缺少规则描述');
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}

// 检查SQL功能性
async function checkSQLFunctionality(rule, connection) {
  const issues = [];
  
  if (rule.action_type === 'database_query' && rule.action_target) {
    try {
      let sql = rule.action_target.trim();
      
      // 如果SQL已经有LIMIT，就直接执行，否则添加LIMIT 1
      if (!sql.toUpperCase().includes('LIMIT')) {
        sql += ' LIMIT 1';
      }
      
      await connection.execute(sql);
    } catch (error) {
      issues.push(`SQL执行失败: ${error.message}`);
    }
  } else if (!rule.action_target) {
    issues.push('缺少SQL查询语句');
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}

// 检查规则完整性
function checkRuleCompleteness(rule) {
  const issues = [];
  
  // 检查分类
  if (!rule.category || rule.category.trim() === '') {
    issues.push('缺少分类');
  }
  
  // 检查状态
  if (!rule.status || rule.status !== 'active') {
    issues.push('规则状态非活跃');
  }
  
  // 检查动作类型
  if (!rule.action_type) {
    issues.push('缺少动作类型');
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}

// 生成最终报告
function generateFinalReport(results, totalRules) {
  console.log('📊 最终验证报告\n');
  console.log('=' .repeat(60));
  
  console.log(`\n📈 总体统计:`);
  console.log(`  规则总数: ${totalRules}条`);
  
  console.log(`\n🔍 逻辑设计完整性:`);
  console.log(`  ✅ 通过: ${results.logicDesign.passed}条`);
  console.log(`  ❌ 失败: ${results.logicDesign.failed}条`);
  console.log(`  通过率: ${((results.logicDesign.passed / totalRules) * 100).toFixed(1)}%`);
  
  console.log(`\n⚙️ SQL功能性:`);
  console.log(`  ✅ 通过: ${results.functionality.passed}条`);
  console.log(`  ❌ 失败: ${results.functionality.failed}条`);
  console.log(`  通过率: ${((results.functionality.passed / totalRules) * 100).toFixed(1)}%`);
  
  console.log(`\n📋 规则完整性:`);
  console.log(`  ✅ 通过: ${results.completeness.passed}条`);
  console.log(`  ❌ 失败: ${results.completeness.failed}条`);
  console.log(`  通过率: ${((results.completeness.passed / totalRules) * 100).toFixed(1)}%`);
  
  // 计算总体质量分数
  const totalPassed = results.logicDesign.passed + results.functionality.passed + results.completeness.passed;
  const totalChecks = totalRules * 3;
  const overallScore = ((totalPassed / totalChecks) * 100).toFixed(1);
  
  console.log(`\n🎯 总体质量评分: ${overallScore}%`);
  
  if (overallScore >= 90) {
    console.log('🎉 优秀！规则库质量很高');
  } else if (overallScore >= 80) {
    console.log('👍 良好！规则库质量较好');
  } else if (overallScore >= 70) {
    console.log('⚠️  一般！需要进一步优化');
  } else {
    console.log('❌ 较差！需要大幅改进');
  }
  
  // 显示剩余问题
  if (results.functionality.failed > 0) {
    console.log(`\n❌ SQL功能问题 (${results.functionality.failed}条):`);
    results.functionality.issues.slice(0, 5).forEach(item => {
      console.log(`  - ${item.rule}: ${item.issues[0]}`);
    });
    if (results.functionality.issues.length > 5) {
      console.log(`  ... 还有${results.functionality.issues.length - 5}条`);
    }
  }
  
  console.log('\n🚀 修复建议:');
  if (results.functionality.failed > 0) {
    console.log('1. 优先修复SQL执行失败的规则');
  }
  if (results.logicDesign.failed > 0) {
    console.log('2. 补充缺失的触发词和示例查询');
  }
  if (results.completeness.failed > 0) {
    console.log('3. 完善规则的基本信息');
  }
  
  console.log('\n✅ 最终验证完成！');
}

finalRulesValidation();
