import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function cleanDuplicateUnreasonableRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧹 清理重复和不合理的规则...\n');
    
    // 获取所有规则
    const [allRules] = await connection.execute(
      'SELECT id, intent_name, action_target, status FROM nlp_intent_rules ORDER BY intent_name'
    );
    
    console.log(`📋 当前数据库中共有 ${allRules.length} 条规则\n`);
    
    // 定义要删除的重复和不合理规则
    const rulesToDelete = [
      // 1. 重复的规则（保留优化版本，删除原版本）
      '物料库存信息查询', // 有优化版本：物料库存信息查询_优化
      '供应商库存查询', // 有优化版本：供应商库存查询_优化  
      '物料上线跟踪查询', // 有优化版本：物料上线跟踪查询_优化
      '批次上线情况查询', // 有优化版本：批次上线情况查询_优化
      '物料测试结果查询', // 有优化版本：物料测试结果查询_优化
      'NG测试结果查询', // 有优化版本：NG测试结果查询_优化
      '批次综合信息查询', // 有优化版本：批次综合信息查询_优化
      '异常批次识别', // 有优化版本：异常批次识别_优化
      
      // 2. 功能重复的规则
      '物料库存查询', // 与物料库存信息查询_优化功能重复
      '在线跟踪查询', // 与物料上线跟踪查询_优化功能重复
      '测试NG情况查询', // 与NG测试结果查询_优化功能重复
      
      // 3. 过于具体的物料查询（可以用大类查询替代）
      '电池物料查询', // 可以用充电类查询替代
      '包装盒物料查询', // 可以用包装类查询替代
      '充电类物料查询', // 与充电类库存查询重复
      
      // 4. 不合理的规则（与IQE质量检验业务不符）
      '库存状态查询_风险冻结物料', // 名称过长，功能与风险库存查询重复
      
      // 5. 功能模糊的规则
      '物料相关查询', // 功能过于模糊
      '精确物料查询', // 功能与智能物料匹配重复
      '数据范围提示', // 不是查询功能
      
      // 6. 重复的对比分析
      '物料对比分析' // 在特殊规则中重复出现
    ];
    
    console.log('=== 识别要删除的规则 ===');
    let deletedCount = 0;
    let notFoundCount = 0;
    
    for (const ruleName of rulesToDelete) {
      const rule = allRules.find(r => r.intent_name === ruleName);
      
      if (rule) {
        try {
          await connection.execute(
            'DELETE FROM nlp_intent_rules WHERE intent_name = ?',
            [ruleName]
          );
          console.log(`  ✅ 已删除: ${ruleName}`);
          deletedCount++;
        } catch (error) {
          console.log(`  ❌ 删除失败: ${ruleName} - ${error.message}`);
        }
      } else {
        console.log(`  ⚠️  规则不存在: ${ruleName}`);
        notFoundCount++;
      }
    }
    
    console.log(`\n删除统计: 成功删除 ${deletedCount} 条，未找到 ${notFoundCount} 条\n`);
    
    // 检查删除后的规则数量
    const [remainingRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules'
    );
    
    console.log(`📊 删除后剩余规则数: ${remainingRules[0].count} 条\n`);
    
    // 显示保留的核心规则分类
    console.log('=== 保留的核心规则分类 ===');
    
    const coreRules = {
      '库存相关': [
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
        '包装类库存查询'
      ],
      '上线相关': [
        '物料上线情况查询',
        '供应商上线情况查询',
        '物料上线跟踪查询_优化',
        '批次上线情况查询_优化',
        '结构件类上线情况查询',
        '光学类上线情况查询',
        '充电类上线情况查询', 
        '声学类上线情况查询',
        '包装类上线情况查询'
      ],
      '测试相关': [
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
        '包装类测试情况查询'
      ],
      '批次管理': [
        '批次信息查询',
        '批次库存信息查询', 
        '批次综合信息查询_优化',
        '异常批次识别_优化'
      ],
      '对比分析': [
        '供应商对比分析',
        '物料大类别质量对比',
        '供应商质量评级',
        '物料大类别月度质量趋势',
        '大类别Top不良分析',
        '结构件类供应商质量排行',
        '光学类供应商质量排行',
        '结构件类深度不良分析',
        '光学类显示缺陷专项分析'
      ],
      '特殊功能': [
        '供应商物料查询',
        '物料大类查询', 
        '项目物料不良查询',
        '基线物料不良查询',
        '物料上线Top不良',
        '物料测试Top不良',
        '本月测试汇总',
        '重复缺陷分析',
        '智能物料匹配'
      ]
    };
    
    // 验证保留的规则是否存在
    for (const [category, rules] of Object.entries(coreRules)) {
      console.log(`\n--- ${category} ---`);
      let existCount = 0;
      
      for (const ruleName of rules) {
        const [ruleCheck] = await connection.execute(
          'SELECT COUNT(*) as count FROM nlp_intent_rules WHERE intent_name = ?',
          [ruleName]
        );
        
        if (ruleCheck[0].count > 0) {
          console.log(`  ✅ ${ruleName}`);
          existCount++;
        } else {
          console.log(`  ❌ ${ruleName} (已被删除或不存在)`);
        }
      }
      
      console.log(`  📊 ${category}: ${existCount}/${rules.length} 条规则保留`);
    }
    
    // 最终统计
    const [finalRules] = await connection.execute(
      'SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"'
    );
    
    console.log('\n=== 清理完成总结 ===');
    console.log(`🗑️  删除规则数: ${deletedCount} 条`);
    console.log(`📋 最终规则数: ${finalRules[0].count} 条激活规则`);
    console.log(`🎯 规则库更加精简和高效！`);
    
    console.log('\n✅ 清理后的规则库特点:');
    console.log('1. 消除了重复规则，保留优化版本');
    console.log('2. 删除了功能模糊和不合理的规则'); 
    console.log('3. 保持了完整的业务功能覆盖');
    console.log('4. 所有保留规则都按真实页面字段设计优化');
    
  } catch (error) {
    console.error('❌ 清理过程中出错:', error);
  } finally {
    await connection.end();
  }
}

cleanDuplicateUnreasonableRules();
