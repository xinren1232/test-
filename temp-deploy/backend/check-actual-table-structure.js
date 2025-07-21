import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkActualTableStructure() {
  try {
    console.log('🔍 检查实际数据库表结构和数据...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 获取所有表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 数据库中的表:');
    tables.forEach(table => console.log('  -', Object.values(table)[0]));
    console.log('');
    
    // 检查每个表的结构和数据
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`🔍 表: ${tableName}`);
      
      // 获取表结构
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      console.log('  字段结构:');
      columns.forEach(col => {
        console.log(`    ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      });
      
      // 获取数据样本
      try {
        const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
        console.log(`  数据样本 (${rows.length} 条):`);
        if (rows.length > 0) {
          // 显示第一行数据的字段和值
          const firstRow = rows[0];
          Object.entries(firstRow).forEach(([key, value]) => {
            const displayValue = value === null ? 'NULL' : 
                               typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : 
                               value;
            console.log(`    ${key}: ${displayValue}`);
          });
        } else {
          console.log('    (无数据)');
        }
      } catch (error) {
        console.log(`    查询数据失败: ${error.message}`);
      }
      
      console.log('');
    }
    
    // 检查规则表的具体内容
    console.log('🧠 检查NLP规则表内容:');
    try {
      const [rules] = await connection.execute('SELECT id, intent_name, description, action_type, action_target FROM nlp_intent_rules LIMIT 5');
      rules.forEach(rule => {
        console.log(`  规则 ${rule.id}: ${rule.intent_name}`);
        console.log(`    描述: ${rule.description}`);
        console.log(`    类型: ${rule.action_type}`);
        console.log(`    SQL: ${rule.action_target ? rule.action_target.substring(0, 100) + '...' : '无'}`);
        console.log('');
      });
    } catch (error) {
      console.log(`  查询规则失败: ${error.message}`);
    }
    
    await connection.end();
    console.log('✅ 表结构检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkActualTableStructure().catch(console.error);
