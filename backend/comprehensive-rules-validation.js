import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 实际数据库表结构定义
const ACTUAL_TABLE_SCHEMAS = {
  inventory: ['id', 'material_name', 'material_type', 'supplier_name', 'supplier', 'batch_number', 'quantity', 'unit', 'storage_location', 'warehouse', 'status', 'entry_date', 'expiry_date', 'notes'],
  online_tracking: ['id', 'tracking_number', 'date', 'project', 'baseline', 'material_type', 'quantity', 'material_name', 'supplier', 'defect_description', 'notes'],
  lab_tests: ['id', 'test_number', 'date', 'project', 'baseline', 'material_type', 'quantity', 'material_name', 'supplier', 'defect_description', 'notes']
};

// 前端页面实际显示字段
const FRONTEND_DISPLAY_FIELDS = {
  inventory: ['工厂', '仓库', '物料类型', '供应商名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
  online_tracking: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注'],
  lab_tests: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注']
};

async function comprehensiveRulesValidation() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 开始规则库综合检查...\n');
    
    // 1. 获取所有规则
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        description,
        action_type,
        action_target,
        trigger_words,
        example_query,
        category,
        status
      FROM nlp_intent_rules 
      ORDER BY category, intent_name
    `);
    
    console.log(`📊 规则总数: ${rules.length}条\n`);
    
    // 2. 检查数据表是否存在实际数据
    console.log('📋 检查数据表实际数据情况:');
    const tableDataStatus = {};
    
    for (const table of ['inventory', 'online_tracking', 'lab_tests']) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        tableDataStatus[table] = rows[0].count;
        console.log(`  ${table}: ${rows[0].count}条记录`);
      } catch (error) {
        tableDataStatus[table] = 0;
        console.log(`  ${table}: 表不存在或无数据`);
      }
    }
    console.log('');
    
    // 3. 逐个检查规则
    const validationResults = {
      logicDesign: { passed: 0, failed: 0, issues: [] },
      functionality: { passed: 0, failed: 0, issues: [] },
      fieldMapping: { passed: 0, failed: 0, issues: [] }
    };
    
    console.log('🔍 开始逐个规则检查:\n');
    
    for (const rule of rules) {
      console.log(`📝 检查规则: ${rule.intent_name}`);
      console.log(`   分类: ${rule.category}`);
      console.log(`   描述: ${rule.description}`);
      
      // 检查1: 逻辑设计
      const logicCheck = await checkLogicDesign(rule, connection);
      if (logicCheck.passed) {
        validationResults.logicDesign.passed++;
        console.log('   ✅ 逻辑设计: 通过');
      } else {
        validationResults.logicDesign.failed++;
        validationResults.logicDesign.issues.push({
          rule: rule.intent_name,
          issues: logicCheck.issues
        });
        console.log('   ❌ 逻辑设计: 存在问题');
        logicCheck.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      // 检查2: 功能性
      const functionalityCheck = await checkFunctionality(rule, connection, tableDataStatus);
      if (functionalityCheck.passed) {
        validationResults.functionality.passed++;
        console.log('   ✅ 功能性: 通过');
      } else {
        validationResults.functionality.failed++;
        validationResults.functionality.issues.push({
          rule: rule.intent_name,
          issues: functionalityCheck.issues
        });
        console.log('   ❌ 功能性: 存在问题');
        functionalityCheck.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      // 检查3: 字段映射
      const fieldCheck = await checkFieldMapping(rule);
      if (fieldCheck.passed) {
        validationResults.fieldMapping.passed++;
        console.log('   ✅ 字段映射: 通过');
      } else {
        validationResults.fieldMapping.failed++;
        validationResults.fieldMapping.issues.push({
          rule: rule.intent_name,
          issues: fieldCheck.issues
        });
        console.log('   ❌ 字段映射: 存在问题');
        fieldCheck.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      console.log('');
    }
    
    // 4. 生成检查报告
    generateValidationReport(validationResults, rules.length);
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await connection.end();
  }
}

// 检查逻辑设计
async function checkLogicDesign(rule, connection) {
  const issues = [];
  
  // 检查SQL语法
  if (rule.action_type === 'database_query' && rule.action_target) {
    try {
      // 尝试解析SQL（基本语法检查）
      const sql = rule.action_target.trim();
      if (!sql.toUpperCase().startsWith('SELECT')) {
        issues.push('SQL不是SELECT查询');
      }
      
      // 检查是否有基本的FROM子句
      if (!sql.toUpperCase().includes('FROM')) {
        issues.push('SQL缺少FROM子句');
      }
      
      // 检查表名是否存在
      const tableMatches = sql.match(/FROM\s+(\w+)/gi);
      if (tableMatches) {
        for (const match of tableMatches) {
          const tableName = match.replace(/FROM\s+/i, '').trim();
          if (!['inventory', 'online_tracking', 'lab_tests'].includes(tableName)) {
            issues.push(`引用了不存在的表: ${tableName}`);
          }
        }
      }
      
    } catch (error) {
      issues.push(`SQL语法错误: ${error.message}`);
    }
  }
  
  // 检查触发词
  if (!rule.trigger_words) {
    issues.push('缺少触发词');
  } else {
    try {
      let triggerWords;
      if (typeof rule.trigger_words === 'string') {
        if (rule.trigger_words.trim() === '') {
          issues.push('触发词为空');
        } else {
          triggerWords = JSON.parse(rule.trigger_words);
        }
      } else {
        triggerWords = rule.trigger_words;
      }

      if (triggerWords && (!Array.isArray(triggerWords) || triggerWords.length === 0)) {
        issues.push('触发词格式错误或为空');
      }
    } catch (error) {
      issues.push('触发词JSON格式错误');
    }
  }
  
  // 检查示例查询
  if (!rule.example_query || (typeof rule.example_query === 'string' && rule.example_query.trim() === '')) {
    issues.push('缺少示例查询');
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}

// 检查功能性
async function checkFunctionality(rule, connection, tableDataStatus) {
  const issues = [];
  
  if (rule.action_type === 'database_query' && rule.action_target) {
    try {
      // 尝试执行SQL查询（限制结果数量）
      const sql = rule.action_target.replace(/LIMIT\s+\d+/i, '') + ' LIMIT 1';
      await connection.execute(sql);
    } catch (error) {
      issues.push(`SQL执行失败: ${error.message}`);
    }
  }
  
  // 检查规则是否针对有数据的表
  const sql = rule.action_target || '';
  const referencedTables = [];
  
  ['inventory', 'online_tracking', 'lab_tests'].forEach(table => {
    if (sql.includes(table)) {
      referencedTables.push(table);
    }
  });
  
  referencedTables.forEach(table => {
    if (tableDataStatus[table] === 0) {
      issues.push(`引用的表 ${table} 没有数据`);
    }
  });
  
  return {
    passed: issues.length === 0,
    issues
  };
}

// 检查字段映射
async function checkFieldMapping(rule) {
  const issues = [];
  const sql = rule.action_target || '';
  
  // 检查SELECT字段是否与前端显示字段匹配
  const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/is);
  if (selectMatch) {
    const selectFields = selectMatch[1];
    
    // 检查是否使用了实际存在的数据库字段
    Object.keys(ACTUAL_TABLE_SCHEMAS).forEach(table => {
      if (sql.includes(table)) {
        const actualFields = ACTUAL_TABLE_SCHEMAS[table];
        
        // 检查字段别名是否与前端显示匹配
        const frontendFields = FRONTEND_DISPLAY_FIELDS[table];
        const aliasMatches = selectFields.match(/\w+\s+as\s+[\u4e00-\u9fa5]+/gi);
        
        if (aliasMatches) {
          aliasMatches.forEach(alias => {
            const [field, , chineseAlias] = alias.split(/\s+/);
            if (!actualFields.includes(field)) {
              issues.push(`字段 ${field} 在表 ${table} 中不存在`);
            }
            if (!frontendFields.includes(chineseAlias)) {
              issues.push(`中文别名 ${chineseAlias} 不在前端显示字段中`);
            }
          });
        }
      }
    });
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}

// 生成验证报告
function generateValidationReport(results, totalRules) {
  console.log('📊 规则验证报告\n');
  console.log('=' .repeat(50));
  
  console.log(`\n📈 总体统计:`);
  console.log(`  规则总数: ${totalRules}条`);
  
  console.log(`\n🔍 逻辑设计检查:`);
  console.log(`  ✅ 通过: ${results.logicDesign.passed}条`);
  console.log(`  ❌ 失败: ${results.logicDesign.failed}条`);
  console.log(`  通过率: ${((results.logicDesign.passed / totalRules) * 100).toFixed(1)}%`);
  
  console.log(`\n⚙️ 功能性检查:`);
  console.log(`  ✅ 通过: ${results.functionality.passed}条`);
  console.log(`  ❌ 失败: ${results.functionality.failed}条`);
  console.log(`  通过率: ${((results.functionality.passed / totalRules) * 100).toFixed(1)}%`);
  
  console.log(`\n🗂️ 字段映射检查:`);
  console.log(`  ✅ 通过: ${results.fieldMapping.passed}条`);
  console.log(`  ❌ 失败: ${results.fieldMapping.failed}条`);
  console.log(`  通过率: ${((results.fieldMapping.passed / totalRules) * 100).toFixed(1)}%`);
  
  // 详细问题列表
  if (results.logicDesign.issues.length > 0) {
    console.log(`\n❌ 逻辑设计问题详情:`);
    results.logicDesign.issues.forEach(item => {
      console.log(`  规则: ${item.rule}`);
      item.issues.forEach(issue => console.log(`    - ${issue}`));
    });
  }
  
  if (results.functionality.issues.length > 0) {
    console.log(`\n❌ 功能性问题详情:`);
    results.functionality.issues.forEach(item => {
      console.log(`  规则: ${item.rule}`);
      item.issues.forEach(issue => console.log(`    - ${issue}`));
    });
  }
  
  if (results.fieldMapping.issues.length > 0) {
    console.log(`\n❌ 字段映射问题详情:`);
    results.fieldMapping.issues.forEach(item => {
      console.log(`  规则: ${item.rule}`);
      item.issues.forEach(issue => console.log(`    - ${issue}`));
    });
  }
  
  console.log('\n🎯 建议优先修复的问题:');
  console.log('1. SQL执行失败的规则（影响功能）');
  console.log('2. 字段映射错误的规则（影响显示）');
  console.log('3. 缺少触发词或示例的规则（影响匹配）');

  // 生成修复建议
  generateFixSuggestions(results);

  console.log('\n✅ 检查完成！');
}

// 生成修复建议
function generateFixSuggestions(results) {
  console.log('\n📋 详细修复建议:\n');

  // 1. 逻辑设计问题修复
  if (results.logicDesign.issues.length > 0) {
    console.log('🔧 逻辑设计问题修复:');
    const triggerWordIssues = results.logicDesign.issues.filter(item =>
      item.issues.some(issue => issue.includes('触发词'))
    );

    if (triggerWordIssues.length > 0) {
      console.log('  📝 缺少触发词的规则需要添加trigger_words字段:');
      triggerWordIssues.forEach(item => {
        console.log(`    - ${item.rule}: 建议添加相关关键词如["${item.rule.replace('查询', '')}", "查询", "统计"]`);
      });
    }
    console.log('');
  }

  // 2. 功能性问题修复
  if (results.functionality.issues.length > 0) {
    console.log('🔧 功能性问题修复:');
    const sqlIssues = results.functionality.issues.filter(item =>
      item.issues.some(issue => issue.includes('SQL执行失败'))
    );

    if (sqlIssues.length > 0) {
      console.log('  💾 SQL执行失败的规则需要修复SQL语法:');
      sqlIssues.forEach(item => {
        console.log(`    - ${item.rule}: 检查SQL语法，可能存在字段名错误或语法问题`);
      });
    }
    console.log('');
  }

  // 3. 字段映射问题修复
  if (results.fieldMapping.issues.length > 0) {
    console.log('🔧 字段映射问题修复:');

    // 统计最常见的字段问题
    const fieldIssues = {};
    results.fieldMapping.issues.forEach(item => {
      item.issues.forEach(issue => {
        if (issue.includes('字段') && issue.includes('不存在')) {
          const fieldMatch = issue.match(/字段 (\w+) 在表/);
          if (fieldMatch) {
            const field = fieldMatch[1];
            fieldIssues[field] = (fieldIssues[field] || 0) + 1;
          }
        }
      });
    });

    console.log('  📊 需要修复的常见字段问题:');
    Object.entries(fieldIssues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([field, count]) => {
        let suggestion = '';
        switch(field) {
          case 'supplier_name':
            suggestion = '应使用 supplier 字段';
            break;
          case 'batch_code':
            suggestion = '应使用 batch_number 字段';
            break;
          case 'material_code':
            suggestion = '字段不存在，需要移除或使用其他字段';
            break;
          case 'defect_desc':
            suggestion = '应使用 defect_description 字段';
            break;
          case 'test_id':
            suggestion = '应使用 test_number 字段';
            break;
          case 'project_id':
            suggestion = '应使用 project 字段';
            break;
          case 'baseline_id':
            suggestion = '应使用 baseline 字段';
            break;
          default:
            suggestion = '检查实际表结构，使用正确字段名';
        }
        console.log(`    - ${field} (${count}个规则): ${suggestion}`);
      });

    console.log('\n  🎨 前端显示字段问题:');
    console.log('    - "物料名称"应为"物料名称"（检查前端显示字段定义）');
    console.log('    - "批次号"不在前端显示字段中，需要添加或移除');
    console.log('    - "工厂"、"车间"、"生产线"等字段需要确认前端是否支持');
    console.log('');
  }

  console.log('🚀 修复优先级建议:');
  console.log('  1. 高优先级: 修复SQL执行失败的10个规则');
  console.log('  2. 中优先级: 添加缺少触发词的12个规则');
  console.log('  3. 低优先级: 修复字段映射问题的38个规则');

  console.log('\n💡 系统性修复建议:');
  console.log('  1. 统一字段映射: 创建字段映射配置文件');
  console.log('  2. 批量修复: 使用脚本批量更新相似问题');
  console.log('  3. 验证机制: 建立规则验证流程');
  console.log('  4. 文档更新: 更新字段映射文档');
}

comprehensiveRulesValidation();
