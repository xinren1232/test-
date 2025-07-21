import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function redesignRuleCategoriesByScenario() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🎯 按业务场景重新设计规则分类...\n');
    
    // 获取所有规则
    const [allRules] = await connection.execute(
      'SELECT intent_name, category FROM nlp_intent_rules ORDER BY intent_name'
    );
    
    console.log(`📋 当前规则数: ${allRules.length} 条\n`);
    
    // 按业务场景重新设计分类
    const scenarioMapping = {
      // === 基础场景查询 ===
      // 库存场景 (1-15)
      '库存场景': [
        '物料库存信息查询_优化',
        '供应商库存查询_优化', 
        '库存状态查询',
        '风险库存查询',
        '风险状态物料查询',
        '电池库存查询',
        '结构件类库存查询',
        '光学类库存查询',
        '充电类库存查询',
        '声学类库存查询',
        '包装类库存查询',
        '批次库存信息查询',
        '批次信息查询',
        '供应商物料查询',
        '物料大类查询'
      ],
      
      // 上线场景 (16-24)
      '上线场景': [
        '物料上线情况查询',
        '供应商上线情况查询',
        '物料上线跟踪查询_优化',
        '结构件类上线情况查询',
        '光学类上线情况查询',
        '充电类上线情况查询',
        '声学类上线情况查询',
        '包装类上线情况查询',
        '物料上线Top不良'
      ],
      
      // 测试场景 (25-37)
      '测试场景': [
        '物料测试情况查询',
        '供应商测试情况查询',
        '物料测试结果查询_优化',
        'NG测试结果查询_优化',
        '项目测试情况查询',
        '基线测试情况查询',
        'Top缺陷排行查询',
        '结构件类测试情况查询',
        '光学类测试情况查询',
        '充电类测试情况查询',
        '声学类测试情况查询',
        '包装类测试情况查询',
        '物料测试Top不良'
      ],
      
      // === 专项场景查询 ===
      // 批次场景 (38-42)
      '批次场景': [
        '批次测试情况查询',
        '批次上线情况查询_优化',
        '批次综合信息查询_优化',
        '异常批次识别_优化',
        '项目物料不良查询'
      ],
      
      // 对比场景 (43-50)
      '对比场景': [
        '供应商对比分析',
        '物料大类别质量对比',
        '物料大类别月度质量趋势',
        '大类别Top不良分析',
        '结构件类供应商质量排行',
        '光学类供应商质量排行',
        '结构件类深度不良分析',
        '光学类显示缺陷专项分析'
      ],
      
      // 综合场景 (51-52)
      '综合场景': [
        '基线物料不良查询',
        '本月测试汇总'
      ]
    };
    
    console.log('=== 新的场景分类设计 ===');
    console.log('📦 基础场景查询:');
    console.log('  • 库存场景: 涵盖所有库存相关查询，包括物料、供应商、批次库存');
    console.log('  • 上线场景: 涵盖所有上线跟踪查询，包括物料、供应商上线情况');
    console.log('  • 测试场景: 涵盖所有测试分析查询，包括NG、缺陷、项目测试');
    console.log('🎯 专项场景查询:');
    console.log('  • 批次场景: 专门针对批次的综合查询和分析');
    console.log('  • 对比场景: 各种对比分析和排行查询');
    console.log('  • 综合场景: 跨场景的综合分析查询\n');
    
    // 开始重新分类
    console.log('=== 开始重新分类规则 ===');
    
    let updatedCount = 0;
    let notFoundCount = 0;
    let orderIndex = 1;
    
    for (const [category, rules] of Object.entries(scenarioMapping)) {
      console.log(`\n--- ${category} ---`);
      
      for (const ruleName of rules) {
        const rule = allRules.find(r => r.intent_name === ruleName);
        
        if (rule) {
          try {
            await connection.execute(
              'UPDATE nlp_intent_rules SET category = ?, sort_order = ?, updated_at = NOW() WHERE intent_name = ?',
              [category, orderIndex, ruleName]
            );
            console.log(`  ✅ ${orderIndex.toString().padStart(2, '0')}. ${ruleName} → ${category}`);
            updatedCount++;
            orderIndex++;
          } catch (error) {
            console.log(`  ❌ 更新失败: ${ruleName} - ${error.message}`);
          }
        } else {
          console.log(`  ⚠️  规则不存在: ${ruleName}`);
          notFoundCount++;
        }
      }
    }
    
    // 验证重新分类结果
    console.log('\n=== 验证重新分类结果 ===');
    const [updatedRules] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM nlp_intent_rules GROUP BY category ORDER BY MIN(sort_order)'
    );
    
    console.log('新分类统计:');
    updatedRules.forEach(row => {
      console.log(`  ${row.category}: ${row.count} 条规则`);
    });
    
    // 显示完整的新分类结构
    console.log('\n=== 完整的新分类结构 ===');
    const [finalRules] = await connection.execute(
      'SELECT intent_name, category, sort_order FROM nlp_intent_rules ORDER BY sort_order'
    );
    
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
    
    // 检查是否有未分类的规则
    const uncategorizedRules = finalRules.filter(rule => 
      !categories.includes(rule.category)
    );
    
    if (uncategorizedRules.length > 0) {
      console.log('\n--- 未分类规则 ---');
      uncategorizedRules.forEach(rule => {
        console.log(`  ${rule.sort_order.toString().padStart(2, '0')}. ${rule.intent_name} (${rule.category})`);
      });
    }
    
    // 最终统计
    console.log('\n=== 场景分类重设计完成总结 ===');
    console.log(`✅ 成功更新: ${updatedCount} 条规则`);
    console.log(`⚠️  未找到: ${notFoundCount} 条规则`);
    console.log(`📋 总规则数: ${finalRules.length} 条`);
    
    console.log('\n🎯 新的场景分类优势:');
    console.log('1. 📦 基础场景清晰: 库存、上线、测试三大核心业务场景');
    console.log('2. 🎯 专项场景明确: 批次、对比、综合等特殊业务需求');
    console.log('3. 🔄 业务逻辑合理: 按实际使用场景分组，便于用户理解');
    console.log('4. 📊 查询效率提升: 相关功能聚集，减少查找时间');
    console.log('5. 🚀 扩展性良好: 新增规则可以轻松归入对应场景');
    
    console.log('\n📋 场景分类说明:');
    console.log('• 库存场景: 物料库存管理、供应商库存、批次库存等');
    console.log('• 上线场景: 物料上线跟踪、供应商上线情况等');
    console.log('• 测试场景: 测试结果分析、NG分析、缺陷排行等');
    console.log('• 批次场景: 批次综合分析、批次异常识别等');
    console.log('• 对比场景: 供应商对比、物料对比、质量排行等');
    console.log('• 综合场景: 跨场景的综合分析和汇总报告');
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

redesignRuleCategoriesByScenario();
