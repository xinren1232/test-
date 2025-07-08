/**
 * 全方位检查规则库 - 从逻辑设计到功能检测
 */

import fetch from 'node-fetch';

async function comprehensiveRuleCheck() {
  console.log('🔍 开始全方位规则检查...\n');
  
  try {
    // 1. 获取规则列表
    console.log('📋 步骤1: 获取规则列表');
    const response = await fetch('http://localhost:3001/api/assistant/rules');
    const result = await response.json();
    
    if (!result.success || !result.rules) {
      console.log('❌ 无法获取规则列表:', result.message);
      return;
    }
    
    const rules = result.rules;
    console.log(`✅ 获取到 ${rules.length} 条规则\n`);
    
    // 2. 规则统计分析
    console.log('📊 步骤2: 规则统计分析');
    analyzeRuleStatistics(rules);
    
    // 3. 规则逻辑设计检查
    console.log('\n🔧 步骤3: 规则逻辑设计检查');
    await checkRuleLogicDesign(rules);
    
    // 4. 规则功能测试
    console.log('\n🧪 步骤4: 规则功能测试');
    await testRuleFunctionality(rules.slice(0, 10)); // 测试前10条规则
    
    // 5. 数据一致性验证
    console.log('\n📊 步骤5: 数据一致性验证');
    await validateDataConsistency();
    
    console.log('\n🎉 全方位规则检查完成！');
    
  } catch (error) {
    console.log('❌ 检查过程出错:', error.message);
  }
}

function analyzeRuleStatistics(rules) {
  // 按状态分类
  const activeRules = rules.filter(r => r.status === 'active');
  const inactiveRules = rules.filter(r => r.status !== 'active');
  
  // 按动作类型分类
  const sqlRules = rules.filter(r => r.action_type === 'SQL_QUERY');
  const funcRules = rules.filter(r => r.action_type === 'FUNCTION_CALL');
  
  // 按参数复杂度分类
  const noParamRules = rules.filter(r => !r.parameters || r.parameters === '[]' || r.parameters === 'null');
  const withParamRules = rules.filter(r => r.parameters && r.parameters !== '[]' && r.parameters !== 'null');
  
  console.log('📊 规则统计:');
  console.log(`  总规则数: ${rules.length}`);
  console.log(`  启用规则: ${activeRules.length} (${Math.round(activeRules.length/rules.length*100)}%)`);
  console.log(`  禁用规则: ${inactiveRules.length} (${Math.round(inactiveRules.length/rules.length*100)}%)`);
  console.log(`  SQL查询规则: ${sqlRules.length} (${Math.round(sqlRules.length/rules.length*100)}%)`);
  console.log(`  函数调用规则: ${funcRules.length} (${Math.round(funcRules.length/rules.length*100)}%)`);
  console.log(`  无参数规则: ${noParamRules.length} (${Math.round(noParamRules.length/rules.length*100)}%)`);
  console.log(`  有参数规则: ${withParamRules.length} (${Math.round(withParamRules.length/rules.length*100)}%)`);
}

async function checkRuleLogicDesign(rules) {
  let designIssues = 0;
  
  for (const rule of rules) {
    console.log(`🔍 检查规则: ${rule.intent_name}`);
    
    // 检查必要字段
    const issues = [];
    
    if (!rule.description || rule.description.trim() === '') {
      issues.push('缺少描述');
    }
    
    if (!rule.example_query || rule.example_query.trim() === '') {
      issues.push('缺少示例查询');
    }
    
    if (!rule.action_target || rule.action_target.trim() === '') {
      issues.push('缺少动作目标');
    }
    
    // 检查SQL语法（基础检查）
    if (rule.action_type === 'SQL_QUERY') {
      const sql = rule.action_target.toLowerCase();
      if (!sql.includes('select')) {
        issues.push('SQL查询缺少SELECT语句');
      }
      if (!sql.includes('from')) {
        issues.push('SQL查询缺少FROM子句');
      }
    }
    
    // 检查参数定义
    if (rule.parameters && rule.parameters !== '[]' && rule.parameters !== 'null') {
      try {
        const params = typeof rule.parameters === 'string' ? JSON.parse(rule.parameters) : rule.parameters;
        if (!Array.isArray(params)) {
          issues.push('参数格式不正确');
        }
      } catch (e) {
        issues.push('参数JSON格式错误');
      }
    }
    
    if (issues.length > 0) {
      console.log(`  ❌ 发现问题: ${issues.join(', ')}`);
      designIssues++;
    } else {
      console.log(`  ✅ 设计正常`);
    }
  }
  
  console.log(`\n📊 设计检查结果: ${rules.length - designIssues}/${rules.length} 规则设计正常`);
}

async function testRuleFunctionality(rules) {
  let functionalRules = 0;
  
  for (const rule of rules) {
    console.log(`🧪 测试规则: ${rule.intent_name}`);
    
    try {
      const testResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: rule.example_query })
      });
      
      const testResult = await testResponse.json();
      
      if (testResult.success && testResult.data) {
        console.log(`  ✅ 功能正常 - 返回 ${testResult.data.length} 条数据`);
        functionalRules++;
      } else {
        console.log(`  ❌ 功能异常 - ${testResult.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`  ❌ 测试失败 - ${error.message}`);
    }
  }
  
  console.log(`\n📊 功能测试结果: ${functionalRules}/${rules.length} 规则功能正常`);
}

async function validateDataConsistency() {
  console.log('🔍 验证数据一致性...');
  
  const testQueries = [
    { name: '库存数据', query: '当前有多少库存记录？' },
    { name: '测试数据', query: '测试记录总数' },
    { name: '生产数据', query: '生产记录统计' },
    { name: '供应商数据', query: '供应商信息' }
  ];
  
  for (const test of testQueries) {
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: test.query })
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`  ✅ ${test.name}: 数据正常 (${result.data.length} 条记录)`);
      } else {
        console.log(`  ❌ ${test.name}: 数据异常`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name}: 验证失败 - ${error.message}`);
    }
  }
}

// 执行检查
comprehensiveRuleCheck();
