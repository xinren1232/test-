import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function deleteSpecificRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🗑️ 删除指定的重复和不必要规则...\n');
    
    // 1. 先检查当前所有规则
    const [allRules] = await connection.execute(
      'SELECT intent_name, category FROM nlp_intent_rules ORDER BY intent_name'
    );
    
    console.log(`📋 当前数据库中共有 ${allRules.length} 条规则\n`);
    
    // 2. 定义要删除的规则列表
    const rulesToDelete = [
      '重复缺陷分析',
      '供应商质量评级', // 这个可能是您说的"供应商质量平均"
      '供应商质量平均', // 如果存在这个名称的规则
      '物料对比分析', // 可能重复的规则
      '异常批次识别', // 有优化版本，删除原版本
      '批次综合信息查询', // 有优化版本，删除原版本
      '物料测试结果查询', // 有优化版本，删除原版本
      'NG测试结果查询', // 有优化版本，删除原版本
      '物料上线跟踪查询', // 有优化版本，删除原版本
      '批次上线情况查询', // 有优化版本，删除原版本
      '供应商库存查询', // 有优化版本，删除原版本
      '物料库存信息查询', // 有优化版本，删除原版本
      // 其他可能的重复规则
      '在线跟踪查询',
      '测试NG情况查询',
      '物料库存查询',
      '精确物料查询',
      '物料相关查询',
      '数据范围提示',
      '智能物料匹配'
    ];
    
    console.log('=== 检查要删除的规则是否存在 ===');
    
    let deletedCount = 0;
    let notFoundCount = 0;
    const existingRulesToDelete = [];
    
    // 3. 检查哪些规则确实存在
    for (const ruleName of rulesToDelete) {
      const rule = allRules.find(r => r.intent_name === ruleName);
      if (rule) {
        existingRulesToDelete.push(ruleName);
        console.log(`  ✅ 找到规则: ${ruleName} (分类: ${rule.category})`);
      } else {
        console.log(`  ⚠️  规则不存在: ${ruleName}`);
        notFoundCount++;
      }
    }
    
    console.log(`\n📊 统计: 找到 ${existingRulesToDelete.length} 条可删除规则，${notFoundCount} 条不存在\n`);
    
    if (existingRulesToDelete.length === 0) {
      console.log('⚠️  没有找到需要删除的规则');
      return;
    }
    
    // 4. 执行删除操作
    console.log('=== 开始删除规则 ===');
    
    for (const ruleName of existingRulesToDelete) {
      try {
        const [deleteResult] = await connection.execute(
          'DELETE FROM nlp_intent_rules WHERE intent_name = ?',
          [ruleName]
        );
        
        if (deleteResult.affectedRows > 0) {
          console.log(`  ✅ 已删除: ${ruleName}`);
          deletedCount++;
        } else {
          console.log(`  ❌ 删除失败: ${ruleName} (未找到记录)`);
        }
      } catch (error) {
        console.log(`  ❌ 删除失败: ${ruleName} - ${error.message}`);
      }
    }
    
    // 5. 检查删除后的规则数量和分类
    console.log('\n=== 删除后的统计 ===');
    const [remainingRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules'
    );
    
    const [categoryStats] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM nlp_intent_rules GROUP BY category ORDER BY category'
    );
    
    console.log(`📋 删除后剩余规则数: ${remainingRules[0].total} 条`);
    console.log(`🗑️ 成功删除: ${deletedCount} 条规则\n`);
    
    console.log('分类统计:');
    categoryStats.forEach(row => {
      console.log(`  ${row.category}: ${row.count} 条规则`);
    });
    
    // 6. 重新整理排序（可选）
    console.log('\n=== 重新整理排序 ===');
    const [allRemainingRules] = await connection.execute(
      'SELECT intent_name FROM nlp_intent_rules ORDER BY category, sort_order'
    );
    
    // 重新分配连续的排序号
    for (let i = 0; i < allRemainingRules.length; i++) {
      await connection.execute(
        'UPDATE nlp_intent_rules SET sort_order = ? WHERE intent_name = ?',
        [i + 1, allRemainingRules[i].intent_name]
      );
    }
    
    console.log(`✅ 已重新整理 ${allRemainingRules.length} 条规则的排序`);
    
    // 7. 显示最终的规则列表
    console.log('\n=== 最终规则列表 ===');
    const [finalRules] = await connection.execute(
      'SELECT intent_name, category, sort_order FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    const categories = ['库存管理', '上线跟踪', '测试分析', '批次管理', '对比分析', '特殊功能'];
    
    categories.forEach(category => {
      const categoryRules = finalRules.filter(rule => rule.category === category);
      if (categoryRules.length > 0) {
        console.log(`\n--- ${category} (${categoryRules.length}条) ---`);
        categoryRules.forEach((rule, index) => {
          console.log(`  ${rule.sort_order.toString().padStart(2, '0')}. ${rule.intent_name}`);
        });
      }
    });
    
    console.log('\n=== 删除完成总结 ===');
    console.log(`🗑️ 删除规则数: ${deletedCount} 条`);
    console.log(`📋 最终规则数: ${finalRules.length} 条`);
    console.log(`✅ 规则库已清理完成，保留核心功能规则！`);
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

deleteSpecificRules();
