// 修复数据库表结构问题
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixDatabaseSchema() {
  let connection;
  
  try {
    console.log('🔧 修复数据库表结构...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查nlp_intent_rules表结构
    console.log('📋 检查nlp_intent_rules表结构...');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM nlp_intent_rules
    `);
    
    console.log('当前表字段:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // 2. 检查是否缺少sort_order字段
    const hasSortOrder = columns.some(col => col.Field === 'sort_order');
    
    if (!hasSortOrder) {
      console.log('❌ 缺少sort_order字段，正在添加...');
      await connection.execute(`
        ALTER TABLE nlp_intent_rules 
        ADD COLUMN sort_order INT DEFAULT 0 AFTER priority
      `);
      console.log('✅ sort_order字段添加成功');
    } else {
      console.log('✅ sort_order字段已存在');
    }
    
    // 3. 检查是否缺少category字段
    const hasCategory = columns.some(col => col.Field === 'category');
    
    if (!hasCategory) {
      console.log('❌ 缺少category字段，正在添加...');
      await connection.execute(`
        ALTER TABLE nlp_intent_rules 
        ADD COLUMN category VARCHAR(100) DEFAULT '' AFTER description
      `);
      console.log('✅ category字段添加成功');
    } else {
      console.log('✅ category字段已存在');
    }
    
    // 4. 更新现有记录的sort_order值
    console.log('🔄 更新现有记录的sort_order值...');
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET sort_order = id 
      WHERE sort_order = 0 OR sort_order IS NULL
    `);
    
    // 5. 验证表结构
    console.log('\n📋 验证修复后的表结构...');
    const [newColumns] = await connection.execute(`
      SHOW COLUMNS FROM nlp_intent_rules
    `);
    
    console.log('修复后的表字段:');
    newColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // 6. 检查数据
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM nlp_intent_rules
    `);
    
    console.log(`\n📊 表中共有 ${count[0].total} 条规则记录`);
    
    console.log('\n🎉 数据库表结构修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDatabaseSchema().catch(console.error);
