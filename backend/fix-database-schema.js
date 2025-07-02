/**
 * 修复数据库表结构 - 添加自增ID字段
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

async function fixDatabaseSchema() {
  console.log('🔧 修复数据库表结构...\n');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查并修复 inventory 表
    console.log('\n📋 修复 inventory 表...');
    await connection.execute(`
      ALTER TABLE inventory 
      MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY
    `);
    console.log('✅ inventory 表 id 字段已设置为自增');
    
    // 2. 检查并修复 inspection 表
    console.log('\n📋 修复 inspection 表...');
    await connection.execute(`
      ALTER TABLE inspection 
      MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY
    `);
    console.log('✅ inspection 表 id 字段已设置为自增');
    
    // 3. 检查并修复 production 表
    console.log('\n📋 修复 production 表...');
    await connection.execute(`
      ALTER TABLE production 
      MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY
    `);
    console.log('✅ production 表 id 字段已设置为自增');
    
    // 4. 验证表结构
    console.log('\n🔍 验证表结构...');
    
    const [inventorySchema] = await connection.execute('DESCRIBE inventory');
    console.log('inventory 表结构:');
    inventorySchema.forEach(col => {
      if (col.Field === 'id') {
        console.log(`  ${col.Field}: ${col.Type} ${col.Key} ${col.Extra}`);
      }
    });
    
    const [inspectionSchema] = await connection.execute('DESCRIBE inspection');
    console.log('inspection 表结构:');
    inspectionSchema.forEach(col => {
      if (col.Field === 'id') {
        console.log(`  ${col.Field}: ${col.Type} ${col.Key} ${col.Extra}`);
      }
    });
    
    const [productionSchema] = await connection.execute('DESCRIBE production');
    console.log('production 表结构:');
    productionSchema.forEach(col => {
      if (col.Field === 'id') {
        console.log(`  ${col.Field}: ${col.Type} ${col.Key} ${col.Extra}`);
      }
    });
    
    console.log('\n🎉 数据库表结构修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    
    // 如果表不存在，创建表
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n📝 表不存在，创建新表...');
      await createTables(connection);
    }
  } finally {
    if (connection) await connection.end();
  }
}

async function createTables(connection) {
  try {
    // 创建 inventory 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_code VARCHAR(100) NOT NULL,
        material_name VARCHAR(200) NOT NULL,
        supplier VARCHAR(100) NOT NULL,
        batch_no VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        factory VARCHAR(100) NOT NULL,
        inbound_time DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ inventory 表创建成功');
    
    // 创建 inspection 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inspection (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_code VARCHAR(100) NOT NULL,
        batch_no VARCHAR(100) NOT NULL,
        test_result VARCHAR(50) NOT NULL,
        test_time DATETIME NOT NULL,
        inspector VARCHAR(100) NOT NULL,
        defect_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ inspection 表创建成功');
    
    // 创建 production 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS production (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_code VARCHAR(100) NOT NULL,
        batch_no VARCHAR(100) NOT NULL,
        factory VARCHAR(100) NOT NULL,
        defect_rate DECIMAL(5,2) NOT NULL,
        use_time DATETIME NOT NULL,
        project VARCHAR(100),
        exception_count INT DEFAULT 0,
        operator VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ production 表创建成功');
    
  } catch (error) {
    console.error('❌ 创建表失败:', error);
    throw error;
  }
}

// 运行修复
fixDatabaseSchema().catch(console.error);
