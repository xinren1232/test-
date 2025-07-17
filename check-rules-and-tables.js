import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRulesAndTables() {
  try {
    console.log('🔍 开始检查规则和数据表...');
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查数据库中的所有表
    console.log('\n1. 数据库中的所有表:');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('表列表:');
    tableNames.forEach(name => console.log(`- ${name}`));
    
    // 2. 检查各表的记录数
    console.log('\n2. 各表的记录数:');
    for (const tableName of tableNames) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        console.log(`${tableName}: ${count} 条记录`);
        
        // 标记关键表
        if (count === 132) {
          console.log(`  ⭐ 库存表 (132条记录)`);
        } else if (count === 396) {
          console.log(`  ⭐ 测试表 (396条记录)`);
        } else if (count === 1056) {
          console.log(`  ⭐ 上线表 (1056条记录)`);
        }
      } catch (error) {
        console.log(`${tableName}: 查询失败 - ${error.message}`);
      }
    }
    
    // 3. 检查规则表结构
    console.log('\n3. 规则表结构:');
    try {
      const [columns] = await connection.execute('DESCRIBE nlp_intent_rules');
      console.log('规则表字段:');
      columns.forEach(col => {
        console.log(`- ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log(`检查规则表结构失败: ${error.message}`);
    }
    
    // 4. 检查规则数量和分类
    console.log('\n4. 规则数量和分类:');
    try {
      const [rules] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
      console.log(`总规则数: ${rules[0].count}`);
      
      // 检查规则分类
      const [categories] = await connection.execute(`
        SELECT 
          CASE 
            WHEN intent_name LIKE '%库存%' THEN '库存相关'
            WHEN intent_name LIKE '%测试%' THEN '测试相关'
            WHEN intent_name LIKE '%上线%' THEN '上线相关'
            WHEN intent_name LIKE '%批次%' THEN '批次相关'
            WHEN intent_name LIKE '%供应商%' THEN '供应商相关'
            WHEN intent_name LIKE '%物料%' THEN '物料相关'
            ELSE '其他'
          END as category,
          COUNT(*) as count
        FROM nlp_intent_rules
        GROUP BY category
        ORDER BY count DESC
      `);
      
      console.log('规则分类统计:');
      categories.forEach(cat => {
        console.log(`- ${cat.category}: ${cat.count}条`);
      });
    } catch (error) {
      console.log(`检查规则分类失败: ${error.message}`);
    }
    
    // 5. 检查规则中的表引用
    console.log('\n5. 规则中的表引用:');
    try {
      const tableReferences = {};
      
      // 获取所有规则
      const [rules] = await connection.execute('SELECT id, intent_name, action_target FROM nlp_intent_rules');
      
      // 分析每个规则中引用的表
      for (const rule of rules) {
        const sql = rule.action_target;
        
        // 提取FROM后面的表名
        const fromMatch = sql.match(/FROM\s+([a-zA-Z_]+)/i);
        if (fromMatch && fromMatch[1]) {
          const tableName = fromMatch[1];
          
          if (!tableReferences[tableName]) {
            tableReferences[tableName] = [];
          }
          
          tableReferences[tableName].push({
            id: rule.id,
            name: rule.intent_name
          });
        }
      }
      
      console.log('规则中引用的表:');
      for (const [table, rules] of Object.entries(tableReferences)) {
        console.log(`- ${table}: ${rules.length}条规则引用`);
        
        // 检查表是否存在
        const tableExists = tableNames.includes(table);
        if (!tableExists) {
          console.log(`  ⚠️ 警告: 表 ${table} 不存在于数据库中!`);
          console.log(`  引用此表的规则:`);
          rules.slice(0, 5).forEach(rule => {
            console.log(`  - ${rule.name} (ID: ${rule.id})`);
          });
          if (rules.length > 5) {
            console.log(`  ...以及其他 ${rules.length - 5} 条规则`);
          }
        }
      }
    } catch (error) {
      console.log(`检查规则表引用失败: ${error.message}`);
    }
    
    // 6. 检查一些示例规则的SQL
    console.log('\n6. 示例规则SQL检查:');
    try {
      // 获取几个示例规则
      const [sampleRules] = await connection.execute(`
        SELECT id, intent_name, action_target 
        FROM nlp_intent_rules 
        WHERE intent_name LIKE '%测试%' OR intent_name LIKE '%不良%'
        LIMIT 3
      `);
      
      for (const rule of sampleRules) {
        console.log(`\n规则: ${rule.intent_name} (ID: ${rule.id})`);
        console.log(`SQL: ${rule.action_target}`);
        
        // 尝试执行SQL
        try {
          const [results] = await connection.execute(rule.action_target);
          console.log(`✅ SQL执行成功，返回 ${results.length} 条记录`);
          
          if (results.length > 0) {
            console.log('字段列表:', Object.keys(results[0]).join(', '));
          }
        } catch (error) {
          console.log(`❌ SQL执行失败: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`检查示例规则失败: ${error.message}`);
    }
    
    await connection.end();
    console.log('\n✅ 检查完成!');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

checkRulesAndTables();
