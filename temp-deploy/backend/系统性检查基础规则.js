import mysql from 'mysql2/promise';

async function comprehensiveRuleCheck() {
  let connection;
  
  try {
    console.log('🔍 开始系统性检查后端基础规则...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 定义要检查的基础规则
    const basicRules = [
      {
        id: 243,
        name: '物料库存信息查询_优化',
        category: '库存场景',
        table: 'inventory',
        needsParam: true,
        testParam: '电池',
        expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注']
      },
      {
        id: 314,
        name: '物料测试情况查询',
        category: '测试场景', 
        table: 'lab_tests',
        needsParam: true,
        testParam: 'LCD',
        expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
      },
      {
        id: 335,
        name: '物料测试结果查询_优化',
        category: '测试场景',
        table: 'lab_tests', 
        needsParam: true,
        testParam: 'LCD',
        expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
      },
      {
        id: 480,
        name: '查看所有物料',
        category: '数据探索',
        table: 'inventory',
        needsParam: false,
        expectedFields: ['物料名称', '物料编码', '记录数量']
      },
      {
        id: 485,
        name: '查看所有供应商',
        category: '数据探索', 
        table: 'inventory',
        needsParam: false,
        expectedFields: ['供应商', '记录数量']
      }
    ];
    
    console.log(`\n📋 将检查 ${basicRules.length} 个基础规则...\n`);
    
    const results = [];
    
    // 逐个检查规则
    for (const rule of basicRules) {
      console.log(`🔍 检查规则${rule.id}: ${rule.name}`);
      console.log(`   分类: ${rule.category} | 表: ${rule.table} | 需要参数: ${rule.needsParam ? '是' : '否'}`);
      
      const result = {
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        table: rule.table,
        success: false,
        recordCount: 0,
        fields: [],
        hasChineseFields: false,
        fieldMatch: false,
        errors: []
      };
      
      try {
        // 1. 获取规则SQL
        const [ruleData] = await connection.execute(
          'SELECT action_target FROM nlp_intent_rules WHERE id = ?',
          [rule.id]
        );
        
        if (ruleData.length === 0) {
          result.errors.push('规则不存在');
          console.log('   ❌ 规则不存在');
          results.push(result);
          continue;
        }
        
        let sql = ruleData[0].action_target;
        console.log(`   SQL: ${sql.substring(0, 100)}...`);
        
        // 2. 处理参数
        if (rule.needsParam && sql.includes('?')) {
          sql = sql.replace(/\?/g, `'${rule.testParam}'`);
          console.log(`   使用测试参数: ${rule.testParam}`);
        }
        
        // 3. 执行SQL
        const [queryResults] = await connection.execute(sql);
        result.recordCount = queryResults.length;
        console.log(`   📊 返回记录数: ${result.recordCount}`);
        
        if (queryResults.length > 0) {
          // 4. 检查字段
          result.fields = Object.keys(queryResults[0]);
          result.hasChineseFields = result.fields.every(field => /[\u4e00-\u9fa5]/.test(field));
          
          console.log(`   🏷️ 返回字段: ${result.fields.join(', ')}`);
          console.log(`   ${result.hasChineseFields ? '✅' : '❌'} 字段名检查: ${result.hasChineseFields ? '全部为中文' : '包含非中文字段'}`);
          
          // 5. 检查字段匹配
          const expectedSet = new Set(rule.expectedFields);
          const actualSet = new Set(result.fields);
          const missingFields = rule.expectedFields.filter(field => !actualSet.has(field));
          const extraFields = result.fields.filter(field => !expectedSet.has(field));
          
          result.fieldMatch = missingFields.length === 0;
          
          if (result.fieldMatch) {
            console.log('   ✅ 字段匹配: 完全匹配');
          } else {
            console.log(`   ❌ 字段匹配: 缺少字段 [${missingFields.join(', ')}]`);
            if (extraFields.length > 0) {
              console.log(`   ⚠️ 额外字段: [${extraFields.join(', ')}]`);
            }
          }
          
          // 6. 显示数据样本
          console.log('   📄 数据样本:');
          const sample = queryResults[0];
          Object.entries(sample).forEach(([field, value]) => {
            const displayValue = value === null ? 'NULL' : 
                                value === '' ? '(空字符串)' :
                                String(value).length > 50 ? String(value).substring(0, 50) + '...' :
                                value;
            console.log(`     ${field}: ${displayValue}`);
          });
          
          result.success = result.hasChineseFields && result.fieldMatch && result.recordCount > 0;
        } else {
          console.log('   ⚠️ 无数据返回');
          if (rule.needsParam) {
            result.errors.push('可能需要不同的测试参数');
          } else {
            result.errors.push('数据库中无相关数据');
          }
        }
        
      } catch (error) {
        result.errors.push(error.message);
        console.log(`   ❌ 执行失败: ${error.message}`);
      }
      
      results.push(result);
      console.log(`   ${result.success ? '✅ 通过' : '❌ 失败'}\n`);
    }
    
    // 生成检查报告
    console.log('📊 基础规则检查报告');
    console.log('='.repeat(60));
    
    const passedRules = results.filter(r => r.success);
    const failedRules = results.filter(r => !r.success);
    
    console.log(`\n✅ 通过规则 (${passedRules.length}/${results.length}):`);
    passedRules.forEach(rule => {
      console.log(`   规则${rule.ruleId}: ${rule.ruleName} - ${rule.recordCount}条记录`);
    });
    
    if (failedRules.length > 0) {
      console.log(`\n❌ 失败规则 (${failedRules.length}/${results.length}):`);
      failedRules.forEach(rule => {
        console.log(`   规则${rule.ruleId}: ${rule.ruleName}`);
        rule.errors.forEach(error => {
          console.log(`     - ${error}`);
        });
      });
    }
    
    // 按分类统计
    console.log('\n📈 按分类统计:');
    const categories = [...new Set(results.map(r => r.category))];
    categories.forEach(category => {
      const categoryRules = results.filter(r => r.category === category);
      const categoryPassed = categoryRules.filter(r => r.success).length;
      console.log(`   ${category}: ${categoryPassed}/${categoryRules.length} 通过`);
    });
    
    // 字段检查统计
    console.log('\n🏷️ 字段检查统计:');
    const chineseFieldsCount = results.filter(r => r.hasChineseFields).length;
    const fieldMatchCount = results.filter(r => r.fieldMatch).length;
    console.log(`   中文字段: ${chineseFieldsCount}/${results.length} 规则`);
    console.log(`   字段匹配: ${fieldMatchCount}/${results.length} 规则`);
    
    // 数据量统计
    console.log('\n📊 数据量统计:');
    results.forEach(rule => {
      if (rule.recordCount > 0) {
        console.log(`   规则${rule.ruleId}: ${rule.recordCount}条记录`);
      }
    });
    
    // 总体评估
    const overallScore = (passedRules.length / results.length * 100).toFixed(1);
    console.log(`\n🎯 总体评估: ${overallScore}% 通过率`);
    
    if (overallScore >= 80) {
      console.log('✅ 基础规则状态良好，可以继续检查前端功能');
    } else if (overallScore >= 60) {
      console.log('⚠️ 基础规则部分存在问题，建议修复后再检查前端');
    } else {
      console.log('❌ 基础规则存在较多问题，需要优先修复');
    }
    
    console.log('\n🎉 基础规则检查完成！');
    
  } catch (error) {
    console.error('❌ 系统性检查基础规则失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

comprehensiveRuleCheck().catch(console.error);
