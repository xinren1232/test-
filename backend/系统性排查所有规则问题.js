import mysql from 'mysql2/promise';

async function systematicRuleCheck() {
  let connection;
  
  try {
    console.log('🔍 系统性排查所有规则的字段映射和参数处理问题...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 定义场景字段标准
    const scenarioFieldStandards = {
      '库存场景': ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
      '测试场景': ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
      '上线场景': ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
      '批次管理': ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
    };
    
    // 常见的错误字段映射模式
    const commonFieldErrors = {
      'supplier': 'supplier_name',
      'factory': 'storage_location',
      'warehouse': 'storage_location', 
      'materialCode': 'material_code',
      'materialName': 'material_name',
      'supplierName': 'supplier_name',
      'testId': 'test_id',
      'testDate': 'test_date',
      'projectId': 'project_id',
      'baselineId': 'baseline_id',
      'lastUpdateTime': 'updated_at',
      'createTime': 'created_at'
    };
    
    // SQL函数问题模式
    const sqlFunctionPatterns = [
      'DATE_FORMAT(',
      'COALESCE(',
      'CONCAT(',
      'COUNT(',
      'SUM(',
      'AVG(',
      'MAX(',
      'MIN(',
      'GROUP_CONCAT('
    ];
    
    // 1. 获取所有规则
    console.log('\n📋 步骤1: 获取所有规则...');
    
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, category, action_target, created_at
      FROM nlp_intent_rules 
      ORDER BY category, id
    `);
    
    console.log(`找到 ${allRules.length} 条规则，开始逐一排查...\n`);
    
    const problemRules = [];
    let checkedCount = 0;
    
    // 2. 逐一检查每个规则
    for (const rule of allRules) {
      checkedCount++;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`[${checkedCount}/${allRules.length}] 检查规则${rule.id}: ${rule.intent_name}`);
      console.log(`分类: ${rule.category}`);
      console.log(`${'='.repeat(80)}`);
      
      const ruleProblems = {
        ruleId: rule.id,
        ruleName: rule.intent_name,
        category: rule.category,
        sql: rule.action_target,
        issues: [],
        severity: 'low'
      };
      
      const sql = rule.action_target || '';
      
      // 检查1: 错误的字段名映射
      console.log('🔍 检查1: 错误的字段名映射');
      let hasFieldErrors = false;
      
      Object.entries(commonFieldErrors).forEach(([wrongField, correctField]) => {
        if (sql.includes(wrongField) && !sql.includes(correctField)) {
          ruleProblems.issues.push(`错误字段映射: ${wrongField} 应为 ${correctField}`);
          hasFieldErrors = true;
        }
      });
      
      console.log(`   字段映射: ${hasFieldErrors ? '❌ 发现错误' : '✅ 正常'}`);
      
      // 检查2: SQL函数显示为字段名
      console.log('🔍 检查2: SQL函数显示为字段名');
      let hasSQLFunctionIssues = false;
      
      sqlFunctionPatterns.forEach(pattern => {
        const regex = new RegExp(`${pattern.replace('(', '\\(')}[^)]*\\)\\s+as\\s+([^,\\s]+)`, 'gi');
        const matches = sql.match(regex);
        if (matches) {
          matches.forEach(match => {
            // 检查是否函数名出现在字段别名中
            if (match.toLowerCase().includes(pattern.toLowerCase().replace('(', ''))) {
              ruleProblems.issues.push(`SQL函数问题: ${match.trim()}`);
              hasSQLFunctionIssues = true;
            }
          });
        }
      });
      
      console.log(`   SQL函数: ${hasSQLFunctionIssues ? '❌ 发现问题' : '✅ 正常'}`);
      
      // 检查3: 参数处理问题
      console.log('🔍 检查3: 参数处理问题');
      let hasParameterIssues = false;
      
      const hasParameters = sql.includes('?');
      const hasWhereClause = sql.toLowerCase().includes('where');
      const hasGenericWhere = sql.includes('WHERE 1=1');
      
      if (hasParameters && hasGenericWhere) {
        ruleProblems.issues.push('参数处理问题: 有参数但使用通用WHERE 1=1条件');
        hasParameterIssues = true;
      }
      
      if (!hasParameters && rule.intent_name.includes('查询') && !rule.intent_name.includes('所有')) {
        // 查询类规则通常需要参数
        ruleProblems.issues.push('参数处理问题: 查询类规则可能缺少参数');
        hasParameterIssues = true;
      }
      
      console.log(`   参数处理: ${hasParameterIssues ? '❌ 发现问题' : '✅ 正常'}`);
      
      // 检查4: 场景字段设计匹配
      console.log('🔍 检查4: 场景字段设计匹配');
      let hasScenarioIssues = false;
      
      const expectedFields = scenarioFieldStandards[rule.category];
      if (expectedFields) {
        // 提取SQL中的字段别名
        const aliasRegex = /\s+as\s+([^\s,]+)/gi;
        const aliases = [];
        let match;
        while ((match = aliasRegex.exec(sql)) !== null) {
          aliases.push(match[1]);
        }
        
        if (aliases.length > 0) {
          const missingFields = expectedFields.filter(field => !aliases.includes(field));
          if (missingFields.length > 0) {
            ruleProblems.issues.push(`场景字段不匹配: 缺少 ${missingFields.join(', ')}`);
            hasScenarioIssues = true;
          }
          
          console.log(`   期望字段 (${expectedFields.length}): ${expectedFields.join(', ')}`);
          console.log(`   实际字段 (${aliases.length}): ${aliases.join(', ')}`);
        } else {
          ruleProblems.issues.push('场景字段问题: 无法提取字段别名');
          hasScenarioIssues = true;
        }
      }
      
      console.log(`   场景匹配: ${hasScenarioIssues ? '❌ 发现问题' : '✅ 正常'}`);
      
      // 确定问题严重程度
      if (ruleProblems.issues.length > 0) {
        if (hasFieldErrors || hasSQLFunctionIssues) {
          ruleProblems.severity = 'high';
        } else if (hasParameterIssues || hasScenarioIssues) {
          ruleProblems.severity = 'medium';
        }
        
        problemRules.push(ruleProblems);
        
        console.log(`\n📊 规则${rule.id}问题汇总:`);
        console.log(`   严重程度: ${ruleProblems.severity === 'high' ? '🔴 高' : ruleProblems.severity === 'medium' ? '🟡 中' : '🟢 低'}`);
        console.log(`   问题数量: ${ruleProblems.issues.length}个`);
        ruleProblems.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
      } else {
        console.log(`\n✅ 规则${rule.id}检查通过，无问题发现`);
      }
    }
    
    console.log('\n🎉 所有规则检查完成！生成问题报告...\n');

    // 3. 生成综合问题报告
    console.log('📊 综合问题报告');
    console.log('='.repeat(100));

    const totalRules = allRules.length;
    const problemRulesCount = problemRules.length;
    const healthyRulesCount = totalRules - problemRulesCount;

    console.log(`\n📈 总体统计:`);
    console.log(`   规则总数: ${totalRules}`);
    console.log(`   健康规则: ${healthyRulesCount} (${(healthyRulesCount/totalRules*100).toFixed(1)}%)`);
    console.log(`   问题规则: ${problemRulesCount} (${(problemRulesCount/totalRules*100).toFixed(1)}%)`);

    // 按严重程度统计
    const highSeverity = problemRules.filter(r => r.severity === 'high');
    const mediumSeverity = problemRules.filter(r => r.severity === 'medium');
    const lowSeverity = problemRules.filter(r => r.severity === 'low');

    console.log(`\n🚨 按严重程度统计:`);
    console.log(`   🔴 高危规则: ${highSeverity.length} (需要立即修复)`);
    console.log(`   🟡 中危规则: ${mediumSeverity.length} (建议优化)`);
    console.log(`   🟢 低危规则: ${lowSeverity.length} (可选修复)`);

    // 按分类统计
    console.log(`\n📋 按分类统计:`);
    const categories = [...new Set(allRules.map(r => r.category))];
    categories.forEach(category => {
      const categoryRules = allRules.filter(r => r.category === category);
      const categoryProblems = problemRules.filter(r => r.category === category);
      const healthyCount = categoryRules.length - categoryProblems.length;
      console.log(`   ${category}: ${healthyCount}/${categoryRules.length} 健康 (${(healthyCount/categoryRules.length*100).toFixed(1)}%)`);
    });

    // 问题类型统计
    console.log(`\n🔍 问题类型统计:`);
    const issueTypes = {};
    problemRules.forEach(rule => {
      rule.issues.forEach(issue => {
        const issueType = issue.split(':')[0];
        if (!issueTypes[issueType]) {
          issueTypes[issueType] = 0;
        }
        issueTypes[issueType]++;
      });
    });

    Object.entries(issueTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}个规则`);
    });

    // 高危规则详情
    if (highSeverity.length > 0) {
      console.log(`\n🔴 高危规则详情 (需要立即修复):`);
      highSeverity.forEach((rule, index) => {
        console.log(`\n${index + 1}. 规则${rule.ruleId}: ${rule.ruleName} (${rule.category})`);
        rule.issues.forEach((issue, issueIndex) => {
          console.log(`   ${issueIndex + 1}) ${issue}`);
        });
      });
    }

    // 修复建议
    console.log(`\n💡 修复建议优先级:`);
    console.log(`   1. 🔴 立即修复高危规则 (${highSeverity.length}个)`);
    console.log(`      - 字段映射错误会导致SQL执行失败`);
    console.log(`      - SQL函数显示问题影响用户体验`);
    console.log(`   2. 🟡 优化中危规则 (${mediumSeverity.length}个)`);
    console.log(`      - 参数处理问题影响查询准确性`);
    console.log(`      - 场景字段不匹配影响显示效果`);
    console.log(`   3. 🟢 可选修复低危规则 (${lowSeverity.length}个)`);

    // 生成修复脚本建议
    if (highSeverity.length > 0) {
      console.log(`\n🔧 建议生成修复脚本处理以下高危规则:`);
      highSeverity.slice(0, 10).forEach(rule => {
        console.log(`   - 规则${rule.ruleId}: ${rule.ruleName}`);
      });
    }

    console.log(`\n🎯 排查结论:`);
    if (problemRulesCount === 0) {
      console.log(`✅ 所有规则都健康，无需修复`);
    } else if (problemRulesCount / totalRules <= 0.1) {
      console.log(`✅ 规则质量优秀，仅有少量问题需要修复`);
    } else if (problemRulesCount / totalRules <= 0.3) {
      console.log(`⚠️ 规则质量良好，建议修复发现的问题`);
    } else {
      console.log(`❌ 规则质量需要大幅改进，建议系统性修复`);
    }

    console.log('\n🎉 系统性规则问题排查完成！');

  } catch (error) {
    console.error('❌ 系统性规则排查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

systematicRuleCheck().catch(console.error);
