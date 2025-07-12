import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function verifyAllRulesFieldConsistency() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 验证所有规则的字段一致性...\n');
    
    // 定义标准字段设计
    const standardFields = {
      inventory: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
      online: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
      test: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
      batch: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
    };
    
    // 测试规则分类
    const testRules = {
      inventory: [
        '物料库存查询',
        '供应商库存查询',
        '库存状态查询',
        '风险库存查询',
        '结构件类库存查询',
        '光学类库存查询',
        '充电类库存查询',
        '声学类库存查询',
        '包装类库存查询'
      ],
      online: [
        '在线跟踪查询',
        '物料上线情况查询',
        '供应商上线情况查询',
        '批次上线情况查询',
        '结构件类上线情况查询',
        '光学类上线情况查询',
        '充电类上线情况查询',
        '声学类上线情况查询',
        '包装类上线情况查询'
      ],
      test: [
        'NG测试结果查询',
        '测试NG情况查询',
        '物料测试情况查询',
        '批次测试情况查询',
        '供应商测试情况查询',
        '项目测试情况查询',
        '基线测试情况查询',
        '结构件类测试情况查询',
        '光学类测试情况查询',
        '充电类测试情况查询',
        '声学类测试情况查询',
        '包装类测试情况查询',
        'Top缺陷排行查询'
      ],
      batch: [
        '批次信息查询',
        '批次库存信息查询',
        '批次综合信息查询',
        '异常批次识别'
      ]
    };
    
    console.log('=== 验证各类规则的字段一致性 ===\n');
    
    let totalRules = 0;
    let passedRules = 0;
    
    // 验证每个类别的规则
    for (const [category, rules] of Object.entries(testRules)) {
      console.log(`--- 验证${category}类规则 ---`);
      const expectedFields = standardFields[category];
      
      for (const ruleName of rules) {
        totalRules++;
        
        try {
          // 获取规则的SQL
          const [ruleData] = await connection.execute(
            'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
            [ruleName]
          );
          
          if (ruleData.length === 0) {
            console.log(`  ❌ ${ruleName}: 规则不存在`);
            continue;
          }
          
          const sql = ruleData[0].action_target;
          
          // 执行SQL获取字段
          try {
            const [result] = await connection.execute(sql.replace(/LIMIT \d+/, 'LIMIT 1'));
            
            if (result.length > 0) {
              const actualFields = Object.keys(result[0]);
              
              // 检查字段是否匹配
              const fieldsMatch = expectedFields.every(field => actualFields.includes(field)) &&
                                actualFields.every(field => expectedFields.includes(field));
              
              if (fieldsMatch) {
                console.log(`  ✅ ${ruleName}: 字段完全匹配`);
                passedRules++;
              } else {
                console.log(`  ❌ ${ruleName}: 字段不匹配`);
                console.log(`     期望: [${expectedFields.join(', ')}]`);
                console.log(`     实际: [${actualFields.join(', ')}]`);
              }
            } else {
              console.log(`  ⚠️  ${ruleName}: 无数据返回`);
            }
          } catch (sqlError) {
            console.log(`  ❌ ${ruleName}: SQL执行错误 - ${sqlError.message}`);
          }
          
        } catch (error) {
          console.log(`  ❌ ${ruleName}: 验证失败 - ${error.message}`);
        }
      }
      console.log('');
    }
    
    // 特殊验证：批次669033的上线情况查询
    console.log('=== 特殊验证：批次669033上线情况查询 ===');
    try {
      const batchSQL = `
SELECT
  factory as 工厂,
  'Baseline-V1.0' as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  batch_code as 批次号,
  CONCAT(ROUND(COALESCE(defect_rate, 0) * 100, 2), '%') as 不良率,
  COALESCE(exception_count, 0) as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE batch_code LIKE CONCAT('%', ?, '%')
ORDER BY online_date DESC
LIMIT 20`;
      
      const [batchResult] = await connection.execute(batchSQL, ['669033']);
      console.log(`批次669033查询结果: ${batchResult.length} 条记录`);
      
      if (batchResult.length > 0) {
        const fields = Object.keys(batchResult[0]);
        const expectedOnlineFields = standardFields.online;
        const fieldsMatch = expectedOnlineFields.every(field => fields.includes(field)) &&
                          fields.every(field => expectedOnlineFields.includes(field));
        
        if (fieldsMatch) {
          console.log('✅ 批次669033查询字段完全匹配上线页面设计');
          console.log(`   返回字段: [${fields.join(', ')}]`);
        } else {
          console.log('❌ 批次669033查询字段不匹配');
          console.log(`   期望: [${expectedOnlineFields.join(', ')}]`);
          console.log(`   实际: [${fields.join(', ')}]`);
        }
      }
    } catch (error) {
      console.log(`❌ 批次669033查询验证失败: ${error.message}`);
    }
    
    // 验证对比类规则
    console.log('\n=== 验证对比类规则 ===');
    const comparisonRules = ['供应商对比分析', '物料对比分析', '物料大类别质量对比', '供应商质量评级'];
    
    for (const ruleName of comparisonRules) {
      try {
        const [ruleData] = await connection.execute(
          'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ?',
          [ruleName]
        );
        
        if (ruleData.length > 0) {
          const sql = ruleData[0].action_target;
          const [result] = await connection.execute(sql.replace(/LIMIT \d+/, 'LIMIT 1'));
          
          if (result.length > 0) {
            const fields = Object.keys(result[0]);
            console.log(`✅ ${ruleName}: 返回 ${fields.length} 个字段`);
            console.log(`   字段: [${fields.join(', ')}]`);
          } else {
            console.log(`⚠️  ${ruleName}: 无数据返回`);
          }
        } else {
          console.log(`❌ ${ruleName}: 规则不存在`);
        }
      } catch (error) {
        console.log(`❌ ${ruleName}: 验证失败 - ${error.message}`);
      }
    }
    
    // 总结
    console.log('\n=== 验证总结 ===');
    console.log(`总规则数: ${totalRules}`);
    console.log(`通过验证: ${passedRules}`);
    console.log(`通过率: ${((passedRules / totalRules) * 100).toFixed(2)}%`);
    
    if (passedRules === totalRules) {
      console.log('\n🎉 所有规则字段验证通过！数据呈现完全符合真实页面设计！');
    } else {
      console.log(`\n⚠️  还有 ${totalRules - passedRules} 个规则需要进一步优化`);
    }
    
    console.log('\n📋 标准字段设计总结:');
    console.log('1）库存页面: 工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注');
    console.log('2）上线页面: 工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注');
    console.log('3）测试页面: 测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注');
    console.log('4）批次管理: 批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注');
    
  } catch (error) {
    console.error('❌ 验证过程中出错:', error);
  } finally {
    await connection.end();
  }
}

verifyAllRulesFieldConsistency();
