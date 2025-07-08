import initializeDatabase from './src/models/index.js';

async function checkTestTableStructure() {
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;
    
    console.log('🔍 检查测试相关表结构...\n');
    
    // 检查lab_tests表结构
    console.log('=== lab_tests表结构 ===');
    const labTestsColumns = await sequelize.query('DESCRIBE lab_tests', {
      type: sequelize.QueryTypes.SELECT
    });
    labTestsColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? '可空' : '非空'})`);
    });
    
    // 检查测试结果的实际值
    console.log('\n=== lab_tests表测试结果字段的实际值 ===');
    const testResults = await sequelize.query('SELECT DISTINCT test_result FROM lab_tests ORDER BY test_result', {
      type: sequelize.QueryTypes.SELECT
    });
    console.log('测试结果值:', testResults.map(r => r.test_result).join(', '));
    
    // 检查测试结果统计
    console.log('\n=== 测试结果统计 ===');
    const resultStats = await sequelize.query('SELECT test_result, COUNT(*) as count FROM lab_tests GROUP BY test_result', {
      type: sequelize.QueryTypes.SELECT
    });
    resultStats.forEach(stat => {
      console.log(`- ${stat.test_result}: ${stat.count}条记录`);
    });
    
    // 检查FAIL记录的详细信息
    console.log('\n=== FAIL记录详细信息示例 ===');
    const failRecords = await sequelize.query('SELECT * FROM lab_tests WHERE test_result = "FAIL" LIMIT 3', {
      type: sequelize.QueryTypes.SELECT
    });
    
    if (failRecords.length > 0) {
      console.log('FAIL记录字段:');
      Object.keys(failRecords[0]).forEach(key => {
        console.log(`- ${key}: ${failRecords[0][key]}`);
      });
    } else {
      console.log('未找到FAIL记录');
    }
    
    // 检查是否有缺陷描述字段
    console.log('\n=== 缺陷描述字段检查 ===');
    const defectFields = labTestsColumns.filter(col => 
      col.Field.includes('defect') || col.Field.includes('desc') || col.Field.includes('reason')
    );
    
    if (defectFields.length > 0) {
      console.log('找到缺陷相关字段:');
      defectFields.forEach(field => {
        console.log(`- ${field.Field}: ${field.Type}`);
      });
      
      // 检查缺陷描述的实际内容
      const defectSamples = await sequelize.query(`SELECT defect_desc, COUNT(*) as count FROM lab_tests WHERE defect_desc IS NOT NULL AND defect_desc != '' GROUP BY defect_desc LIMIT 5`, {
        type: sequelize.QueryTypes.SELECT
      });
      
      if (defectSamples.length > 0) {
        console.log('\n缺陷描述示例:');
        defectSamples.forEach(sample => {
          console.log(`- "${sample.defect_desc}": ${sample.count}次`);
        });
      }
    } else {
      console.log('未找到缺陷相关字段');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkTestTableStructure();
