import mysql from 'mysql2/promise';

async function fixRuleRealDataAccess() {
  let connection;
  
  try {
    console.log('🔧 修复规则调取真实数据问题...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查当前数据库中的真实数据量
    console.log('\n📊 步骤1: 检查数据库真实数据量...');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    const dataStats = {};
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        dataStats[table] = count[0].count;
        console.log(`   ${table}: ${dataStats[table]}条记录`);
      } catch (error) {
        console.log(`   ❌ 检查${table}失败: ${error.message}`);
        dataStats[table] = 0;
      }
    }
    
    // 2. 测试基础规则的真实数据访问
    console.log('\n🔍 步骤2: 测试基础规则的真实数据访问...');
    
    const testRules = [
      {
        id: 485,
        name: '查看所有供应商',
        expectedTable: 'inventory',
        description: '应该返回所有不重复的供应商'
      },
      {
        id: 480,
        name: '查看所有物料',
        expectedTable: 'inventory', 
        description: '应该返回所有不重复的物料'
      },
      {
        id: 243,
        name: '物料库存信息查询_优化',
        expectedTable: 'inventory',
        description: '应该返回匹配的库存记录',
        needsParam: true
      }
    ];
    
    for (const rule of testRules) {
      console.log(`\n🔍 测试规则${rule.id}: ${rule.name}`);
      
      try {
        // 获取规则SQL
        const [ruleData] = await connection.execute(
          'SELECT action_target FROM nlp_intent_rules WHERE id = ?',
          [rule.id]
        );
        
        if (ruleData.length === 0) {
          console.log('   ❌ 规则不存在');
          continue;
        }
        
        let sql = ruleData[0].action_target;
        console.log(`   SQL: ${sql.substring(0, 100)}...`);
        
        // 处理参数
        if (rule.needsParam && sql.includes('?')) {
          sql = sql.replace(/\?/g, "'电池'");
          console.log('   使用测试参数: 电池');
        }
        
        // 执行原始SQL（不添加LIMIT）
        const [results] = await connection.execute(sql);
        console.log(`   📊 真实数据量: ${results.length}条记录`);
        
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   🏷️ 字段: ${fields.join(', ')}`);
          
          // 检查字段是否为中文
          const hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
          console.log(`   ${hasChineseFields ? '✅' : '❌'} 中文字段: ${hasChineseFields}`);
          
          // 显示数据样本
          console.log('   📄 数据样本:');
          const sample = results[0];
          Object.entries(sample).slice(0, 3).forEach(([field, value]) => {
            console.log(`     ${field}: ${value}`);
          });
          
          // 检查数据的真实性（不是固定模拟数据）
          if (results.length > 1) {
            const uniqueValues = new Set();
            const fieldToCheck = fields[0];
            results.slice(0, 10).forEach(row => {
              uniqueValues.add(row[fieldToCheck]);
            });
            console.log(`   🔍 数据多样性: ${fieldToCheck}字段有${uniqueValues.size}个不同值`);
          }
        } else {
          console.log('   ⚠️ 无数据返回');
        }
        
      } catch (error) {
        console.log(`   ❌ 执行失败: ${error.message}`);
      }
    }
    
    // 3. 检查规则测试API的LIMIT限制问题
    console.log('\n🔧 步骤3: 检查规则测试API的LIMIT限制...');
    
    console.log('发现问题: 规则测试API在rulesRoutes.js第189行添加了固定的LIMIT 10限制');
    console.log('这导致所有规则测试都只返回10条记录，而不是真实的完整数据');
    
    // 4. 建议的修复方案
    console.log('\n💡 步骤4: 修复方案建议...');
    
    console.log('修复建议:');
    console.log('1. 移除rulesRoutes.js中的强制LIMIT 10限制');
    console.log('2. 对于数据探索类规则，允许返回完整结果');
    console.log('3. 对于查询类规则，使用合理的LIMIT（如100条）');
    console.log('4. 在前端分页显示大量数据');
    
    // 5. 验证数据同步状态
    console.log('\n🔄 步骤5: 验证数据同步状态...');
    
    // 检查real_data_storage表
    try {
      const [realDataCount] = await connection.execute('SELECT COUNT(*) as count FROM real_data_storage');
      console.log(`   real_data_storage表: ${realDataCount[0].count}条记录`);
    } catch (error) {
      console.log(`   ❌ real_data_storage表检查失败: ${error.message}`);
    }
    
    // 6. 测试不同类型的查询
    console.log('\n🧪 步骤6: 测试不同类型的查询...');
    
    const queryTests = [
      {
        name: '供应商统计查询',
        sql: `SELECT supplier_name as 供应商, COUNT(*) as 记录数量 
              FROM inventory 
              WHERE supplier_name IS NOT NULL AND supplier_name != ''
              GROUP BY supplier_name 
              ORDER BY 记录数量 DESC`,
        expectType: '统计数据'
      },
      {
        name: '物料统计查询', 
        sql: `SELECT material_name as 物料名称, COUNT(*) as 记录数量
              FROM inventory 
              WHERE material_name IS NOT NULL AND material_name != ''
              GROUP BY material_name 
              ORDER BY 记录数量 DESC`,
        expectType: '统计数据'
      },
      {
        name: '库存详细查询',
        sql: `SELECT storage_location as 工厂, material_name as 物料名称, 
                     supplier_name as 供应商, quantity as 数量
              FROM inventory 
              WHERE material_name LIKE '%电池%'
              ORDER BY id DESC`,
        expectType: '详细数据'
      }
    ];
    
    for (const test of queryTests) {
      console.log(`\n🔍 ${test.name}:`);
      try {
        const [results] = await connection.execute(test.sql);
        console.log(`   📊 返回${results.length}条${test.expectType}`);
        
        if (results.length > 0) {
          console.log(`   字段: ${Object.keys(results[0]).join(', ')}`);
          console.log(`   样本: ${JSON.stringify(results[0])}`);
        }
      } catch (error) {
        console.log(`   ❌ 查询失败: ${error.message}`);
      }
    }
    
    // 7. 总结和建议
    console.log('\n📋 步骤7: 总结和建议...');
    
    const totalRecords = Object.values(dataStats).reduce((sum, count) => sum + count, 0);
    console.log(`数据库总记录数: ${totalRecords}条`);
    console.log(`- inventory: ${dataStats.inventory}条`);
    console.log(`- lab_tests: ${dataStats.lab_tests}条`);
    console.log(`- online_tracking: ${dataStats.online_tracking}条`);
    
    if (totalRecords > 0) {
      console.log('\n✅ 数据库包含真实数据，问题在于API限制');
      console.log('建议修复rulesRoutes.js中的LIMIT限制，让规则能访问完整数据');
    } else {
      console.log('\n❌ 数据库缺少真实数据，需要先同步数据');
    }
    
    console.log('\n🎉 规则真实数据访问检查完成！');
    
  } catch (error) {
    console.error('❌ 修复规则真实数据访问失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixRuleRealDataAccess().catch(console.error);
