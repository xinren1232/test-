/**
 * 检查MySQL数据库中的规则库设置
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkMySQLRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查数据库中的表
    console.log('\n=== 数据库表结构 ===');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('数据库表:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // 2. 检查nlp_intent_rules表结构
    console.log('\n=== nlp_intent_rules表结构 ===');
    try {
      const [ruleFields] = await connection.execute('DESCRIBE nlp_intent_rules');
      console.log('nlp_intent_rules表字段:');
      ruleFields.forEach(field => {
        console.log(`  ${field.Field} (${field.Type}) - ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('❌ nlp_intent_rules表不存在');
    }
    
    // 3. 检查规则数量和状态
    console.log('\n=== 规则库统计 ===');
    try {
      const [ruleCount] = await connection.execute('SELECT COUNT(*) as total FROM nlp_intent_rules');
      console.log(`总规则数: ${ruleCount[0].total}`);
      
      const [statusCount] = await connection.execute(`
        SELECT status, COUNT(*) as count 
        FROM nlp_intent_rules 
        GROUP BY status
      `);
      console.log('规则状态分布:');
      statusCount.forEach(row => {
        console.log(`  ${row.status}: ${row.count}条`);
      });
    } catch (error) {
      console.log('❌ 无法查询规则统计:', error.message);
    }
    
    // 4. 检查规则示例
    console.log('\n=== 规则示例 ===');
    try {
      const [sampleRules] = await connection.execute(`
        SELECT id, intent_name, trigger_words, action_type, status 
        FROM nlp_intent_rules 
        WHERE status = 'active' 
        LIMIT 10
      `);
      console.log('前10条活跃规则:');
      sampleRules.forEach(rule => {
        console.log(`  ID:${rule.id} - ${rule.intent_name} (${rule.action_type})`);
        console.log(`    触发词: ${rule.trigger_words}`);
      });
    } catch (error) {
      console.log('❌ 无法查询规则示例:', error.message);
    }
    
    // 5. 检查数据表
    console.log('\n=== 数据表检查 ===');
    const dataTables = ['inventory', 'online_tracking', 'lab_tests'];
    
    for (const tableName of dataTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
        console.log(`${tableName}表: ${count[0].total}条记录`);
        
        // 显示表结构
        const [fields] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`  字段: ${fields.map(f => f.Field).join(', ')}`);
      } catch (error) {
        console.log(`❌ ${tableName}表不存在或查询失败`);
      }
    }
    
    // 6. 检查规则与数据的匹配情况
    console.log('\n=== 规则与数据匹配检查 ===');
    try {
      const [rules] = await connection.execute(`
        SELECT id, intent_name, action_target 
        FROM nlp_intent_rules 
        WHERE status = 'active' AND action_type = 'sql_query'
        LIMIT 5
      `);
      
      for (const rule of rules) {
        console.log(`\n检查规则: ${rule.intent_name}`);
        try {
          // 尝试执行SQL（限制结果数量）
          let testSQL = rule.action_target;
          if (testSQL.includes('?')) {
            testSQL = testSQL.replace(/\?/g, "'test'");
          }
          if (!testSQL.toLowerCase().includes('limit')) {
            testSQL += ' LIMIT 1';
          }
          
          const [results] = await connection.execute(testSQL);
          console.log(`  ✅ SQL执行成功，返回${results.length}条记录`);
          if (results.length > 0) {
            console.log(`  字段: ${Object.keys(results[0]).join(', ')}`);
          }
        } catch (error) {
          console.log(`  ❌ SQL执行失败: ${error.message}`);
        }
      }
    } catch (error) {
      console.log('❌ 规则匹配检查失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行检查
checkMySQLRules().catch(console.error);
