import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function deleteAndReorderRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 删除智能物料匹配规则并按类别重新排序...\n');
    
    // 1. 删除智能物料匹配规则
    console.log('=== 删除智能物料匹配规则 ===');
    try {
      const [deleteResult] = await connection.execute(
        'DELETE FROM nlp_intent_rules WHERE intent_name = ?',
        ['智能物料匹配']
      );
      
      if (deleteResult.affectedRows > 0) {
        console.log('✅ 已删除: 智能物料匹配');
      } else {
        console.log('⚠️  规则不存在: 智能物料匹配');
      }
    } catch (error) {
      console.log(`❌ 删除失败: ${error.message}`);
    }
    
    // 2. 获取所有剩余规则
    const [allRules] = await connection.execute(
      'SELECT id, intent_name, action_target, status FROM nlp_intent_rules ORDER BY intent_name'
    );
    
    console.log(`\n📋 当前剩余规则数: ${allRules.length} 条\n`);
    
    // 3. 定义新的排序规则（按类别分组）
    const orderedRules = [
      // === 基础查询类 ===
      // 库存相关（11条）
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
      
      // 上线相关（9条）
      '物料上线情况查询',
      '供应商上线情况查询',
      '物料上线跟踪查询_优化',
      '批次上线情况查询_优化',
      '结构件类上线情况查询',
      '光学类上线情况查询',
      '充电类上线情况查询', 
      '声学类上线情况查询',
      '包装类上线情况查询',
      
      // 测试相关（12条）
      '物料测试情况查询',
      '批次测试情况查询',
      '供应商测试情况查询',
      'NG测试结果查询_优化',
      '项目测试情况查询',
      '基线测试情况查询',
      'Top缺陷排行查询',
      '结构件类测试情况查询',
      '光学类测试情况查询',
      '充电类测试情况查询',
      '声学类测试情况查询', 
      '包装类测试情况查询',
      
      // 批次管理（4条）
      '批次信息查询',
      '批次库存信息查询', 
      '批次综合信息查询_优化',
      '异常批次识别_优化',
      
      // === 高级分析类 ===
      // 对比分析（9条）
      '供应商对比分析',
      '物料大类别质量对比',
      '供应商质量评级',
      '物料大类别月度质量趋势',
      '大类别Top不良分析',
      '结构件类供应商质量排行',
      '光学类供应商质量排行',
      '结构件类深度不良分析',
      '光学类显示缺陷专项分析',
      
      // 特殊功能（8条）
      '供应商物料查询',
      '物料大类查询', 
      '项目物料不良查询',
      '基线物料不良查询',
      '物料上线Top不良',
      '物料测试Top不良',
      '本月测试汇总',
      '重复缺陷分析'
    ];
    
    console.log('=== 按类别重新排序规则 ===');
    
    // 4. 更新每个规则的排序
    let orderIndex = 1;
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const ruleName of orderedRules) {
      const rule = allRules.find(r => r.intent_name === ruleName);
      
      if (rule) {
        try {
          await connection.execute(
            'UPDATE nlp_intent_rules SET sort_order = ?, updated_at = NOW() WHERE intent_name = ?',
            [orderIndex, ruleName]
          );
          
          // 确定类别
          let category = '';
          if (orderIndex <= 11) category = '库存';
          else if (orderIndex <= 20) category = '上线';
          else if (orderIndex <= 32) category = '测试';
          else if (orderIndex <= 36) category = '批次';
          else if (orderIndex <= 45) category = '对比';
          else category = '特殊';
          
          console.log(`  ✅ ${orderIndex.toString().padStart(2, '0')}. [${category}] ${ruleName}`);
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
    
    // 5. 处理未在排序列表中的规则
    const unorderedRules = allRules.filter(rule => 
      !orderedRules.includes(rule.intent_name) && rule.intent_name !== '智能物料匹配'
    );
    
    if (unorderedRules.length > 0) {
      console.log('\n=== 处理未排序的规则 ===');
      for (const rule of unorderedRules) {
        await connection.execute(
          'UPDATE nlp_intent_rules SET sort_order = ?, updated_at = NOW() WHERE intent_name = ?',
          [orderIndex, rule.intent_name]
        );
        console.log(`  ⚠️  ${orderIndex.toString().padStart(2, '0')}. [其他] ${rule.intent_name}`);
        orderIndex++;
      }
    }
    
    // 6. 验证排序结果
    console.log('\n=== 验证排序结果 ===');
    const [sortedRules] = await connection.execute(
      'SELECT intent_name, sort_order FROM nlp_intent_rules ORDER BY sort_order'
    );
    
    console.log('\n📋 最终排序结果:');
    
    const categories = [
      { name: '库存相关', start: 1, end: 11 },
      { name: '上线相关', start: 12, end: 20 },
      { name: '测试相关', start: 21, end: 32 },
      { name: '批次管理', start: 33, end: 36 },
      { name: '对比分析', start: 37, end: 45 },
      { name: '特殊功能', start: 46, end: 53 }
    ];
    
    for (const category of categories) {
      console.log(`\n--- ${category.name} (${category.start}-${category.end}) ---`);
      const categoryRules = sortedRules.filter(rule => 
        rule.sort_order >= category.start && rule.sort_order <= category.end
      );
      
      categoryRules.forEach(rule => {
        console.log(`  ${rule.sort_order.toString().padStart(2, '0')}. ${rule.intent_name}`);
      });
      
      console.log(`  📊 ${category.name}: ${categoryRules.length} 条规则`);
    }
    
    // 显示其他规则
    const otherRules = sortedRules.filter(rule => rule.sort_order > 53);
    if (otherRules.length > 0) {
      console.log('\n--- 其他规则 ---');
      otherRules.forEach(rule => {
        console.log(`  ${rule.sort_order.toString().padStart(2, '0')}. ${rule.intent_name}`);
      });
    }
    
    // 7. 最终统计
    console.log('\n=== 排序完成总结 ===');
    console.log(`🗑️  删除规则: 智能物料匹配`);
    console.log(`📋 最终规则数: ${sortedRules.length} 条`);
    console.log(`✅ 成功排序: ${updatedCount} 条`);
    console.log(`⚠️  未找到: ${notFoundCount} 条`);
    
    console.log('\n🎯 规则分类结构:');
    console.log('📦 基础查询类 (1-36):');
    console.log('  • 库存相关 (1-11): 11条');
    console.log('  • 上线相关 (12-20): 9条');
    console.log('  • 测试相关 (21-32): 12条');
    console.log('  • 批次管理 (33-36): 4条');
    console.log('🔬 高级分析类 (37-53):');
    console.log('  • 对比分析 (37-45): 9条');
    console.log('  • 特殊功能 (46-53): 8条');
    
    console.log('\n✅ 规则库已按类别重新排序，结构更加清晰！');
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  } finally {
    await connection.end();
  }
}

deleteAndReorderRules();
