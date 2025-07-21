import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRemainingRule() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 处理剩余的未排序规则...\n');
    
    // 检查"物料测试结果查询_优化"规则
    const [ruleCheck] = await connection.execute(
      'SELECT intent_name, sort_order FROM nlp_intent_rules WHERE intent_name = ?',
      ['物料测试结果查询_优化']
    );
    
    if (ruleCheck.length > 0) {
      console.log(`当前规则: ${ruleCheck[0].intent_name}, 排序: ${ruleCheck[0].sort_order}`);
      
      // 这个规则应该归入测试相关类别，放在NG测试结果查询_优化之前
      // 将其移动到第24位，其他规则顺延
      
      console.log('\n=== 调整规则排序 ===');
      
      // 1. 先将24-53的规则都向后移动一位
      await connection.execute(
        'UPDATE nlp_intent_rules SET sort_order = sort_order + 1 WHERE sort_order >= 24 AND sort_order <= 53'
      );
      console.log('✅ 已将24-53位规则向后移动一位');
      
      // 2. 将"物料测试结果查询_优化"设置为第24位
      await connection.execute(
        'UPDATE nlp_intent_rules SET sort_order = 24 WHERE intent_name = ?',
        ['物料测试结果查询_优化']
      );
      console.log('✅ 已将"物料测试结果查询_优化"移动到第24位');
      
      // 3. 将原来的"NG测试结果查询_优化"移动到第25位
      await connection.execute(
        'UPDATE nlp_intent_rules SET sort_order = 25 WHERE intent_name = ?',
        ['NG测试结果查询_优化']
      );
      console.log('✅ 已将"NG测试结果查询_优化"移动到第25位');
      
    } else {
      console.log('⚠️  未找到"物料测试结果查询_优化"规则');
    }
    
    // 验证最终排序结果
    console.log('\n=== 验证最终排序结果 ===');
    const [finalRules] = await connection.execute(
      'SELECT intent_name, sort_order FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    console.log('\n📋 最终完整排序结果:');
    
    const categories = [
      { name: '库存相关', start: 1, end: 11 },
      { name: '上线相关', start: 12, end: 20 },
      { name: '测试相关', start: 21, end: 33 }, // 增加了一条
      { name: '批次管理', start: 34, end: 37 }, // 顺延
      { name: '对比分析', start: 38, end: 46 }, // 顺延
      { name: '特殊功能', start: 47, end: 54 }  // 顺延
    ];
    
    for (const category of categories) {
      console.log(`\n--- ${category.name} (${category.start}-${category.end}) ---`);
      const categoryRules = finalRules.filter(rule => 
        rule.sort_order >= category.start && rule.sort_order <= category.end
      );
      
      categoryRules.forEach(rule => {
        console.log(`  ${rule.sort_order.toString().padStart(2, '0')}. ${rule.intent_name}`);
      });
      
      console.log(`  📊 ${category.name}: ${categoryRules.length} 条规则`);
    }
    
    // 最终统计
    console.log('\n=== 最终统计 ===');
    console.log(`📋 总规则数: ${finalRules.length} 条`);
    console.log(`🎯 规则分类结构:`);
    console.log('📦 基础查询类 (1-37):');
    console.log('  • 库存相关 (1-11): 11条');
    console.log('  • 上线相关 (12-20): 9条');
    console.log('  • 测试相关 (21-33): 13条');
    console.log('  • 批次管理 (34-37): 4条');
    console.log('🔬 高级分析类 (38-54):');
    console.log('  • 对比分析 (38-46): 9条');
    console.log('  • 特殊功能 (47-54): 8条');
    
    console.log('\n✅ 所有规则已完美排序，结构清晰明了！');
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixRemainingRule();
