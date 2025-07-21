import mysql from 'mysql2/promise';

async function comprehensiveRuleValidation() {
  let connection;
  
  try {
    console.log('🔍 开始后端规则多维度测试验证...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 定义场景的真实字段设计标准
    const scenarioFieldStandards = {
      '库存场景': {
        expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
        description: '库存页面字段设计'
      },
      '测试场景': {
        expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
        description: '测试页面字段设计'
      },
      '上线场景': {
        expectedFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
        description: '上线页面字段设计'
      },
      '数据探索': {
        expectedFields: [], // 数据探索类规则字段可变
        description: '数据探索类查询'
      }
    };
    
    // 1. 获取所有规则进行测试
    console.log('\n📋 步骤1: 获取所有规则...');
    
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, category, action_target, created_at
      FROM nlp_intent_rules 
      ORDER BY category, id
    `);
    
    console.log(`找到 ${allRules.length} 条规则，开始逐一验证...\n`);
    
    const validationResults = [];
    let processedCount = 0;
    
    // 2. 逐一测试每个规则
    for (const rule of allRules) {
      processedCount++;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`[${processedCount}/${allRules.length}] 测试规则${rule.id}: ${rule.intent_name}`);
      console.log(`分类: ${rule.category}`);
      console.log(`${'='.repeat(80)}`);
      
      const result = {
        ruleId: rule.id,
        ruleName: rule.intent_name,
        category: rule.category,
        sql: rule.action_target,
        
        // 维度1: 完整性检查
        completeness: {
          hasValidSQL: false,
          hasChineseFields: false,
          noEmptyContent: false,
          fieldMappingCorrect: false
        },
        
        // 维度2: 真实数据调用
        realDataAccess: {
          canExecute: false,
          hasRealData: false,
          dataSource: 'unknown',
          recordCount: 0
        },
        
        // 维度3: 数量限制检查
        quantityLimits: {
          hasLimit: false,
          limitValue: null,
          isReasonableLimit: true
        },
        
        // 维度4: 场景字段设计呈现
        scenarioFieldDesign: {
          matchesScenario: false,
          expectedFields: [],
          actualFields: [],
          missingFields: [],
          extraFields: []
        },
        
        issues: [],
        recommendations: []
      };
      
      try {
        const sql = rule.action_target;
        
        // 维度1: 完整性检查
        console.log('\n🔍 维度1: 完整性检查');
        
        // 检查SQL有效性
        result.completeness.hasValidSQL = sql && sql.trim().length > 0;
        console.log(`   SQL有效性: ${result.completeness.hasValidSQL ? '✅' : '❌'}`);
        
        if (!result.completeness.hasValidSQL) {
          result.issues.push('SQL为空或无效');
        }
        
        // 维度3: 数量限制检查
        console.log('\n📊 维度3: 数量限制检查');
        
        const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          result.quantityLimits.hasLimit = true;
          result.quantityLimits.limitValue = parseInt(limitMatch[1]);
          
          // 判断限制是否合理
          if (rule.category === '数据探索') {
            result.quantityLimits.isReasonableLimit = false;
            result.issues.push(`数据探索类规则不应有LIMIT限制`);
          } else if (result.quantityLimits.limitValue < 50) {
            result.quantityLimits.isReasonableLimit = false;
            result.issues.push(`LIMIT ${result.quantityLimits.limitValue} 过小，建议至少50`);
          }
          
          console.log(`   LIMIT限制: ${result.quantityLimits.limitValue} ${result.quantityLimits.isReasonableLimit ? '✅' : '❌'}`);
        } else {
          console.log(`   LIMIT限制: 无限制 ✅`);
        }
        
        // 维度2: 真实数据调用测试
        console.log('\n🗄️ 维度2: 真实数据调用测试');
        
        try {
          let testSQL = sql;
          
          // 处理参数
          if (testSQL.includes('?')) {
            if (rule.category.includes('库存')) {
              testSQL = testSQL.replace(/\?/g, "'电池'");
            } else if (rule.category.includes('测试')) {
              testSQL = testSQL.replace(/\?/g, "'LCD'");
            } else {
              testSQL = testSQL.replace(/\?/g, "'测试'");
            }
            console.log(`   参数处理: 已替换参数`);
          }
          
          const [results] = await connection.execute(testSQL);
          result.realDataAccess.canExecute = true;
          result.realDataAccess.recordCount = results.length;
          result.realDataAccess.dataSource = 'MySQL';
          result.realDataAccess.hasRealData = results.length > 0;
          
          console.log(`   SQL执行: ✅ 成功`);
          console.log(`   数据源: MySQL ✅`);
          console.log(`   记录数量: ${result.realDataAccess.recordCount} ${result.realDataAccess.hasRealData ? '✅' : '⚠️'}`);
          
          if (results.length > 0) {
            const fields = Object.keys(results[0]);
            result.scenarioFieldDesign.actualFields = fields;
            
            // 维度1: 字段检查
            result.completeness.hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
            console.log(`   中文字段: ${result.completeness.hasChineseFields ? '✅' : '❌'}`);
            
            if (!result.completeness.hasChineseFields) {
              const nonChineseFields = fields.filter(field => !/[\u4e00-\u9fa5]/.test(field));
              result.issues.push(`包含非中文字段: ${nonChineseFields.join(', ')}`);
            }
            
            // 检查空白内容
            const sampleData = results[0];
            const hasEmptyContent = Object.values(sampleData).some(value => 
              value === null || value === undefined || value === ''
            );
            result.completeness.noEmptyContent = !hasEmptyContent;
            console.log(`   无空白内容: ${result.completeness.noEmptyContent ? '✅' : '⚠️'}`);
            
            // 维度4: 场景字段设计呈现检查
            console.log('\n🎯 维度4: 场景字段设计呈现检查');
            
            const scenarioStandard = scenarioFieldStandards[rule.category];
            if (scenarioStandard && scenarioStandard.expectedFields.length > 0) {
              result.scenarioFieldDesign.expectedFields = scenarioStandard.expectedFields;
              
              // 检查字段匹配
              const expectedSet = new Set(scenarioStandard.expectedFields);
              const actualSet = new Set(fields);
              
              result.scenarioFieldDesign.missingFields = scenarioStandard.expectedFields.filter(field => !actualSet.has(field));
              result.scenarioFieldDesign.extraFields = fields.filter(field => !expectedSet.has(field));
              result.scenarioFieldDesign.matchesScenario = result.scenarioFieldDesign.missingFields.length === 0;
              
              console.log(`   场景标准: ${scenarioStandard.description}`);
              console.log(`   期望字段 (${scenarioStandard.expectedFields.length}): ${scenarioStandard.expectedFields.join(', ')}`);
              console.log(`   实际字段 (${fields.length}): ${fields.join(', ')}`);
              console.log(`   字段匹配: ${result.scenarioFieldDesign.matchesScenario ? '✅' : '❌'}`);
              
              if (result.scenarioFieldDesign.missingFields.length > 0) {
                console.log(`   缺少字段: ${result.scenarioFieldDesign.missingFields.join(', ')}`);
                result.issues.push(`缺少场景字段: ${result.scenarioFieldDesign.missingFields.join(', ')}`);
              }
              
              if (result.scenarioFieldDesign.extraFields.length > 0) {
                console.log(`   额外字段: ${result.scenarioFieldDesign.extraFields.join(', ')}`);
              }
              
              result.completeness.fieldMappingCorrect = result.scenarioFieldDesign.matchesScenario;
            } else {
              console.log(`   场景标准: 数据探索类，字段可变 ✅`);
              result.scenarioFieldDesign.matchesScenario = true;
              result.completeness.fieldMappingCorrect = true;
            }
            
            // 显示数据样本
            console.log('\n📄 数据样本:');
            Object.entries(sampleData).slice(0, 5).forEach(([field, value]) => {
              const displayValue = value === null ? 'NULL' : 
                                 value === '' ? '(空字符串)' :
                                 String(value).length > 30 ? String(value).substring(0, 30) + '...' :
                                 value;
              console.log(`     ${field}: ${displayValue}`);
            });
            
          } else {
            console.log(`   ⚠️ 无数据返回`);
            if (testSQL.includes('?')) {
              result.issues.push('可能需要不同的测试参数');
            } else {
              result.issues.push('数据库中无相关数据');
            }
          }
          
        } catch (sqlError) {
          result.realDataAccess.canExecute = false;
          result.issues.push(`SQL执行失败: ${sqlError.message}`);
          console.log(`   SQL执行: ❌ ${sqlError.message}`);
        }
        
      } catch (error) {
        result.issues.push(`规则测试异常: ${error.message}`);
        console.log(`   ❌ 测试异常: ${error.message}`);
      }
      
      // 生成建议
      if (result.issues.length > 0) {
        if (!result.completeness.hasChineseFields) {
          result.recommendations.push('为所有字段添加中文别名');
        }
        if (!result.realDataAccess.hasRealData) {
          result.recommendations.push('检查查询条件和数据源');
        }
        if (!result.quantityLimits.isReasonableLimit) {
          result.recommendations.push('调整或移除不合理的LIMIT限制');
        }
        if (!result.scenarioFieldDesign.matchesScenario) {
          result.recommendations.push('调整字段映射以匹配场景设计');
        }
      }
      
      validationResults.push(result);
      
      // 显示当前规则总体状态
      const overallStatus = result.issues.length === 0 ? '✅ 通过' : `❌ ${result.issues.length}个问题`;
      console.log(`\n📊 规则${rule.id}总体状态: ${overallStatus}`);
      
      if (result.issues.length > 0) {
        console.log('   问题列表:');
        result.issues.forEach(issue => console.log(`     - ${issue}`));
      }
    }
    
    console.log('\n🎉 所有规则测试完成！开始生成综合报告...\n');

    // 3. 生成综合测试报告
    console.log('📊 综合测试报告');
    console.log('='.repeat(100));

    const totalRules = validationResults.length;

    // 维度1统计: 完整性
    const completenessStats = {
      validSQL: validationResults.filter(r => r.completeness.hasValidSQL).length,
      chineseFields: validationResults.filter(r => r.completeness.hasChineseFields).length,
      noEmptyContent: validationResults.filter(r => r.completeness.noEmptyContent).length,
      correctFieldMapping: validationResults.filter(r => r.completeness.fieldMappingCorrect).length
    };

    // 维度2统计: 真实数据调用
    const dataAccessStats = {
      canExecute: validationResults.filter(r => r.realDataAccess.canExecute).length,
      hasRealData: validationResults.filter(r => r.realDataAccess.hasRealData).length,
      mysqlSource: validationResults.filter(r => r.realDataAccess.dataSource === 'MySQL').length
    };

    // 维度3统计: 数量限制
    const limitStats = {
      hasLimit: validationResults.filter(r => r.quantityLimits.hasLimit).length,
      reasonableLimit: validationResults.filter(r => r.quantityLimits.isReasonableLimit).length
    };

    // 维度4统计: 场景字段设计
    const scenarioStats = {
      matchesScenario: validationResults.filter(r => r.scenarioFieldDesign.matchesScenario).length
    };

    // 总体通过率
    const overallPassRate = validationResults.filter(r => r.issues.length === 0).length;

    console.log(`\n📈 总体统计 (${totalRules}条规则):`);
    console.log(`   完全通过: ${overallPassRate}/${totalRules} (${(overallPassRate/totalRules*100).toFixed(1)}%)`);
    console.log(`   存在问题: ${totalRules - overallPassRate}/${totalRules} (${((totalRules - overallPassRate)/totalRules*100).toFixed(1)}%)`);

    console.log(`\n🔍 维度1: 完整性检查`);
    console.log(`   有效SQL: ${completenessStats.validSQL}/${totalRules} (${(completenessStats.validSQL/totalRules*100).toFixed(1)}%)`);
    console.log(`   中文字段: ${completenessStats.chineseFields}/${totalRules} (${(completenessStats.chineseFields/totalRules*100).toFixed(1)}%)`);
    console.log(`   无空白内容: ${completenessStats.noEmptyContent}/${totalRules} (${(completenessStats.noEmptyContent/totalRules*100).toFixed(1)}%)`);
    console.log(`   字段映射正确: ${completenessStats.correctFieldMapping}/${totalRules} (${(completenessStats.correctFieldMapping/totalRules*100).toFixed(1)}%)`);

    console.log(`\n🗄️ 维度2: 真实数据调用`);
    console.log(`   可执行: ${dataAccessStats.canExecute}/${totalRules} (${(dataAccessStats.canExecute/totalRules*100).toFixed(1)}%)`);
    console.log(`   有真实数据: ${dataAccessStats.hasRealData}/${totalRules} (${(dataAccessStats.hasRealData/totalRules*100).toFixed(1)}%)`);
    console.log(`   MySQL数据源: ${dataAccessStats.mysqlSource}/${totalRules} (${(dataAccessStats.mysqlSource/totalRules*100).toFixed(1)}%)`);

    console.log(`\n📊 维度3: 数量限制检查`);
    console.log(`   包含LIMIT: ${limitStats.hasLimit}/${totalRules} (${(limitStats.hasLimit/totalRules*100).toFixed(1)}%)`);
    console.log(`   合理限制: ${limitStats.reasonableLimit}/${totalRules} (${(limitStats.reasonableLimit/totalRules*100).toFixed(1)}%)`);

    console.log(`\n🎯 维度4: 场景字段设计`);
    console.log(`   匹配场景设计: ${scenarioStats.matchesScenario}/${totalRules} (${(scenarioStats.matchesScenario/totalRules*100).toFixed(1)}%)`);

    // 按分类统计
    console.log(`\n📋 按分类统计:`);
    const categories = [...new Set(validationResults.map(r => r.category))];
    categories.forEach(category => {
      const categoryRules = validationResults.filter(r => r.category === category);
      const categoryPassed = categoryRules.filter(r => r.issues.length === 0);
      console.log(`   ${category}: ${categoryPassed.length}/${categoryRules.length} 通过 (${(categoryPassed.length/categoryRules.length*100).toFixed(1)}%)`);
    });

    // 问题汇总
    console.log(`\n❌ 主要问题汇总:`);
    const allIssues = validationResults.flatMap(r => r.issues);
    const issueTypes = {};
    allIssues.forEach(issue => {
      const issueType = issue.split(':')[0];
      if (!issueTypes[issueType]) {
        issueTypes[issueType] = 0;
      }
      issueTypes[issueType]++;
    });

    Object.entries(issueTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}个规则`);
    });

    // 需要重点关注的规则
    console.log(`\n⚠️ 需要重点关注的规则:`);
    const problemRules = validationResults.filter(r => r.issues.length > 0);
    problemRules.slice(0, 10).forEach(rule => {
      console.log(`   规则${rule.ruleId} (${rule.category}): ${rule.ruleName}`);
      rule.issues.slice(0, 2).forEach(issue => {
        console.log(`     - ${issue}`);
      });
    });

    // 修复建议
    console.log(`\n💡 修复建议优先级:`);
    console.log(`   1. 优先修复字段映射问题 (影响${totalRules - completenessStats.correctFieldMapping}个规则)`);
    console.log(`   2. 确保所有字段为中文 (影响${totalRules - completenessStats.chineseFields}个规则)`);
    console.log(`   3. 修复SQL执行问题 (影响${totalRules - dataAccessStats.canExecute}个规则)`);
    console.log(`   4. 处理数据为空的规则 (影响${dataAccessStats.canExecute - dataAccessStats.hasRealData}个规则)`);

    console.log(`\n🎯 测试结论:`);
    if (overallPassRate / totalRules >= 0.9) {
      console.log(`✅ 规则质量优秀 (${(overallPassRate/totalRules*100).toFixed(1)}% 通过率)`);
    } else if (overallPassRate / totalRules >= 0.7) {
      console.log(`⚠️ 规则质量良好，需要优化 (${(overallPassRate/totalRules*100).toFixed(1)}% 通过率)`);
    } else {
      console.log(`❌ 规则质量需要大幅改进 (${(overallPassRate/totalRules*100).toFixed(1)}% 通过率)`);
    }

    console.log('\n🎉 多维度测试验证完成！');

  } catch (error) {
    console.error('❌ 后端规则多维度测试验证失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

comprehensiveRuleValidation().catch(console.error);
