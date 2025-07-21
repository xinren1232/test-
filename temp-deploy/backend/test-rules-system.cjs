// 测试规则系统
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testRulesSystem() {
  let connection;
  
  try {
    console.log('🧪 测试规则系统...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查规则数量
    console.log('\n📊 检查规则数量:');
    const [ruleCount] = await connection.execute('SELECT COUNT(*) as count FROM assistant_rules WHERE status = "active"');
    console.log(`活跃规则数量: ${ruleCount[0].count}`);
    
    // 2. 列出所有规则
    console.log('\n📋 规则列表:');
    const [rules] = await connection.execute('SELECT intent_name, description, priority FROM assistant_rules WHERE status = "active" ORDER BY priority DESC');
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
      console.log(`   描述: ${rule.description}`);
    });
    
    // 3. 测试几个关键规则的SQL查询
    console.log('\n🔍 测试规则SQL查询:');
    
    const testQueries = [
      {
        name: '库存基础查询',
        description: '测试库存数据查询'
      },
      {
        name: '供应商统计', 
        description: '测试供应商统计查询'
      },
      {
        name: '检验数据基础查询',
        description: '测试检验数据查询'
      }
    ];
    
    for (const test of testQueries) {
      try {
        console.log(`\n测试: ${test.description}`);
        
        // 获取规则的SQL
        const [ruleData] = await connection.execute(
          'SELECT action_target FROM assistant_rules WHERE intent_name = ? AND status = "active"',
          [test.name]
        );
        
        if (ruleData.length === 0) {
          console.log(`❌ 未找到规则: ${test.name}`);
          continue;
        }
        
        const sql = ruleData[0].action_target;
        console.log(`SQL: ${sql.substring(0, 100)}...`);
        
        // 执行SQL查询
        const [results] = await connection.execute(sql);
        console.log(`✅ 查询成功，返回 ${results.length} 条记录`);
        
        if (results.length > 0) {
          console.log(`字段: ${Object.keys(results[0]).join(', ')}`);
          
          // 显示第一条记录的部分数据
          const firstRecord = results[0];
          const displayFields = Object.keys(firstRecord).slice(0, 4); // 只显示前4个字段
          console.log('第一条记录:');
          displayFields.forEach(field => {
            const value = firstRecord[field];
            const displayValue = typeof value === 'string' && value.length > 30 
              ? value.substring(0, 30) + '...' 
              : value;
            console.log(`  ${field}: ${displayValue}`);
          });
        }
        
      } catch (error) {
        console.log(`❌ 查询失败: ${error.message}`);
      }
    }
    
    // 4. 测试数据表连接
    console.log('\n🔗 测试数据表状态:');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}表: ${count[0].count} 条记录`);
      } catch (error) {
        console.log(`❌ ${table}表查询失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 规则系统测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testRulesSystem();
