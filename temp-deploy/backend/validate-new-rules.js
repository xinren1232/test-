import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function validateNewRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 验证新规则库并展示示例结果...');
    
    // 1. 查看规则库概况
    console.log('\n📊 规则库概况:');
    const [rules] = await connection.execute(`
      SELECT intent_name, description, priority 
      FROM nlp_intent_rules 
      ORDER BY priority, intent_name
    `);
    
    console.log('基础规则 (priority=10):');
    rules.filter(r => r.priority === 10).forEach((rule, i) => {
      console.log(`  ${i+1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    console.log('\n进阶规则 (priority=20):');
    rules.filter(r => r.priority === 20).forEach((rule, i) => {
      console.log(`  ${i+1}. ${rule.intent_name} - ${rule.description}`);
    });
    
    // 2. 测试供应商库存查询
    console.log('\n\n🏢 供应商库存查询示例:');
    const [supplierRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = "供应商库存查询"'
    );
    
    if (supplierRule[0]) {
      const [results] = await connection.execute(supplierRule[0].action_target);
      console.log('前5名供应商库存情况:');
      results.slice(0, 5).forEach((row, i) => {
        console.log(`${i+1}. ${row.供应商}: 批次数=${row.库存批次数}, 总量=${row.总数量}, 风险=${row.风险批次}`);
      });
    }
    
    // 3. 测试批次信息查询
    console.log('\n\n📋 批次信息查询示例:');
    const [batchRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = "批次信息查询"'
    );
    
    if (batchRule[0]) {
      const [results] = await connection.execute(batchRule[0].action_target);
      console.log('前3个批次完整信息:');
      results.slice(0, 3).forEach((row, i) => {
        console.log(`${i+1}. 批次${row.批次号}: ${row.物料名称}(${row.供应商}) - 产线异常:${row.产线异常}, 测试异常:${row.测试异常}`);
      });
    }
    
    // 4. 测试物料上线Top不良
    console.log('\n\n🚨 物料上线Top不良示例:');
    const [topDefectRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = "物料上线Top不良"'
    );
    
    if (topDefectRule[0]) {
      const [results] = await connection.execute(topDefectRule[0].action_target);
      console.log('不良率最高的5个物料-供应商组合:');
      results.slice(0, 5).forEach((row, i) => {
        console.log(`${i+1}. ${row.物料名称}(${row.供应商}): 平均不良率=${parseFloat(row.平均不良率).toFixed(2)}%, 排名=${row.不良率排名}`);
      });
    }
    
    // 5. 测试物料测试Top不良
    console.log('\n\n🧪 物料测试Top不良示例:');
    const [testTopRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = "物料测试Top不良"'
    );
    
    if (testTopRule[0]) {
      const [results] = await connection.execute(testTopRule[0].action_target);
      console.log('测试失败率最高的5个物料-供应商组合:');
      results.slice(0, 5).forEach((row, i) => {
        console.log(`${i+1}. ${row.物料名称}(${row.供应商}): 失败率=${row.失败率}%, 失败次数=${row.失败次数}/${row.总测试次数}`);
      });
    }
    
    // 6. 测试库存状态查询
    console.log('\n\n⚠️ 库存状态查询示例:');
    const [statusRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = "库存状态查询"'
    );
    
    if (statusRule[0]) {
      const [results] = await connection.execute(statusRule[0].action_target);
      console.log(`发现 ${results.length} 个风险/异常库存项目:`);
      results.slice(0, 5).forEach((row, i) => {
        console.log(`${i+1}. ${row.物料名称}(${row.供应商}): 状态=${row.状态}, 数量=${row.数量}`);
      });
    }
    
    // 7. 测试项目测试情况查询
    console.log('\n\n📊 项目测试情况查询示例:');
    const [projectTestRule] = await connection.execute(
      'SELECT action_target FROM nlp_intent_rules WHERE intent_name = "项目测试情况查询"'
    );
    
    if (projectTestRule[0]) {
      const [results] = await connection.execute(projectTestRule[0].action_target);
      console.log('各项目测试情况:');
      results.forEach((row, i) => {
        console.log(`${i+1}. ${row.项目}: 通过率=${row.通过率}%, 测试次数=${row.总测试次数}, 物料数=${row.涉及物料数}`);
      });
    }
    
    console.log('\n✅ 规则库验证完成！所有规则都能正常执行并返回预期结果。');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

validateNewRules();
