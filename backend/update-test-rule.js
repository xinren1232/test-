import initializeDatabase from './src/models/index.js';

async function updateTestRule() {
  console.log('🔧 更新测试结果统计规则...');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 更新规则的示例查询和SQL模板
    const updateQuery = `
      UPDATE nlp_intent_rules 
      SET 
        example_query = '统计PASS和FAIL的测试结果',
        action_target = 'SELECT test_result, COUNT(*) as count FROM lab_tests WHERE test_result IN (''PASS'', ''FAIL'') GROUP BY test_result ORDER BY count DESC'
      WHERE intent_name = '真实测试结果统计'
    `;
    
    await sequelize.query(updateQuery, {
      type: sequelize.QueryTypes.UPDATE
    });
    
    console.log('✅ 规则更新成功');
    
    // 验证更新后的规则
    const verifyQuery = "SELECT * FROM nlp_intent_rules WHERE intent_name = '真实测试结果统计'";
    const verifyResults = await sequelize.query(verifyQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    if (verifyResults.length > 0) {
      const rule = verifyResults[0];
      console.log('\n📋 更新后的规则详情:');
      console.log(`规则名称: ${rule.intent_name}`);
      console.log(`示例查询: ${rule.example_query}`);
      console.log(`SQL模板: ${rule.action_target}`);
      
      // 测试更新后的SQL
      console.log('\n🧪 测试更新后的SQL...');
      const testResults = await sequelize.query(rule.action_target, {
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ 测试成功，返回 ${testResults.length} 条记录`);
      testResults.forEach((row, index) => {
        console.log(`${index + 1}. 测试结果: ${row.test_result}, 数量: ${row.count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  }
}

updateTestRule();
