/**
 * 最终规则测试 - 验证修复效果
 */

import fetch from 'node-fetch';

async function testFinalRules() {
  console.log('🎯 最终规则测试 - 验证修复效果\n');
  
  try {
    // 1. 获取规则列表
    console.log('📋 1. 获取规则列表...');
    const rulesResponse = await fetch('http://localhost:3001/api/assistant/rules');
    const rulesResult = await rulesResponse.json();
    
    if (!rulesResult.success) {
      console.log('❌ 获取规则失败:', rulesResult.message);
      return;
    }
    
    console.log(`✅ 成功获取 ${rulesResult.rules.length} 条规则\n`);
    
    // 2. 分类统计
    const rules = rulesResult.rules;
    const basicRules = rules.filter(rule => {
      const name = rule.intent_name.toLowerCase();
      return name.includes('查询') && !name.includes('统计') && !name.includes('分析') && !name.includes('对比');
    });
    
    const analysisRules = rules.filter(rule => {
      const name = rule.intent_name.toLowerCase();
      return name.includes('统计') || name.includes('分析') || name.includes('预警');
    });
    
    const complexRules = rules.filter(rule => {
      const name = rule.intent_name.toLowerCase();
      return name.includes('对比') || name.includes('排名') || name.includes('追踪') || name.includes('趋势');
    });
    
    console.log('📊 2. 规则分类统计:');
    console.log(`   基础查询规则: ${basicRules.length} 条`);
    console.log(`   统计分析规则: ${analysisRules.length} 条`);
    console.log(`   复杂查询规则: ${complexRules.length} 条`);
    console.log(`   总计: ${basicRules.length + analysisRules.length + complexRules.length} 条\n`);
    
    // 3. 参数格式检查
    console.log('🔧 3. 参数格式检查:');
    let validParams = 0;
    let invalidParams = 0;
    
    rules.forEach(rule => {
      try {
        if (rule.parameters && rule.parameters !== 'null' && rule.parameters !== '[]') {
          const params = typeof rule.parameters === 'string' ? JSON.parse(rule.parameters) : rule.parameters;
          if (Array.isArray(params) && params.length > 0) {
            validParams++;
          } else {
            invalidParams++;
          }
        } else {
          // 无参数规则也算正常
          validParams++;
        }
      } catch (error) {
        console.log(`   ❌ ${rule.intent_name}: 参数格式错误`);
        invalidParams++;
      }
    });
    
    console.log(`   ✅ 参数格式正常: ${validParams} 条`);
    console.log(`   ❌ 参数格式异常: ${invalidParams} 条`);
    console.log(`   📊 参数格式正确率: ${Math.round((validParams / rules.length) * 100)}%\n`);
    
    // 4. 功能测试
    console.log('🧪 4. 功能测试 (测试前5条规则):');
    
    const testQueries = [
      '深圳工厂的库存情况',
      '查询测试结果为PASS的记录',
      '统计测试结果',
      '分析生产效率',
      '查询供应商信息'
    ];
    
    let successCount = 0;
    
    for (let i = 0; i < Math.min(5, testQueries.length); i++) {
      const query = testQueries[i];
      console.log(`   🔍 测试查询: "${query}"`);
      
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        
        const result = await response.json();
        
        if (result.reply && result.matchedRule) {
          console.log(`     ✅ 成功 - 匹配规则: ${result.matchedRule}`);
          console.log(`     📄 回复: ${result.reply.substring(0, 50)}...`);
          successCount++;
        } else {
          console.log(`     ❌ 失败 - 无匹配规则或回复`);
        }
      } catch (error) {
        console.log(`     ❌ 异常 - ${error.message}`);
      }
    }
    
    console.log(`\n📊 功能测试结果: ${successCount}/5 成功 (${Math.round((successCount / 5) * 100)}%)\n`);
    
    // 5. 总结
    console.log('🎉 测试总结:');
    console.log(`✅ 规则总数: ${rules.length} 条`);
    console.log(`✅ 参数格式正确率: ${Math.round((validParams / rules.length) * 100)}%`);
    console.log(`✅ 功能测试成功率: ${Math.round((successCount / 5) * 100)}%`);
    
    if (validParams === rules.length && successCount >= 4) {
      console.log('\n🎊 恭喜！规则系统已完全修复并正常工作！');
    } else if (validParams === rules.length) {
      console.log('\n✅ 参数格式问题已完全修复！');
    } else {
      console.log('\n⚠️ 仍有部分问题需要解决');
    }
    
  } catch (error) {
    console.log('❌ 测试过程出错:', error.message);
  }
}

// 执行测试
testFinalRules();
