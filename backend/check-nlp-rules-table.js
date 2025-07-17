import mysql from 'mysql2/promise';

async function checkNlpRulesTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('=== 检查nlp_intent_rules表结构 ===\n');
    
    // 检查nlp_intent_rules表结构
    const [columns] = await connection.execute(`
      DESCRIBE nlp_intent_rules
    `);
    
    console.log('nlp_intent_rules表字段:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? col.Key : ''}`);
    });
    
    // 检查表中的数据数量
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules');
    console.log(`\n表中共有 ${countResult[0].count} 条记录\n`);
    
    // 获取前5条记录查看实际数据结构
    const [sampleData] = await connection.execute('SELECT * FROM nlp_intent_rules LIMIT 5');
    console.log('=== 前5条记录示例 ===');
    sampleData.forEach((record, index) => {
      console.log(`\n记录 ${index + 1}:`);
      Object.keys(record).forEach(key => {
        const value = record[key];
        if (typeof value === 'string' && value.length > 100) {
          console.log(`  ${key}: ${value.substring(0, 100)}...`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });
    });
    
    // 检查字段映射问题
    console.log('\n=== 字段映射问题分析 ===');
    const [rules] = await connection.execute('SELECT id, intent, sql_template, result_fields FROM nlp_intent_rules');
    
    let noFieldsCount = 0;
    let emptyFieldsCount = 0;
    let validFieldsCount = 0;
    
    rules.forEach(rule => {
      if (!rule.result_fields) {
        noFieldsCount++;
      } else if (rule.result_fields.trim() === '' || rule.result_fields === '[]') {
        emptyFieldsCount++;
      } else {
        validFieldsCount++;
      }
    });
    
    console.log(`未定义字段的规则: ${noFieldsCount} 条`);
    console.log(`空字段的规则: ${emptyFieldsCount} 条`);
    console.log(`有效字段的规则: ${validFieldsCount} 条`);
    console.log(`需要修复的规则: ${noFieldsCount + emptyFieldsCount} 条`);
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    await connection.end();
  }
}

checkNlpRulesTable().catch(console.error);
