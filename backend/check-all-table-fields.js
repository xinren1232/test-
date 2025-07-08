import initializeDatabase from './src/models/index.js';

async function checkAllTableFields() {
  console.log('🔍 检查所有数据表的实际字段结构...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 获取所有表名
    const tables = ['inventory', 'lab_tests', 'online_tracking', 'material_batches'];
    const actualFields = {};
    
    // 检查每个表的字段
    for (const table of tables) {
      console.log(`=== ${table}表字段结构 ===`);
      try {
        const columns = await sequelize.query(`DESCRIBE ${table}`, {
          type: sequelize.QueryTypes.SELECT
        });
        
        actualFields[table] = columns.map(col => col.Field);
        
        columns.forEach(col => {
          console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? '可空' : '非空'})`);
        });
        console.log('');
      } catch (error) {
        console.log(`❌ 无法获取${table}表结构: ${error.message}\n`);
      }
    }
    
    // 获取所有规则中使用的字段
    console.log('=== 检查规则中使用的字段 ===');
    const rules = await sequelize.query('SELECT intent_name, action_target FROM nlp_intent_rules', {
      type: sequelize.QueryTypes.SELECT
    });
    
    const fieldIssues = [];
    
    for (const rule of rules) {
      console.log(`\n📋 检查规则: ${rule.intent_name}`);
      const sql = rule.action_target;
      
      // 检查每个表的字段使用
      for (const table of tables) {
        if (sql.includes(table)) {
          console.log(`  使用表: ${table}`);
          
          // 提取SQL中可能的字段名（简单匹配）
          const possibleFields = extractFieldsFromSQL(sql, table);
          
          for (const field of possibleFields) {
            if (!actualFields[table] || !actualFields[table].includes(field)) {
              const issue = {
                rule: rule.intent_name,
                table: table,
                field: field,
                sql: sql
              };
              fieldIssues.push(issue);
              console.log(`    ❌ 字段不存在: ${field}`);
            } else {
              console.log(`    ✅ 字段存在: ${field}`);
            }
          }
        }
      }
    }
    
    // 汇总问题
    console.log('\n=== 字段问题汇总 ===');
    if (fieldIssues.length > 0) {
      console.log(`发现 ${fieldIssues.length} 个字段问题:`);
      
      const groupedIssues = {};
      fieldIssues.forEach(issue => {
        const key = `${issue.table}.${issue.field}`;
        if (!groupedIssues[key]) {
          groupedIssues[key] = [];
        }
        groupedIssues[key].push(issue.rule);
      });
      
      Object.keys(groupedIssues).forEach(fieldKey => {
        const [table, field] = fieldKey.split('.');
        console.log(`\n❌ ${table}.${field} (不存在)`);
        console.log(`  影响规则: ${groupedIssues[fieldKey].join(', ')}`);
        console.log(`  建议替换字段: ${suggestAlternativeField(field, actualFields[table])}`);
      });
    } else {
      console.log('✅ 未发现字段问题');
    }
    
    // 显示实际可用字段
    console.log('\n=== 实际可用字段汇总 ===');
    Object.keys(actualFields).forEach(table => {
      console.log(`${table}表字段: ${actualFields[table].join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

function extractFieldsFromSQL(sql, table) {
  const fields = [];
  
  // 简单的字段提取逻辑
  const patterns = [
    new RegExp(`${table}\\.(\\w+)`, 'gi'),  // table.field
    new RegExp(`(\\w+)\\s+as\\s+`, 'gi'),   // field as alias
    new RegExp(`SELECT\\s+([^FROM]+)`, 'gi') // SELECT fields
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(sql)) !== null) {
      if (match[1] && match[1] !== '*') {
        const field = match[1].trim().replace(/['"]/g, '');
        if (field && !field.includes(' ') && !field.includes('(')) {
          fields.push(field);
        }
      }
    }
  });
  
  // 手动检查一些常见的可能有问题的字段
  const commonProblematicFields = [
    'risk_level', 'inspector', 'receiver', 'tester', 'reviewer',
    'defect_rate', 'exception_count', 'workshop', 'line'
  ];
  
  commonProblematicFields.forEach(field => {
    if (sql.includes(field)) {
      fields.push(field);
    }
  });
  
  return [...new Set(fields)]; // 去重
}

function suggestAlternativeField(problematicField, availableFields) {
  const suggestions = {
    'risk_level': ['status'],
    'inspector': ['tester', 'reviewer'],
    'receiver': ['tester', 'reviewer'],
    'defect_rate': ['test_result'],
    'exception_count': ['notes'],
    'workshop': ['factory'],
    'line': ['factory']
  };
  
  if (suggestions[problematicField]) {
    const available = suggestions[problematicField].filter(f => availableFields.includes(f));
    return available.length > 0 ? available.join(' 或 ') : '无建议';
  }
  
  // 模糊匹配
  const similar = availableFields.filter(f => 
    f.includes(problematicField) || problematicField.includes(f)
  );
  
  return similar.length > 0 ? similar.join(' 或 ') : '无建议';
}

checkAllTableFields();
