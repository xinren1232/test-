import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkAndFixRuleCategories() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查规则分类情况并修复...\n');
    
    // 1. 检查当前规则的分类情况
    const [allRules] = await connection.execute(
      'SELECT id, intent_name, category, sort_order FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    console.log(`📋 当前数据库中共有 ${allRules.length} 条规则\n`);
    
    // 统计分类情况
    const categoryStats = {};
    allRules.forEach(rule => {
      const category = rule.category || '未分类';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    console.log('=== 当前分类统计 ===');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`${category}: ${count} 条规则`);
    });
    
    // 2. 定义正确的分类映射
    const categoryMapping = {
      // 库存相关 (1-11)
      '物料库存信息查询_优化': '库存管理',
      '供应商库存查询_优化': '库存管理', 
      '库存状态查询': '库存管理',
      '风险库存查询': '库存管理',
      '风险状态物料查询': '库存管理',
      '电池库存查询': '库存管理',
      '结构件类库存查询': '库存管理',
      '光学类库存查询': '库存管理',
      '充电类库存查询': '库存管理',
      '声学类库存查询': '库存管理',
      '包装类库存查询': '库存管理',
      
      // 上线相关 (12-20)
      '物料上线情况查询': '上线跟踪',
      '供应商上线情况查询': '上线跟踪',
      '物料上线跟踪查询_优化': '上线跟踪',
      '批次上线情况查询_优化': '上线跟踪',
      '结构件类上线情况查询': '上线跟踪',
      '光学类上线情况查询': '上线跟踪',
      '充电类上线情况查询': '上线跟踪',
      '声学类上线情况查询': '上线跟踪',
      '包装类上线情况查询': '上线跟踪',
      
      // 测试相关 (21-33)
      '物料测试情况查询': '测试分析',
      '批次测试情况查询': '测试分析',
      '供应商测试情况查询': '测试分析',
      '物料测试结果查询_优化': '测试分析',
      'NG测试结果查询_优化': '测试分析',
      '项目测试情况查询': '测试分析',
      '基线测试情况查询': '测试分析',
      'Top缺陷排行查询': '测试分析',
      '结构件类测试情况查询': '测试分析',
      '光学类测试情况查询': '测试分析',
      '充电类测试情况查询': '测试分析',
      '声学类测试情况查询': '测试分析',
      '包装类测试情况查询': '测试分析',
      
      // 批次管理 (34-37)
      '批次信息查询': '批次管理',
      '批次库存信息查询': '批次管理',
      '批次综合信息查询_优化': '批次管理',
      '异常批次识别_优化': '批次管理',
      
      // 对比分析 (38-46)
      '供应商对比分析': '对比分析',
      '物料大类别质量对比': '对比分析',
      '供应商质量评级': '对比分析',
      '物料大类别月度质量趋势': '对比分析',
      '大类别Top不良分析': '对比分析',
      '结构件类供应商质量排行': '对比分析',
      '光学类供应商质量排行': '对比分析',
      '结构件类深度不良分析': '对比分析',
      '光学类显示缺陷专项分析': '对比分析',
      
      // 特殊功能 (47-54)
      '供应商物料查询': '特殊功能',
      '物料大类查询': '特殊功能',
      '项目物料不良查询': '特殊功能',
      '基线物料不良查询': '特殊功能',
      '物料上线Top不良': '特殊功能',
      '物料测试Top不良': '特殊功能',
      '本月测试汇总': '特殊功能',
      '重复缺陷分析': '特殊功能'
    };
    
    console.log('\n=== 开始修复规则分类 ===');
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // 3. 更新每个规则的分类
    for (const [ruleName, category] of Object.entries(categoryMapping)) {
      const rule = allRules.find(r => r.intent_name === ruleName);
      
      if (rule) {
        try {
          await connection.execute(
            'UPDATE nlp_intent_rules SET category = ?, updated_at = NOW() WHERE intent_name = ?',
            [category, ruleName]
          );
          console.log(`  ✅ ${ruleName} → ${category}`);
          updatedCount++;
        } catch (error) {
          console.log(`  ❌ 更新失败: ${ruleName} - ${error.message}`);
        }
      } else {
        console.log(`  ⚠️  规则不存在: ${ruleName}`);
        notFoundCount++;
      }
    }
    
    // 4. 处理其他未分类的规则
    console.log('\n=== 处理其他规则 ===');
    const mappedRules = Object.keys(categoryMapping);
    const unmappedRules = allRules.filter(rule => !mappedRules.includes(rule.intent_name));
    
    for (const rule of unmappedRules) {
      // 根据规则名称智能分类
      let autoCategory = '其他';
      
      if (rule.intent_name.includes('库存') || rule.intent_name.includes('物料查询')) {
        autoCategory = '库存管理';
      } else if (rule.intent_name.includes('上线') || rule.intent_name.includes('跟踪')) {
        autoCategory = '上线跟踪';
      } else if (rule.intent_name.includes('测试') || rule.intent_name.includes('NG') || rule.intent_name.includes('缺陷')) {
        autoCategory = '测试分析';
      } else if (rule.intent_name.includes('批次')) {
        autoCategory = '批次管理';
      } else if (rule.intent_name.includes('对比') || rule.intent_name.includes('质量') || rule.intent_name.includes('排行')) {
        autoCategory = '对比分析';
      }
      
      try {
        await connection.execute(
          'UPDATE nlp_intent_rules SET category = ?, updated_at = NOW() WHERE intent_name = ?',
          [autoCategory, rule.intent_name]
        );
        console.log(`  🤖 ${rule.intent_name} → ${autoCategory} (自动分类)`);
        updatedCount++;
      } catch (error) {
        console.log(`  ❌ 自动分类失败: ${rule.intent_name} - ${error.message}`);
      }
    }
    
    // 5. 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    const [updatedRules] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM nlp_intent_rules GROUP BY category ORDER BY category'
    );
    
    console.log('修复后的分类统计:');
    updatedRules.forEach(row => {
      console.log(`  ${row.category || '未分类'}: ${row.count} 条规则`);
    });
    
    // 6. 显示按分类排序的规则列表
    console.log('\n=== 按分类显示规则列表 ===');
    const [categorizedRules] = await connection.execute(
      'SELECT intent_name, category, sort_order FROM nlp_intent_rules ORDER BY category, sort_order'
    );
    
    const categories = ['库存管理', '上线跟踪', '测试分析', '批次管理', '对比分析', '特殊功能', '其他'];
    
    categories.forEach(category => {
      const categoryRules = categorizedRules.filter(rule => rule.category === category);
      if (categoryRules.length > 0) {
        console.log(`\n--- ${category} (${categoryRules.length}条) ---`);
        categoryRules.forEach((rule, index) => {
          console.log(`  ${(index + 1).toString().padStart(2, '0')}. ${rule.intent_name} (排序: ${rule.sort_order})`);
        });
      }
    });
    
    // 7. 最终统计
    console.log('\n=== 修复完成总结 ===');
    console.log(`✅ 成功更新: ${updatedCount} 条规则`);
    console.log(`⚠️  未找到: ${notFoundCount} 条规则`);
    console.log(`📋 总规则数: ${allRules.length} 条`);
    
    const uncategorizedCount = updatedRules.find(r => !r.category || r.category === '未分类')?.count || 0;
    if (uncategorizedCount === 0) {
      console.log('🎉 所有规则都已正确分类！');
    } else {
      console.log(`⚠️  仍有 ${uncategorizedCount} 条规则未分类`);
    }
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

checkAndFixRuleCategories();
