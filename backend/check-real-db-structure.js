/**
 * 检查真实数据库结构，基于用户提供的实际字段
 */
import mysql from 'mysql2/promise';

async function checkRealDBStructure() {
  console.log('🔍 检查真实数据库结构...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 连接到数据库成功！');
    
    // 检查所有表
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 数据库表列表:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // 检查每个关键表的结构
    const keyTables = ['inventory', 'lab_tests', 'online_tracking', 'nlp_intent_rules'];
    
    for (const tableName of keyTables) {
      try {
        console.log(`\n🔍 表 ${tableName} 的结构:`);
        const [columns] = await connection.query(`DESCRIBE ${tableName}`);
        columns.forEach(col => {
          const nullable = col.Null === 'YES' ? '可空' : '非空';
          const key = col.Key ? `[${col.Key}]` : '';
          console.log(`  - ${col.Field}: ${col.Type} (${nullable}) ${key}`);
        });
        
        // 检查数据样本
        const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 2`);
        if (rows.length > 0) {
          console.log(`\n📋 表 ${tableName} 的数据样本:`);
          rows.forEach((row, index) => {
            console.log(`  记录 ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        } else {
          console.log(`\n⚠️ 表 ${tableName} 没有数据`);
        }
      } catch (error) {
        console.log(`❌ 表 ${tableName} 不存在或查询失败:`, error.message);
      }
    }
    
    // 特别检查NLP规则表
    try {
      console.log('\n🤖 检查NLP规则:');
      const [rules] = await connection.query('SELECT * FROM nlp_intent_rules WHERE status = "active"');
      console.log(`找到 ${rules.length} 条活跃规则:`);
      rules.forEach((rule, index) => {
        console.log(`  规则 ${index + 1}: ${rule.intent_name} -> ${rule.action_type}`);
      });
    } catch (error) {
      console.log('❌ NLP规则表查询失败:', error.message);
    }
    
    await connection.end();
    console.log('\n🎉 数据库结构检查完成！');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

checkRealDBStructure();
