import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkAll71RulesFieldDesign() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查所有71条规则的字段设计更新情况...\n');
    
    // 定义标准字段设计
    const standardFields = {
      inventory: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
      online: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
      test: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
      batch: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
    };
    
    // 获取所有规则
    const [allRules] = await connection.execute(
      'SELECT intent_name, action_target, status FROM nlp_intent_rules ORDER BY intent_name'
    );
    
    console.log(`📋 数据库中共有 ${allRules.length} 条规则\n`);
    
    // 规则分类映射
    const ruleCategories = {
      // 库存相关规则
      inventory: [
        '物料库存查询', '物料库存信息查询', '供应商库存查询', '库存状态查询', '风险库存查询',
        '物料库存信息查询_优化', '供应商库存查询_优化', '风险状态物料查询', '库存状态查询_风险冻结物料',
        '电池库存查询', '结构件类库存查询', '光学类库存查询', '充电类库存查询', '声学类库存查询', '包装类库存查询'
      ],
      // 上线相关规则
      online: [
        '在线跟踪查询', '物料上线情况查询', '供应商上线情况查询', '物料上线跟踪查询_优化', '批次上线情况查询_优化',
        '批次上线情况查询', '结构件类上线情况查询', '光学类上线情况查询', '充电类上线情况查询', 
        '声学类上线情况查询', '包装类上线情况查询'
      ],
      // 测试相关规则
      test: [
        'NG测试结果查询', '测试NG情况查询', '物料测试情况查询', '批次测试情况查询', '供应商测试情况查询',
        '物料测试结果查询_优化', 'NG测试结果查询_优化', '项目测试情况查询', '基线测试情况查询',
        '结构件类测试情况查询', '光学类测试情况查询', '充电类测试情况查询', '声学类测试情况查询', 
        '包装类测试情况查询', 'Top缺陷排行查询'
      ],
      // 批次管理相关规则
      batch: [
        '批次信息查询', '批次库存信息查询', '批次综合信息查询', '批次综合信息查询_优化',
        '异常批次识别', '异常批次识别_优化'
      ],
      // 对比分析类规则（特殊格式）
      comparison: [
        '供应商对比分析', '物料对比分析', '物料大类别质量对比', '供应商质量评级',
        '物料大类别月度质量趋势', '大类别Top不良分析', '结构件类供应商质量排行', '光学类供应商质量排行',
        '结构件类深度不良分析', '光学类显示缺陷专项分析'
      ],
      // 其他特殊规则
      special: [
        '供应商物料查询', '物料大类查询', '项目物料不良查询', '基线物料不良查询',
        '物料上线Top不良', '物料测试Top不良', '电池物料查询', '包装盒物料查询', '充电类物料查询',
        '本月测试汇总', '重复缺陷分析', '物料对比分析', '精确物料查询', '物料相关查询',
        '智能物料匹配', '数据范围提示'
      ]
    };
    
    let totalChecked = 0;
    let passedRules = 0;
    let failedRules = [];
    let uncategorizedRules = [];
    
    console.log('=== 按类别检查规则字段设计 ===\n');
    
    // 检查每个类别的规则
    for (const [category, expectedRuleNames] of Object.entries(ruleCategories)) {
      if (category === 'comparison' || category === 'special') continue; // 先跳过特殊类别
      
      console.log(`--- ${category}类规则检查 ---`);
      const expectedFields = standardFields[category];
      
      for (const ruleName of expectedRuleNames) {
        const rule = allRules.find(r => r.intent_name === ruleName);
        totalChecked++;
        
        if (!rule) {
          console.log(`  ❌ ${ruleName}: 规则不存在`);
          failedRules.push({name: ruleName, reason: '规则不存在'});
          continue;
        }
        
        if (rule.status !== 'active') {
          console.log(`  ⚠️  ${ruleName}: 规则未激活 (状态: ${rule.status})`);
          continue;
        }
        
        try {
          // 检查SQL是否包含正确的字段映射
          const sql = rule.action_target;
          let hasCorrectFields = true;
          let missingFields = [];
          
          // 检查是否包含所有必需字段
          for (const field of expectedFields) {
            if (!sql.includes(`as ${field}`) && !sql.includes(`AS ${field}`)) {
              hasCorrectFields = false;
              missingFields.push(field);
            }
          }
          
          if (hasCorrectFields) {
            console.log(`  ✅ ${ruleName}: 字段映射正确`);
            passedRules++;
          } else {
            console.log(`  ❌ ${ruleName}: 缺少字段映射 [${missingFields.join(', ')}]`);
            failedRules.push({name: ruleName, reason: `缺少字段: ${missingFields.join(', ')}`});
          }
          
        } catch (error) {
          console.log(`  ❌ ${ruleName}: 检查失败 - ${error.message}`);
          failedRules.push({name: ruleName, reason: error.message});
        }
      }
      console.log('');
    }
    
    // 检查对比分析类规则
    console.log('--- 对比分析类规则检查 ---');
    for (const ruleName of ruleCategories.comparison) {
      const rule = allRules.find(r => r.intent_name === ruleName);
      totalChecked++;
      
      if (!rule) {
        console.log(`  ❌ ${ruleName}: 规则不存在`);
        failedRules.push({name: ruleName, reason: '规则不存在'});
        continue;
      }
      
      if (rule.status === 'active') {
        console.log(`  ✅ ${ruleName}: 对比分析规则存在且激活`);
        passedRules++;
      } else {
        console.log(`  ⚠️  ${ruleName}: 规则未激活`);
      }
    }
    console.log('');
    
    // 检查特殊规则
    console.log('--- 特殊规则检查 ---');
    for (const ruleName of ruleCategories.special) {
      const rule = allRules.find(r => r.intent_name === ruleName);
      totalChecked++;
      
      if (!rule) {
        console.log(`  ❌ ${ruleName}: 规则不存在`);
        failedRules.push({name: ruleName, reason: '规则不存在'});
        continue;
      }
      
      if (rule.status === 'active') {
        console.log(`  ✅ ${ruleName}: 特殊规则存在且激活`);
        passedRules++;
      } else {
        console.log(`  ⚠️  ${ruleName}: 规则未激活`);
      }
    }
    console.log('');
    
    // 检查是否有未分类的规则
    console.log('--- 检查未分类规则 ---');
    const allCategorizedRules = [
      ...ruleCategories.inventory,
      ...ruleCategories.online,
      ...ruleCategories.test,
      ...ruleCategories.batch,
      ...ruleCategories.comparison,
      ...ruleCategories.special
    ];
    
    for (const rule of allRules) {
      if (!allCategorizedRules.includes(rule.intent_name)) {
        uncategorizedRules.push(rule.intent_name);
        console.log(`  ⚠️  ${rule.intent_name}: 未分类规则`);
      }
    }
    
    if (uncategorizedRules.length === 0) {
      console.log('  ✅ 所有规则都已分类');
    }
    console.log('');
    
    // 总结报告
    console.log('=== 检查总结报告 ===');
    console.log(`📊 数据库总规则数: ${allRules.length}`);
    console.log(`🔍 已检查规则数: ${totalChecked}`);
    console.log(`✅ 通过检查规则数: ${passedRules}`);
    console.log(`❌ 失败规则数: ${failedRules.length}`);
    console.log(`⚠️  未分类规则数: ${uncategorizedRules.length}`);
    console.log(`📈 通过率: ${((passedRules / totalChecked) * 100).toFixed(2)}%`);
    
    if (failedRules.length > 0) {
      console.log('\n❌ 需要修复的规则:');
      failedRules.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.name} - ${rule.reason}`);
      });
    }
    
    if (uncategorizedRules.length > 0) {
      console.log('\n⚠️  未分类的规则:');
      uncategorizedRules.forEach((ruleName, index) => {
        console.log(`${index + 1}. ${ruleName}`);
      });
    }
    
    // 字段设计标准
    console.log('\n📋 标准字段设计:');
    console.log('1）库存页面: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注');
    console.log('2）上线页面: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注');
    console.log('3）测试页面: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注');
    console.log('4）批次管理: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注');
    
    if (passedRules === totalChecked) {
      console.log('\n🎉 所有规则字段设计检查通过！');
    } else {
      console.log(`\n⚠️  还有 ${totalChecked - passedRules} 个规则需要优化`);
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    await connection.end();
  }
}

checkAll71RulesFieldDesign();
