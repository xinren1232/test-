/**
 * 诊断134条规则的数据调取问题
 * 检查规则逻辑、数据接入、以及实际执行结果
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function diagnoseRulesDataIssue() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查规则总数和状态
    console.log('\n=== 第一步：检查规则基本状态 ===');
    const [ruleStats] = await connection.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY status
    `);
    
    console.log('📊 规则状态统计:');
    ruleStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count}条`);
    });
    
    // 2. 检查数据表是否存在数据
    console.log('\n=== 第二步：检查数据表数据量 ===');
    const tables = ['inventory', 'online_tracking', 'lab_tests'];
    const dataStats = {};
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        dataStats[table] = count[0].count;
        console.log(`📦 ${table}表: ${count[0].count}条数据`);
      } catch (error) {
        console.log(`❌ ${table}表: 不存在或查询失败 - ${error.message}`);
        dataStats[table] = 0;
      }
    }
    
    // 3. 测试几个典型规则的执行
    console.log('\n=== 第三步：测试典型规则执行 ===');
    
    // 获取几个不同类型的规则进行测试
    const [testRules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        description,
        action_type,
        action_target,
        parameters,
        example_query
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND action_type = 'SQL_QUERY'
      ORDER BY priority ASC
      LIMIT 5
    `);
    
    console.log(`🧪 测试 ${testRules.length} 个规则:`);
    
    for (const rule of testRules) {
      console.log(`\n📋 测试规则: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   示例: ${rule.example_query}`);
      
      // 检查SQL查询
      let sql = rule.action_target;
      console.log(`   SQL: ${sql.substring(0, 100)}...`);
      
      // 尝试执行SQL（替换参数占位符）
      try {
        let testSQL = sql;
        
        // 处理参数占位符
        if (testSQL.includes('?')) {
          // 根据规则类型提供测试参数
          if (rule.intent_name.includes('库存')) {
            testSQL = testSQL.replace(/\?/g, "'LCD显示屏'");
          } else if (rule.intent_name.includes('供应商')) {
            testSQL = testSQL.replace(/\?/g, "'BOE'");
          } else if (rule.intent_name.includes('工厂')) {
            testSQL = testSQL.replace(/\?/g, "'深圳'");
          } else {
            testSQL = testSQL.replace(/\?/g, "'test'");
          }
        }
        
        // 添加LIMIT以避免大量数据
        if (!testSQL.toLowerCase().includes('limit')) {
          testSQL += ' LIMIT 5';
        }
        
        console.log(`   测试SQL: ${testSQL}`);
        
        const [results] = await connection.execute(testSQL);
        console.log(`   ✅ 执行成功，返回 ${results.length} 条数据`);
        
        if (results.length > 0) {
          console.log(`   📄 样本数据字段: ${Object.keys(results[0]).join(', ')}`);
        } else {
          console.log(`   ⚠️ 返回0条数据 - 可能是数据表为空或查询条件不匹配`);
        }
        
      } catch (error) {
        console.log(`   ❌ 执行失败: ${error.message}`);
      }
    }
    
    // 4. 检查规则与数据表的匹配情况
    console.log('\n=== 第四步：检查规则与数据表匹配情况 ===');
    
    const [allRules] = await connection.execute(`
      SELECT 
        intent_name,
        action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND action_type = 'SQL_QUERY'
    `);
    
    const tableUsage = {
      inventory: 0,
      online_tracking: 0,
      lab_tests: 0,
      other: 0
    };
    
    allRules.forEach(rule => {
      const sql = rule.action_target.toLowerCase();
      if (sql.includes('from inventory')) {
        tableUsage.inventory++;
      } else if (sql.includes('from online_tracking')) {
        tableUsage.online_tracking++;
      } else if (sql.includes('from lab_tests')) {
        tableUsage.lab_tests++;
      } else {
        tableUsage.other++;
      }
    });
    
    console.log('📊 规则使用的数据表统计:');
    Object.entries(tableUsage).forEach(([table, count]) => {
      const dataCount = dataStats[table] || 0;
      const status = dataCount > 0 ? '✅' : '❌';
      console.log(`  ${table}: ${count}个规则 ${status} (数据量: ${dataCount})`);
    });
    
    // 5. 生成诊断报告
    console.log('\n=== 诊断报告 ===');
    
    const totalRules = ruleStats.reduce((sum, stat) => sum + stat.count, 0);
    const activeRules = ruleStats.find(stat => stat.status === 'active')?.count || 0;
    const totalData = Object.values(dataStats).reduce((sum, count) => sum + count, 0);
    
    console.log(`📋 规则状态: ${activeRules}/${totalRules} 条规则处于活跃状态`);
    console.log(`📦 数据状态: 总计 ${totalData} 条数据`);
    
    // 判断问题类型
    if (totalData === 0) {
      console.log('🔍 问题诊断: 数据表为空，需要生成测试数据');
      console.log('💡 建议: 运行数据生成脚本填充测试数据');
    } else if (activeRules === 0) {
      console.log('🔍 问题诊断: 没有活跃规则');
      console.log('💡 建议: 检查规则状态，激活必要的规则');
    } else {
      console.log('🔍 问题诊断: 规则和数据都存在，可能是执行逻辑问题');
      console.log('💡 建议: 检查规则执行服务和参数处理逻辑');
    }
    
  } catch (error) {
    console.error('❌ 诊断过程出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行诊断
diagnoseRulesDataIssue().catch(console.error);
