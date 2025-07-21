import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixCategoryUpdate() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 检查并修复分类更新问题...\n');
    
    // 1. 检查当前分类情况
    const [currentCategories] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM nlp_intent_rules GROUP BY category ORDER BY category'
    );
    
    console.log('=== 当前分类情况 ===');
    currentCategories.forEach(row => {
      console.log(`${row.category}: ${row.count} 条规则`);
    });
    
    // 2. 检查是否还是旧分类
    const hasOldCategories = currentCategories.some(row => 
      ['库存管理', '上线跟踪', '测试分析', '批次管理', '对比分析', '特殊功能'].includes(row.category)
    );
    
    if (hasOldCategories) {
      console.log('\n⚠️  检测到旧分类，开始强制更新为新的场景分类...\n');
      
      // 3. 强制更新为新的场景分类
      const scenarioMapping = {
        // 库存场景 (15条)
        '库存场景': [
          '物料库存信息查询_优化', '供应商库存查询_优化', '库存状态查询', '风险库存查询',
          '风险状态物料查询', '电池库存查询', '结构件类库存查询', '光学类库存查询',
          '充电类库存查询', '声学类库存查询', '包装类库存查询', '批次库存信息查询',
          '批次信息查询', '供应商物料查询', '物料大类查询'
        ],
        
        // 上线场景 (9条)
        '上线场景': [
          '物料上线情况查询', '供应商上线情况查询', '物料上线跟踪查询_优化',
          '结构件类上线情况查询', '光学类上线情况查询', '充电类上线情况查询',
          '声学类上线情况查询', '包装类上线情况查询', '物料上线Top不良'
        ],
        
        // 测试场景 (13条)
        '测试场景': [
          '物料测试情况查询', '供应商测试情况查询', '物料测试结果查询_优化',
          'NG测试结果查询_优化', '项目测试情况查询', '基线测试情况查询',
          'Top缺陷排行查询', '结构件类测试情况查询', '光学类测试情况查询',
          '充电类测试情况查询', '声学类测试情况查询', '包装类测试情况查询',
          '物料测试Top不良'
        ],
        
        // 批次场景 (5条)
        '批次场景': [
          '批次测试情况查询', '批次上线情况查询_优化', '批次综合信息查询_优化',
          '异常批次识别_优化', '项目物料不良查询'
        ],
        
        // 对比场景 (8条)
        '对比场景': [
          '供应商对比分析', '物料大类别质量对比', '物料大类别月度质量趋势',
          '大类别Top不良分析', '结构件类供应商质量排行', '光学类供应商质量排行',
          '结构件类深度不良分析', '光学类显示缺陷专项分析'
        ],
        
        // 综合场景 (2条)
        '综合场景': [
          '基线物料不良查询', '本月测试汇总'
        ]
      };
      
      console.log('=== 开始强制更新分类 ===');
      
      let updatedCount = 0;
      let orderIndex = 1;
      
      for (const [category, rules] of Object.entries(scenarioMapping)) {
        console.log(`\n--- 更新 ${category} ---`);
        
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
              console.log(`  ⚠️  ${ruleName} - 未找到或未更新`);
            }
            orderIndex++;
          } catch (error) {
            console.log(`  ❌ ${ruleName} - 更新失败: ${error.message}`);
          }
        }
      }
      
      console.log(`\n✅ 强制更新完成，共更新 ${updatedCount} 条规则`);
      
    } else {
      console.log('\n✅ 分类已经是新的场景分类');
    }
    
    // 4. 验证最终结果
    console.log('\n=== 验证最终分类结果 ===');
    const [finalCategories] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM nlp_intent_rules GROUP BY category ORDER BY MIN(sort_order)'
    );
    
    console.log('最终分类统计:');
    finalCategories.forEach(row => {
      console.log(`  ${row.category}: ${row.count} 条规则`);
    });
    
    // 5. 显示每个分类的具体规则
    console.log('\n=== 各分类具体规则 ===');
    const [allRules] = await connection.execute(
      'SELECT intent_name, category, sort_order FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    const categories = ['库存场景', '上线场景', '测试场景', '批次场景', '对比场景', '综合场景'];
    
    categories.forEach(category => {
      const categoryRules = allRules.filter(rule => rule.category === category);
      if (categoryRules.length > 0) {
        console.log(`\n--- ${category} (${categoryRules.length}条) ---`);
        categoryRules.forEach(rule => {
          console.log(`  ${rule.sort_order.toString().padStart(2, '0')}. ${rule.intent_name}`);
        });
      }
    });
    
    // 6. 检查是否有未分类的规则
    const uncategorizedRules = allRules.filter(rule => 
      !categories.includes(rule.category)
    );
    
    if (uncategorizedRules.length > 0) {
      console.log('\n--- 未分类规则 ---');
      uncategorizedRules.forEach(rule => {
        console.log(`  ${rule.sort_order.toString().padStart(2, '0')}. ${rule.intent_name} (${rule.category})`);
      });
      
      // 自动修复未分类规则
      console.log('\n=== 修复未分类规则 ===');
      for (const rule of uncategorizedRules) {
        let autoCategory = '综合场景'; // 默认分类
        
        // 智能分类
        if (rule.intent_name.includes('库存') || rule.intent_name.includes('物料查询')) {
          autoCategory = '库存场景';
        } else if (rule.intent_name.includes('上线') || rule.intent_name.includes('跟踪')) {
          autoCategory = '上线场景';
        } else if (rule.intent_name.includes('测试') || rule.intent_name.includes('NG') || rule.intent_name.includes('缺陷')) {
          autoCategory = '测试场景';
        } else if (rule.intent_name.includes('批次')) {
          autoCategory = '批次场景';
        } else if (rule.intent_name.includes('对比') || rule.intent_name.includes('质量') || rule.intent_name.includes('排行')) {
          autoCategory = '对比场景';
        }
        
        try {
          await connection.execute(
            'UPDATE nlp_intent_rules SET category = ?, updated_at = NOW() WHERE intent_name = ?',
            [autoCategory, rule.intent_name]
          );
          console.log(`  ✅ ${rule.intent_name} → ${autoCategory} (自动修复)`);
        } catch (error) {
          console.log(`  ❌ ${rule.intent_name} - 修复失败: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 分类更新和验证完成！');
    console.log('📋 现在所有规则都已按业务场景正确分类');
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixCategoryUpdate();
