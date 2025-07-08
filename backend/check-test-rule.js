import initializeDatabase from './src/models/index.js';

async function checkTestRule() {
  console.log('🔍 检查测试结果统计规则...');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 查询"真实测试结果统计"规则
    const ruleQuery = "SELECT * FROM nlp_intent_rules WHERE intent_name = '真实测试结果统计'";
    const ruleResults = await sequelize.query(ruleQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    if (ruleResults.length > 0) {
      const rule = ruleResults[0];
      console.log('\n📋 规则详情:');
      console.log(`规则名称: ${rule.intent_name}`);
      console.log(`示例查询: ${rule.example_query}`);
      console.log(`SQL模板: ${rule.action_target}`);
      console.log(`触发词: ${rule.trigger_words}`);
      
      // 测试修正后的SQL
      console.log('\n🔧 测试修正后的SQL...');
      const correctedSQL = "SELECT test_result, COUNT(*) as count FROM lab_tests WHERE test_result IN ('PASS', 'FAIL') GROUP BY test_result ORDER BY count DESC";
      
      const testResults = await sequelize.query(correctedSQL, {
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ 修正SQL查询成功，返回 ${testResults.length} 条记录`);
      testResults.forEach((row, index) => {
        console.log(`${index + 1}. 测试结果: ${row.test_result}, 数量: ${row.count}`);
      });
      
    } else {
      console.log('❌ 未找到"真实测试结果统计"规则');
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

checkTestRule();
