import mysql from 'mysql2/promise';

/**
 * 修复数据库连接问题
 */

async function fixDatabaseConnection() {
  console.log('🔧 修复数据库连接问题...\n');
  
  const dbConfigs = [
    {
      name: '当前配置',
      config: {
        host: 'localhost',
        user: 'root',
        password: 'Zxylsy.99',
        database: 'iqe_inspection'
      }
    },
    {
      name: '带字符集配置',
      config: {
        host: 'localhost',
        user: 'root',
        password: 'Zxylsy.99',
        database: 'iqe_inspection',
        charset: 'utf8mb4',
        timezone: '+08:00'
      }
    },
    {
      name: '带连接池配置',
      config: {
        host: 'localhost',
        user: 'root',
        password: 'Zxylsy.99',
        database: 'iqe_inspection',
        charset: 'utf8mb4',
        timezone: '+08:00',
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      }
    }
  ];
  
  for (const { name, config } of dbConfigs) {
    console.log(`📋 测试${name}...`);
    
    try {
      const connection = await mysql.createConnection(config);
      console.log(`✅ ${name}连接成功`);
      
      // 测试查询
      const [results] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
      console.log(`📊 活跃规则数量: ${results[0].count}`);
      
      // 测试一个具体的规则查询
      const [rules] = await connection.execute(`
        SELECT intent_name, action_target
        FROM nlp_intent_rules 
        WHERE intent_name = '库存状态查询' AND status = 'active'
        LIMIT 1
      `);
      
      if (rules.length > 0) {
        const [ruleResults] = await connection.execute(rules[0].action_target);
        console.log(`📋 规则测试成功: ${ruleResults.length}条记录`);
      }
      
      await connection.end();
      console.log(`✅ ${name}测试完成\n`);
      
      // 如果这个配置成功，更新API文件
      if (name === '带连接池配置') {
        console.log('🔧 更新enhanced-qa-api.js配置...');
        await updateAPIConfig(config);
      }
      
    } catch (error) {
      console.log(`❌ ${name}连接失败: ${error.message}`);
      console.log(`   错误代码: ${error.code}\n`);
    }
  }
  
  // 提供解决方案
  console.log('💡 解决方案:');
  console.log('1. 如果所有配置都失败，检查MySQL服务是否运行');
  console.log('2. 检查MySQL用户权限');
  console.log('3. 尝试重启MySQL服务');
  console.log('4. 检查防火墙设置');
}

/**
 * 更新API配置
 */
async function updateAPIConfig(workingConfig) {
  console.log('📝 生成新的数据库配置...');
  
  const newConfig = `const dbConfig = {
  host: '${workingConfig.host}',
  user: '${workingConfig.user}',
  password: '${workingConfig.password}',
  database: '${workingConfig.database}',
  charset: '${workingConfig.charset}',
  timezone: '${workingConfig.timezone}',
  acquireTimeout: ${workingConfig.acquireTimeout},
  timeout: ${workingConfig.timeout},
  reconnect: ${workingConfig.reconnect}
};`;
  
  console.log('新配置:');
  console.log(newConfig);
  console.log('\n💡 请手动更新enhanced-qa-api.js中的dbConfig变量');
}

// 执行修复
fixDatabaseConnection();
