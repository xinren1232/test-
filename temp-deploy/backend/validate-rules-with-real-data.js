import initializeDatabase from './src/models/index.js';

async function validateRulesWithRealData() {
  console.log('🔍 第一步：验证所有规则使用的是真实数据和实际字段...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 1. 获取所有表的实际字段
    console.log('1. 获取数据库实际表结构...');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    const actualFields = {};
    
    for (const table of tables) {
      const columns = await sequelize.query(`DESCRIBE ${table}`, {
        type: sequelize.QueryTypes.SELECT
      });
      actualFields[table] = columns.map(col => col.Field);
      console.log(`${table}表字段: ${actualFields[table].join(', ')}`);
    }
    
    // 2. 获取所有规则
    console.log('\n2. 检查所有规则的字段使用情况...');
    const rules = await sequelize.query('SELECT intent_name, action_target FROM nlp_intent_rules ORDER BY intent_name', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`共找到 ${rules.length} 个规则\n`);
    
    const validationResults = [];
    
    // 3. 逐个验证规则
    for (const rule of rules) {
      console.log(`📋 验证规则: ${rule.intent_name}`);
      const sql = rule.action_target;
      
      const result = {
        ruleName: rule.intent_name,
        sql: sql,
        isValid: true,
        issues: [],
        usedTables: [],
        usedFields: []
      };
      
      // 检查使用的表
      for (const table of tables) {
        if (sql.toLowerCase().includes(table.toLowerCase())) {
          result.usedTables.push(table);
          console.log(`  使用表: ${table}`);
          
          // 提取该表使用的字段
          const tableFields = extractFieldsFromSQL(sql, table, actualFields[table]);
          result.usedFields.push(...tableFields.map(f => `${table}.${f}`));
          
          // 检查字段是否存在
          for (const field of tableFields) {
            if (!actualFields[table].includes(field)) {
              result.isValid = false;
              result.issues.push(`字段 ${table}.${field} 不存在`);
              console.log(`    ❌ 字段不存在: ${field}`);
            } else {
              console.log(`    ✅ 字段存在: ${field}`);
            }
          }
        }
      }
      
      // 4. 尝试执行SQL验证语法
      try {
        let testSQL = sql;
        // 替换参数占位符
        if (testSQL.includes('?')) {
          testSQL = testSQL.replace(/\?/g, "'test'");
        }
        
        // 执行查询（限制结果数量）
        if (!testSQL.toLowerCase().includes('limit')) {
          testSQL += ' LIMIT 1';
        }
        
        const testResult = await sequelize.query(testSQL, {
          type: sequelize.QueryTypes.SELECT
        });
        
        console.log(`  ✅ SQL语法正确，可执行`);
        result.canExecute = true;
        result.sampleDataCount = testResult.length;
        
      } catch (error) {
        result.isValid = false;
        result.canExecute = false;
        result.issues.push(`SQL执行错误: ${error.message}`);
        console.log(`  ❌ SQL执行错误: ${error.message}`);
      }
      
      validationResults.push(result);
      console.log('');
    }
    
    // 5. 汇总验证结果
    console.log('=== 验证结果汇总 ===');
    const validRules = validationResults.filter(r => r.isValid);
    const invalidRules = validationResults.filter(r => !r.isValid);
    
    console.log(`✅ 有效规则: ${validRules.length} 个`);
    console.log(`❌ 无效规则: ${invalidRules.length} 个`);
    
    if (invalidRules.length > 0) {
      console.log('\n❌ 需要修复的规则:');
      invalidRules.forEach(rule => {
        console.log(`\n规则: ${rule.ruleName}`);
        rule.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      });
    }
    
    // 6. 检查数据完整性
    console.log('\n=== 数据完整性检查 ===');
    const dataCounts = {};
    for (const table of tables) {
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`, {
        type: sequelize.QueryTypes.SELECT
      });
      dataCounts[table] = countResult.count;
      console.log(`${table}表记录数: ${countResult.count}`);
    }
    
    // 7. 生成修复建议
    if (invalidRules.length > 0) {
      console.log('\n=== 修复建议 ===');
      console.log('需要修复以下问题:');
      
      const fieldIssues = {};
      invalidRules.forEach(rule => {
        rule.issues.forEach(issue => {
          if (issue.includes('字段') && issue.includes('不存在')) {
            const fieldMatch = issue.match(/字段 (\w+\.\w+) 不存在/);
            if (fieldMatch) {
              const [table, field] = fieldMatch[1].split('.');
              const key = `${table}.${field}`;
              if (!fieldIssues[key]) {
                fieldIssues[key] = [];
              }
              fieldIssues[key].push(rule.ruleName);
            }
          }
        });
      });
      
      Object.keys(fieldIssues).forEach(fieldKey => {
        const [table, field] = fieldKey.split('.');
        console.log(`\n❌ ${fieldKey} (不存在)`);
        console.log(`  影响规则: ${fieldIssues[fieldKey].join(', ')}`);
        console.log(`  可用字段: ${actualFields[table].join(', ')}`);
      });
    }
    
    return {
      totalRules: rules.length,
      validRules: validRules.length,
      invalidRules: invalidRules.length,
      dataCounts,
      validationResults
    };
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    return null;
  }
}

function extractFieldsFromSQL(sql, table, availableFields) {
  const fields = new Set();
  
  // 移除注释和多余空格
  const cleanSQL = sql.replace(/--.*$/gm, '').replace(/\s+/g, ' ').toLowerCase();
  
  // 查找所有可能的字段引用
  availableFields.forEach(field => {
    const fieldLower = field.toLowerCase();
    
    // 检查各种字段引用模式
    const patterns = [
      new RegExp(`\\b${table}\\.${fieldLower}\\b`, 'g'),  // table.field
      new RegExp(`\\b${fieldLower}\\b(?=\\s*(as|,|\\)|from|where|group|order|having))`, 'g'),  // field (standalone)
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(cleanSQL)) {
        fields.add(field);
      }
    });
  });
  
  return Array.from(fields);
}

// 执行验证
validateRulesWithRealData().then(result => {
  if (result) {
    console.log('\n🎉 第一步验证完成！');
    console.log(`总结: ${result.validRules}/${result.totalRules} 个规则使用了正确的字段`);
    
    if (result.invalidRules === 0) {
      console.log('✅ 所有规则都使用了真实数据和实际字段，可以进行第二步功能效果检查');
    } else {
      console.log('⚠️  需要先修复字段问题，然后再进行第二步检查');
    }
  }
});
