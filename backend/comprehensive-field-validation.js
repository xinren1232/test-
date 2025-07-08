import initializeDatabase from './src/models/index.js';

async function comprehensiveFieldValidation() {
  console.log('🔍 全面验证数据字段设计与真实数据的一致性...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 1. 获取实际数据库表结构
    console.log('=== 第一步：获取实际数据库表结构 ===');
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    const actualFields = {};
    
    for (const table of tables) {
      console.log(`\n📋 ${table}表结构:`);
      const columns = await sequelize.query(`DESCRIBE ${table}`, {
        type: sequelize.QueryTypes.SELECT
      });
      
      actualFields[table] = {};
      columns.forEach(col => {
        actualFields[table][col.Field] = {
          type: col.Type,
          nullable: col.Null === 'YES',
          key: col.Key,
          default: col.Default
        };
        console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? '可空' : '非空'})`);
      });
    }
    
    // 2. 检查实际数据内容
    console.log('\n=== 第二步：检查实际数据内容 ===');
    const dataSamples = {};
    
    for (const table of tables) {
      console.log(`\n📊 ${table}表数据样本:`);
      
      // 获取记录数
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`, {
        type: sequelize.QueryTypes.SELECT
      });
      console.log(`  记录总数: ${countResult.count}`);
      
      if (countResult.count > 0) {
        // 获取样本数据
        const samples = await sequelize.query(`SELECT * FROM ${table} LIMIT 2`, {
          type: sequelize.QueryTypes.SELECT
        });
        
        dataSamples[table] = samples;
        
        if (samples.length > 0) {
          console.log(`  样本数据字段: ${Object.keys(samples[0]).join(', ')}`);
          
          // 检查关键字段的实际值
          const sample = samples[0];
          Object.keys(sample).forEach(field => {
            if (sample[field] !== null && sample[field] !== undefined) {
              const value = String(sample[field]).substring(0, 50); // 限制显示长度
              console.log(`    ${field}: ${value}`);
            }
          });
        }
      }
    }
    
    // 3. 获取所有规则并检查字段使用
    console.log('\n=== 第三步：检查规则中的字段使用 ===');
    const rules = await sequelize.query('SELECT intent_name, action_target FROM nlp_intent_rules ORDER BY intent_name', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`共检查 ${rules.length} 个规则\n`);
    
    const fieldIssues = [];
    const validRules = [];
    
    for (const rule of rules) {
      console.log(`🔍 检查规则: ${rule.intent_name}`);
      const sql = rule.action_target.toLowerCase();
      
      let hasIssues = false;
      const ruleIssues = [];
      
      // 检查每个表的字段使用
      for (const table of tables) {
        if (sql.includes(table)) {
          console.log(`  使用表: ${table}`);
          
          // 检查可能的字段引用
          const tableFields = Object.keys(actualFields[table]);
          
          for (const field of tableFields) {
            // 检查字段是否在SQL中被引用
            const fieldPatterns = [
              new RegExp(`\\b${field}\\b`, 'g'),
              new RegExp(`${table}\\.${field}`, 'g')
            ];
            
            let fieldUsed = false;
            for (const pattern of fieldPatterns) {
              if (pattern.test(sql)) {
                fieldUsed = true;
                break;
              }
            }
            
            if (fieldUsed) {
              console.log(`    ✅ 使用字段: ${field}`);
            }
          }
          
          // 检查是否使用了不存在的字段（通过SQL执行测试）
          try {
            let testSQL = rule.action_target;
            if (testSQL.includes('?')) {
              testSQL = testSQL.replace(/\?/g, "'test'");
            }
            if (!testSQL.toLowerCase().includes('limit')) {
              testSQL += ' LIMIT 1';
            }
            
            await sequelize.query(testSQL, {
              type: sequelize.QueryTypes.SELECT
            });
            
            console.log(`    ✅ SQL可执行`);
            
          } catch (error) {
            hasIssues = true;
            const issue = `SQL执行错误: ${error.message}`;
            ruleIssues.push(issue);
            console.log(`    ❌ ${issue}`);
          }
        }
      }
      
      if (hasIssues) {
        fieldIssues.push({
          ruleName: rule.intent_name,
          issues: ruleIssues,
          sql: rule.action_target
        });
      } else {
        validRules.push(rule.intent_name);
      }
      
      console.log('');
    }
    
    // 4. 特别检查问题字段
    console.log('=== 第四步：特别检查常见问题字段 ===');
    const problematicFields = [
      'risk_level', 'inspector', 'receiver', 'workshop', 'line', 
      'defect_rate', 'exception_count', 'tester', 'reviewer'
    ];
    
    for (const field of problematicFields) {
      console.log(`\n🔍 检查字段: ${field}`);
      
      let fieldExists = false;
      for (const table of tables) {
        if (actualFields[table][field]) {
          fieldExists = true;
          console.log(`  ✅ 存在于 ${table}表: ${actualFields[table][field].type}`);
          
          // 检查实际数据值
          if (dataSamples[table] && dataSamples[table].length > 0) {
            const sampleValue = dataSamples[table][0][field];
            if (sampleValue !== null && sampleValue !== undefined) {
              console.log(`    样本值: ${sampleValue}`);
            } else {
              console.log(`    样本值: NULL`);
            }
          }
        }
      }
      
      if (!fieldExists) {
        console.log(`  ❌ 字段不存在于任何表中`);
      }
    }
    
    // 5. 汇总报告
    console.log('\n=== 验证结果汇总 ===');
    console.log(`✅ 有效规则: ${validRules.length} 个`);
    console.log(`❌ 有问题规则: ${fieldIssues.length} 个`);
    
    if (fieldIssues.length > 0) {
      console.log('\n❌ 需要修复的规则:');
      fieldIssues.forEach(issue => {
        console.log(`\n规则: ${issue.ruleName}`);
        issue.issues.forEach(problem => {
          console.log(`  - ${problem}`);
        });
      });
      
      console.log('\n🔧 建议修复步骤:');
      console.log('1. 检查规则SQL中使用的字段名是否正确');
      console.log('2. 确认字段名与数据库表结构一致');
      console.log('3. 移除或替换不存在的字段');
      console.log('4. 测试修复后的规则是否能正常执行');
    } else {
      console.log('\n🎉 所有规则都使用了正确的字段！');
    }
    
    // 6. 显示实际可用字段
    console.log('\n=== 实际可用字段清单 ===');
    for (const table of tables) {
      console.log(`\n${table}表可用字段:`);
      Object.keys(actualFields[table]).forEach(field => {
        const fieldInfo = actualFields[table][field];
        console.log(`  - ${field}: ${fieldInfo.type} (${fieldInfo.nullable ? '可空' : '非空'})`);
      });
    }
    
    return {
      totalRules: rules.length,
      validRules: validRules.length,
      invalidRules: fieldIssues.length,
      fieldIssues,
      actualFields
    };
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    return null;
  }
}

// 执行验证
comprehensiveFieldValidation().then(result => {
  if (result) {
    console.log('\n🎯 第一步验证完成！');
    if (result.invalidRules === 0) {
      console.log('✅ 所有规则都使用了真实数据和实际字段，可以进行第二步功能效果检查');
    } else {
      console.log('⚠️  需要先修复字段问题，然后再进行第二步检查');
    }
  }
});
