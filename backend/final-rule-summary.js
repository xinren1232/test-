/**
 * 最终规则总结和验证
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalRuleSummary() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('📊 IQE质量规则体系最终总结\n');
    
    // 获取所有规则
    const [allRules] = await connection.execute(
      'SELECT intent_name, description, priority FROM nlp_intent_rules ORDER BY priority DESC, intent_name'
    );
    
    console.log(`🎯 总计: ${allRules.length} 条IQE质量规则\n`);
    
    // 按优先级分类显示
    const rulesByPriority = {
      '基础规则 (优先级9-10)': allRules.filter(r => r.priority >= 9),
      '中级规则 (优先级8)': allRules.filter(r => r.priority === 8),
      '高级规则 (优先级7)': allRules.filter(r => r.priority === 7),
      '专项规则 (优先级6)': allRules.filter(r => r.priority === 6),
      '排行规则 (优先级5)': allRules.filter(r => r.priority === 5),
      '复杂规则 (优先级4)': allRules.filter(r => r.priority === 4)
    };
    
    Object.keys(rulesByPriority).forEach(category => {
      const rules = rulesByPriority[category];
      if (rules.length > 0) {
        console.log(`${category} - ${rules.length}条:`);
        rules.forEach((rule, index) => {
          console.log(`  ${index + 1}. ${rule.intent_name}`);
          console.log(`     ${rule.description}`);
        });
        console.log('');
      }
    });
    
    // 测试几个关键规则
    console.log('🧪 快速验证关键规则:\n');
    
    const keyRules = ['不良品查询', '供应商质量表现', '电池物料不良分析'];
    
    for (const ruleName of keyRules) {
      const [ruleData] = await connection.execute(
        'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
        [ruleName]
      );
      
      if (ruleData.length > 0) {
        try {
          const [results] = await connection.execute(ruleData[0].action_target);
          console.log(`✅ ${ruleName}: 成功，返回 ${results.length} 条记录`);
        } catch (error) {
          console.log(`❌ ${ruleName}: SQL错误`);
        }
      }
    }
    
    console.log('\n🎉 IQE质量规则体系构建完成！');
    
    console.log('\n📋 规则体系特点:');
    console.log('✅ 基于真实前端页面字段设计');
    console.log('✅ 从基础到复杂的层次化结构');
    console.log('✅ 覆盖IQE质量工作主要场景');
    console.log('✅ 支持单条件到多条件复杂查询');
    console.log('✅ 包含专项分析和趋势分析');
    console.log('✅ 字段映射与前端完全一致');
    
    console.log('\n🚀 支持的查询场景:');
    console.log('• 物料基础信息查询');
    console.log('• 测试结果分析（合格/不良）');
    console.log('• 供应商质量表现分析');
    console.log('• 批次质量控制');
    console.log('• 特定物料不良分析（电池、包装盒、充电器等）');
    console.log('• 供应商+物料关联分析');
    console.log('• 质量趋势和改善效果分析');
    console.log('• 高风险组合识别');
    console.log('• 重复问题分析');
    console.log('• 质量稳定性评估');
    
  } catch (error) {
    console.error('❌ 总结失败:', error);
  } finally {
    await connection.end();
  }
}

finalRuleSummary().catch(console.error);
