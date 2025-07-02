/**
 * 检查数据库连接问题
 */
import mysql from 'mysql2/promise';

async function checkDBConnection() {
  console.log('🔍 检查数据库连接问题...\n');
  
  try {
    // 1. 测试数据库连接
    console.log('📊 步骤1: 测试数据库连接...');
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 2. 检查现有表
    console.log('\n📊 步骤2: 检查现有表...');
    const [tables] = await conn.query('SHOW TABLES');
    console.log('现有表:', tables.map(t => Object.values(t)[0]));
    
    // 3. 检查nlp_intent_rules表
    console.log('\n📊 步骤3: 检查nlp_intent_rules表...');
    try {
      const [columns] = await conn.query('DESCRIBE nlp_intent_rules');
      console.log('✅ nlp_intent_rules表存在');
      console.log('表结构:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
      });
      
      // 检查表中的数据
      const [rows] = await conn.query('SELECT COUNT(*) as count FROM nlp_intent_rules');
      console.log(`📊 表中记录数: ${rows[0].count}`);
      
    } catch (e) {
      console.log('❌ nlp_intent_rules表不存在:', e.message);
      
      // 尝试创建表
      console.log('\n🔧 尝试创建nlp_intent_rules表...');
      try {
        await conn.query(`
          CREATE TABLE nlp_intent_rules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            intent_name VARCHAR(100) NOT NULL COMMENT '意图名称/关键字',
            description VARCHAR(255) COMMENT '规则描述',
            action_type VARCHAR(50) NOT NULL COMMENT '动作类型',
            action_target TEXT NOT NULL COMMENT '动作目标',
            parameters JSON COMMENT '参数定义',
            example_query VARCHAR(255) COMMENT '示例问题',
            status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='NLP意图规则表'
        `);
        console.log('✅ nlp_intent_rules表创建成功');
      } catch (createError) {
        console.log('❌ 创建表失败:', createError.message);
      }
    }
    
    // 4. 检查其他必要的表
    console.log('\n📊 步骤4: 检查其他必要的表...');
    const requiredTables = ['inventory', 'lab_tests', 'online_tracking'];
    
    for (const tableName of requiredTables) {
      try {
        const [result] = await conn.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName}表存在，记录数: ${result[0].count}`);
      } catch (e) {
        console.log(`❌ ${tableName}表不存在或有问题`);
      }
    }
    
    await conn.end();
    console.log('\n🎉 数据库检查完成');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('错误详情:', error);
  }
}

checkDBConnection().catch(console.error);
