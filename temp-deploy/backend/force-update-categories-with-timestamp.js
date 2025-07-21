import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function forceUpdateCategoriesWithTimestamp() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 强制更新分类并添加时间戳以破除缓存...\n');
    
    // 1. 检查当前分类情况
    const [currentRules] = await connection.execute(
      'SELECT intent_name, category, sort_order FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    console.log(`📋 当前规则数: ${currentRules.length} 条`);
    
    // 2. 强制更新所有规则的updated_at时间戳，破除前端缓存
    console.log('\n=== 强制更新时间戳以破除缓存 ===');
    await connection.execute(
      'UPDATE nlp_intent_rules SET updated_at = NOW()'
    );
    console.log('✅ 已更新所有规则的时间戳');
    
    // 3. 再次确认分类映射
    const scenarioMapping = {
      '库存场景': [
        '物料库存信息查询_优化', '供应商库存查询_优化', '库存状态查询', '风险库存查询',
        '风险状态物料查询', '电池库存查询', '结构件类库存查询', '光学类库存查询',
        '充电类库存查询', '声学类库存查询', '包装类库存查询', '批次库存信息查询',
        '批次信息查询', '供应商物料查询', '物料大类查询'
      ],
      '上线场景': [
        '物料上线情况查询', '供应商上线情况查询', '物料上线跟踪查询_优化',
        '结构件类上线情况查询', '光学类上线情况查询', '充电类上线情况查询',
        '声学类上线情况查询', '包装类上线情况查询', '物料上线Top不良'
      ],
      '测试场景': [
        '物料测试情况查询', '供应商测试情况查询', '物料测试结果查询_优化',
        'NG测试结果查询_优化', '项目测试情况查询', '基线测试情况查询',
        'Top缺陷排行查询', '结构件类测试情况查询', '光学类测试情况查询',
        '充电类测试情况查询', '声学类测试情况查询', '包装类测试情况查询',
        '物料测试Top不良'
      ],
      '批次场景': [
        '批次测试情况查询', '批次上线情况查询_优化', '批次综合信息查询_优化',
        '异常批次识别_优化', '项目物料不良查询'
      ],
      '对比场景': [
        '供应商对比分析', '物料大类别质量对比', '物料大类别月度质量趋势',
        '大类别Top不良分析', '结构件类供应商质量排行', '光学类供应商质量排行',
        '结构件类深度不良分析', '光学类显示缺陷专项分析'
      ],
      '综合场景': [
        '基线物料不良查询', '本月测试汇总'
      ]
    };
    
    // 4. 强制重新设置分类和排序
    console.log('\n=== 强制重新设置分类和排序 ===');
    let orderIndex = 1;
    let updatedCount = 0;
    
    for (const [category, rules] of Object.entries(scenarioMapping)) {
      console.log(`\n--- 强制更新 ${category} ---`);
      
      for (const ruleName of rules) {
        try {
          const [updateResult] = await connection.execute(
            'UPDATE nlp_intent_rules SET category = ?, sort_order = ?, updated_at = NOW() WHERE intent_name = ?',
            [category, orderIndex, ruleName]
          );
          
          if (updateResult.affectedRows > 0) {
            console.log(`  ✅ ${orderIndex.toString().padStart(2, '0')}. ${ruleName} → ${category}`);
            updatedCount++;
          } else {
            console.log(`  ⚠️  ${ruleName} - 未找到规则`);
          }
          orderIndex++;
        } catch (error) {
          console.log(`  ❌ ${ruleName} - 更新失败: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ 强制更新完成，共更新 ${updatedCount} 条规则`);
    
    // 5. 验证最终结果并显示详细信息
    console.log('\n=== 验证最终结果 ===');
    const [finalRules] = await connection.execute(
      'SELECT intent_name, category, sort_order, updated_at FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    // 按分类统计
    const categoryStats = {};
    finalRules.forEach(rule => {
      categoryStats[rule.category] = (categoryStats[rule.category] || 0) + 1;
    });
    
    console.log('最终分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 条规则`);
    });
    
    // 显示每个分类的规则
    console.log('\n=== 各分类详细规则 ===');
    const categories = ['库存场景', '上线场景', '测试场景', '批次场景', '对比场景', '综合场景'];
    
    categories.forEach(category => {
      const categoryRules = finalRules.filter(rule => rule.category === category);
      if (categoryRules.length > 0) {
        console.log(`\n--- ${category} (${categoryRules.length}条) ---`);
        categoryRules.forEach(rule => {
          console.log(`  ${rule.sort_order.toString().padStart(2, '0')}. ${rule.intent_name}`);
        });
      }
    });
    
    // 6. 生成API测试URL
    console.log('\n=== API测试信息 ===');
    console.log('🔗 API端点: http://localhost:3001/api/rules');
    console.log('📅 最新更新时间:', new Date().toISOString());
    console.log('🔄 建议前端操作:');
    console.log('  1. 强制刷新: Ctrl + F5');
    console.log('  2. 清除缓存: 开发者工具 → Application → Storage → Clear storage');
    console.log('  3. 硬刷新: 右键刷新按钮 → 硬性重新加载');
    
    // 7. 检查是否有重复或错误的分类
    const validCategories = ['库存场景', '上线场景', '测试场景', '批次场景', '对比场景', '综合场景'];
    const invalidRules = finalRules.filter(rule => !validCategories.includes(rule.category));
    
    if (invalidRules.length > 0) {
      console.log('\n⚠️  发现无效分类的规则:');
      invalidRules.forEach(rule => {
        console.log(`  ${rule.intent_name}: ${rule.category}`);
      });
    } else {
      console.log('\n✅ 所有规则分类都正确');
    }
    
    console.log('\n🎉 分类强制更新完成！');
    console.log('📋 现在前端应该能看到6个业务场景分类');
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

forceUpdateCategoriesWithTimestamp();
