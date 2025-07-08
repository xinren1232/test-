/**
 * 检查规则详细信息
 */

import fetch from 'node-fetch';

async function checkRuleDetails() {
  try {
    console.log('🔍 获取规则详细信息...\n');
    
    const response = await fetch('http://localhost:3001/api/assistant/rules');
    const result = await response.json();
    
    if (result.success && result.rules) {
      console.log('📋 检查前5条规则的详细信息:\n');
      
      result.rules.slice(0, 5).forEach((rule, index) => {
        console.log(`规则 ${index + 1}: ${rule.intent_name}`);
        console.log(`  描述: ${rule.description || '无'}`);
        console.log(`  示例查询: ${rule.example_query || '无'}`);
        console.log(`  参数: ${rule.parameters || '无'}`);
        console.log(`  参数类型: ${typeof rule.parameters}`);
        console.log(`  动作目标: ${rule.action_target?.substring(0, 100) || '无'}...`);
        console.log('');
      });
      
      // 检查参数格式问题
      console.log('🔧 分析参数格式问题:\n');
      
      const problemRules = result.rules.filter(rule => {
        if (!rule.parameters || rule.parameters === '[]' || rule.parameters === 'null') {
          return false;
        }
        
        try {
          const params = typeof rule.parameters === 'string' ? JSON.parse(rule.parameters) : rule.parameters;
          return !Array.isArray(params);
        } catch (e) {
          return true;
        }
      });
      
      console.log(`发现 ${problemRules.length} 条规则有参数格式问题:`);
      problemRules.slice(0, 3).forEach(rule => {
        console.log(`- ${rule.intent_name}: ${rule.parameters}`);
      });
      
    } else {
      console.log('❌ 无法获取规则列表:', result.message);
    }
  } catch (error) {
    console.log('❌ 检查失败:', error.message);
  }
}

checkRuleDetails();
