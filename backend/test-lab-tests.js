import initializeDatabase from './src/models/index.js';

async function testLabTestsQuery() {
  console.log('🧪 测试lab_tests表查询...');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    // 检查表是否存在数据
    console.log('\n🔍 检查lab_tests表总记录数...');
    const countQuery = "SELECT COUNT(*) as total FROM lab_tests";
    const countResult = await sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    console.log(`表中总记录数: ${countResult[0].total}`);
    
    if (countResult[0].total > 0) {
      console.log('\n📋 查看前5条记录的test_result字段:');
      const sampleQuery = "SELECT id, test_result, test_date FROM lab_tests LIMIT 5";
      const sampleResults = await sequelize.query(sampleQuery, {
        type: sequelize.QueryTypes.SELECT
      });
      sampleResults.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}, test_result: "${row.test_result}", 日期: ${row.test_date}`);
      });
      
      // 查看所有不同的test_result值
      console.log('\n🔍 查看所有不同的test_result值:');
      const distinctQuery = "SELECT DISTINCT test_result FROM lab_tests";
      const distinctResults = await sequelize.query(distinctQuery, {
        type: sequelize.QueryTypes.SELECT
      });
      distinctResults.forEach((row, index) => {
        console.log(`${index + 1}. "${row.test_result}"`);
      });
      
      // 测试具体的查询条件
      console.log('\n📊 测试具体查询条件...');
      const testQuery = "SELECT * FROM lab_tests WHERE test_result LIKE '%OK%' OR test_result LIKE '%PENDING%' OR test_result LIKE '%NG%' ORDER BY test_date DESC LIMIT 5";
      
      const results = await sequelize.query(testQuery, {
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ 条件查询成功，返回 ${results.length} 条记录`);
      
      if (results.length > 0) {
        console.log('\n📋 匹配的记录:');
        results.forEach((row, index) => {
          console.log(`${index + 1}. ID: ${row.id}, 测试结果: ${row.test_result}, 日期: ${row.test_date}`);
        });
      } else {
        console.log('❌ 没有找到匹配OK/PENDING/NG的记录');
        
        // 尝试更宽泛的查询
        console.log('\n🔍 尝试查询包含PASS/FAIL的记录:');
        const passFailQuery = "SELECT * FROM lab_tests WHERE test_result LIKE '%PASS%' OR test_result LIKE '%FAIL%' ORDER BY test_date DESC LIMIT 5";
        const passFailResults = await sequelize.query(passFailQuery, {
          type: sequelize.QueryTypes.SELECT
        });
        console.log(`PASS/FAIL查询返回 ${passFailResults.length} 条记录`);
        
        if (passFailResults.length > 0) {
          passFailResults.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, 测试结果: ${row.test_result}, 日期: ${row.test_date}`);
          });
        }
      }
    } else {
      console.log('❌ lab_tests表为空');
    }
    
  } catch (error) {
    console.error('❌ 数据库查询失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

testLabTestsQuery();
