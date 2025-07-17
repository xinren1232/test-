import mysql from 'mysql2/promise';

async function debugFieldTypes() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });
  
  try {
    console.log('=== 调试字段类型 ===\n');
    
    // 获取一条规则查看数据类型
    const [rules] = await connection.execute(`
      SELECT id, intent_name, result_fields
      FROM nlp_intent_rules 
      WHERE action_type = 'SQL_QUERY'
      LIMIT 3
    `);
    
    rules.forEach((rule, index) => {
      console.log(`规则 ${index + 1}: ${rule.intent_name}`);
      console.log(`  result_fields 类型: ${typeof rule.result_fields}`);
      console.log(`  result_fields 值: ${rule.result_fields}`);
      console.log(`  result_fields 构造函数: ${rule.result_fields?.constructor?.name}`);
      
      if (rule.result_fields) {
        console.log(`  是否为Buffer: ${Buffer.isBuffer(rule.result_fields)}`);
        console.log(`  toString(): ${rule.result_fields.toString()}`);
      }
      console.log('');
    });
    
    // 检查表结构中result_fields的定义
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM nlp_intent_rules WHERE Field = 'result_fields'
    `);
    
    if (columns.length > 0) {
      console.log('result_fields字段定义:');
      console.log(`  类型: ${columns[0].Type}`);
      console.log(`  是否可空: ${columns[0].Null}`);
      console.log(`  默认值: ${columns[0].Default}`);
    }
    
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    await connection.end();
  }
}

debugFieldTypes().catch(console.error);
