import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDatabaseConnection() {
  let connection;
  
  try {
    console.log('🔍 检查数据库连接状态...');
    console.log('数据库配置:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      password: '***'
    });
    
    // 1. 测试基本连接
    console.log('\n📡 步骤1: 测试数据库连接...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 2. 检查数据库是否存在
    console.log('\n🗄️ 步骤2: 检查数据库是否存在...');
    const [databases] = await connection.execute(`SHOW DATABASES LIKE 'iqe_inspection'`);
    
    if (databases.length > 0) {
      console.log('✅ 数据库 iqe_inspection 存在');
    } else {
      console.log('❌ 数据库 iqe_inspection 不存在');
      return;
    }
    
    // 3. 检查关键表是否存在
    console.log('\n📋 步骤3: 检查关键表是否存在...');
    const requiredTables = ['inventory', 'testing', 'online_tracking', 'batch_management', 'nlp_intent_rules'];
    
    for (const tableName of requiredTables) {
      const [tables] = await connection.execute(`SHOW TABLES LIKE '${tableName}'`);
      if (tables.length > 0) {
        console.log(`✅ 表 ${tableName} 存在`);
      } else {
        console.log(`❌ 表 ${tableName} 不存在`);
      }
    }
    
    // 4. 检查表结构
    console.log('\n🏗️ 步骤4: 检查关键表结构...');
    
    // 检查online_tracking表结构
    try {
      const [columns] = await connection.execute(`DESCRIBE online_tracking`);
      console.log('online_tracking表字段:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
    } catch (error) {
      console.log('❌ 无法获取online_tracking表结构:', error.message);
    }
    
    // 5. 检查数据量
    console.log('\n📊 步骤5: 检查各表数据量...');
    
    const tableStats = {};
    for (const tableName of requiredTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        tableStats[tableName] = count[0].count;
        console.log(`${tableName}: ${count[0].count}条记录`);
      } catch (error) {
        console.log(`❌ 无法查询${tableName}表: ${error.message}`);
        tableStats[tableName] = 'ERROR';
      }
    }
    
    // 6. 检查MySQL服务状态
    console.log('\n⚙️ 步骤6: 检查MySQL服务信息...');
    
    try {
      const [version] = await connection.execute(`SELECT VERSION() as version`);
      console.log(`MySQL版本: ${version[0].version}`);
      
      const [status] = await connection.execute(`SHOW STATUS LIKE 'Uptime'`);
      console.log(`MySQL运行时间: ${status[0].Value}秒`);
      
      const [processlist] = await connection.execute(`SHOW PROCESSLIST`);
      console.log(`当前连接数: ${processlist.length}`);
      
    } catch (error) {
      console.log('❌ 无法获取MySQL状态信息:', error.message);
    }
    
    // 7. 测试写入权限
    console.log('\n✍️ 步骤7: 测试数据库写入权限...');
    
    try {
      // 创建测试表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS connection_test (
          id INT AUTO_INCREMENT PRIMARY KEY,
          test_data VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 插入测试数据
      await connection.execute(`
        INSERT INTO connection_test (test_data) VALUES (?)
      `, [`连接测试_${Date.now()}`]);
      
      // 查询测试数据
      const [testResult] = await connection.execute(`
        SELECT COUNT(*) as count FROM connection_test
      `);
      
      console.log(`✅ 写入权限正常，测试表记录数: ${testResult[0].count}`);
      
      // 清理测试表
      await connection.execute(`DROP TABLE IF EXISTS connection_test`);
      console.log('✅ 测试表已清理');
      
    } catch (error) {
      console.log('❌ 写入权限测试失败:', error.message);
    }
    
    // 8. 总结
    console.log('\n📋 数据库连接状态总结:');
    console.log('='.repeat(50));
    
    const hasAllTables = requiredTables.every(table => tableStats[table] !== 'ERROR');
    const hasData = Object.values(tableStats).some(count => typeof count === 'number' && count > 0);
    
    if (hasAllTables) {
      console.log('✅ 数据库连接正常');
      console.log('✅ 所有必需表都存在');
      
      if (hasData) {
        console.log('✅ 数据库包含数据');
        console.log('\n📊 数据分布:');
        Object.entries(tableStats).forEach(([table, count]) => {
          if (typeof count === 'number') {
            console.log(`  ${table}: ${count}条`);
          }
        });
      } else {
        console.log('⚠️ 数据库表为空，需要生成数据');
      }
      
      console.log('\n🎯 下一步建议:');
      if (!hasData) {
        console.log('1. 数据库连接正常，但缺少数据');
        console.log('2. 需要检查前端数据生成和同步逻辑');
        console.log('3. 确认数据生成页面是否正确调用后端API');
      } else {
        console.log('1. 数据库状态正常');
        console.log('2. 可以进行智能问答测试');
      }
      
    } else {
      console.log('❌ 数据库连接或表结构有问题');
      console.log('需要检查数据库初始化脚本');
    }
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查MySQL服务是否启动');
    console.log('2. 检查数据库配置信息是否正确');
    console.log('3. 检查数据库用户权限');
    console.log('4. 检查防火墙设置');
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkDatabaseConnection().catch(console.error);
