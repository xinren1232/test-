/**
 * 检查当前实际的数据库结构和内容
 */
import mysql from 'mysql2/promise';

async function checkCurrentData() {
  console.log('🔍 检查当前数据库的实际结构和内容...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 连接到数据库成功！');
    
    // 1. 检查所有表
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 数据库表列表:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // 2. 检查每个表的结构和数据
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      
      // 获取表结构
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      console.log(`\n🔍 表 ${tableName} 的结构:`);
      columns.forEach(col => {
        const nullable = col.Null === 'YES' ? '可空' : '非空';
        const key = col.Key ? `[${col.Key}]` : '';
        console.log(`  - ${col.Field}: ${col.Type} (${nullable}) ${key}`);
      });
      
      // 获取数据样本
      const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 3`);
      console.log(`\n📋 表 ${tableName} 的数据样本 (前3条):`);
      rows.forEach((row, index) => {
        console.log(`  记录 ${index + 1}: ${JSON.stringify(row, null, 2)}`);
      });
      
      // 获取数据总数
      const [count] = await connection.query(`SELECT COUNT(*) as total FROM ${tableName}`);
      console.log(`  📊 总记录数: ${count[0].total}`);
    }
    
    // 3. 检查NLP规则
    console.log('\n🤖 当前NLP规则:');
    const [rules] = await connection.query('SELECT intent_name, description, status FROM nlp_intent_rules WHERE status = "active"');
    rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    await connection.end();
    console.log('\n🎉 数据库检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

checkCurrentData();
