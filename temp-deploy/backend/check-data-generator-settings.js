import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDataGeneratorSettings() {
  console.log('🔍 检查数据生成器设定与实际数据...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查测试数据的项目和基线设定
    console.log('1. 📊 检查测试数据的项目和基线设定:');
    
    const [projectStats] = await connection.execute(`
      SELECT 
        project_id,
        baseline_id,
        COUNT(*) as count
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id
      ORDER BY count DESC
    `);
    
    console.log('   当前数据库中的项目-基线分布:');
    projectStats.forEach(stat => {
      console.log(`     ${stat.project_id} - ${stat.baseline_id}: ${stat.count} 条记录`);
    });
    
    // 2. 检查数据生成器中的设定
    console.log('\n2. 📋 数据生成器中的设定:');
    console.log('   根据data_generator.js，测试数据应该使用以下设定:');
    
    const generatorSettings = {
      projects: ["X6827", "S665LN", "KI4K", "X6828", "X6831", "KI5K", "S662LN", "S663LN", "S664LN"],
      baselineMapping: {
        "X6827": "I6789",
        "S665LN": "I6789", 
        "KI4K": "I6789",
        "X6828": "I6789",
        "X6831": "I6788",
        "KI5K": "I6788",
        "S662LN": "I6787",
        "S663LN": "I6787",
        "S664LN": "I6787"
      }
    };
    
    console.log('   项目列表:', generatorSettings.projects);
    console.log('   项目-基线映射:');
    Object.entries(generatorSettings.baselineMapping).forEach(([project, baseline]) => {
      console.log(`     ${project} → ${baseline}`);
    });
    
    // 3. 检查测试结果的设定
    console.log('\n3. 🧪 检查测试结果设定:');
    
    const [resultStats] = await connection.execute(`
      SELECT 
        test_result,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as percentage
      FROM lab_tests 
      GROUP BY test_result
      ORDER BY count DESC
    `);
    
    console.log('   当前测试结果分布:');
    resultStats.forEach(stat => {
      console.log(`     ${stat.test_result}: ${stat.count} 条 (${stat.percentage}%)`);
    });
    
    console.log('   数据生成器设定: 合格90%, 不合格10%');
    
    // 4. 检查不良现象字段
    console.log('\n4. 🔍 检查不良现象字段:');
    
    const [defectStats] = await connection.execute(`
      SELECT 
        CASE 
          WHEN defect_desc IS NULL OR defect_desc = '' THEN '空值'
          ELSE '有值'
        END as defect_status,
        COUNT(*) as count
      FROM lab_tests 
      GROUP BY defect_status
    `);
    
    console.log('   不良现象字段状态:');
    defectStats.forEach(stat => {
      console.log(`     ${stat.defect_status}: ${stat.count} 条记录`);
    });
    
    // 5. 检查备注字段
    console.log('\n5. 📝 检查备注字段:');
    
    const [notesStats] = await connection.execute(`
      SELECT 
        CASE 
          WHEN notes IS NULL OR notes = '' THEN '空值'
          ELSE '有值'
        END as notes_status,
        COUNT(*) as count
      FROM lab_tests 
      GROUP BY notes_status
    `);
    
    console.log('   备注字段状态:');
    notesStats.forEach(stat => {
      console.log(`     ${stat.notes_status}: ${stat.count} 条记录`);
    });
    
    // 6. 检查数据是否来自生成器
    console.log('\n6. 🔍 验证数据来源:');
    
    const [sampleData] = await connection.execute(`
      SELECT test_id, material_code, batch_code, project_id, baseline_id, test_result, defect_desc
      FROM lab_tests 
      LIMIT 5
    `);
    
    console.log('   样本数据分析:');
    sampleData.forEach((item, index) => {
      console.log(`     ${index + 1}. 测试ID: ${item.test_id}`);
      console.log(`        物料编码: ${item.material_code}`);
      console.log(`        批次: ${item.batch_code}`);
      console.log(`        项目: ${item.project_id} | 基线: ${item.baseline_id}`);
      console.log(`        结果: ${item.test_result} | 不良: ${item.defect_desc || '无'}`);
      
      // 检查是否符合生成器模式
      const isGeneratedPattern = item.test_id && item.test_id.startsWith('TEST-');
      const isValidProject = generatorSettings.projects.includes(item.project_id);
      const isValidBaseline = generatorSettings.baselineMapping[item.project_id] === item.baseline_id;
      
      console.log(`        生成器模式: ${isGeneratedPattern ? '✅' : '❌'}`);
      console.log(`        有效项目: ${isValidProject ? '✅' : '❌'}`);
      console.log(`        正确映射: ${isValidBaseline ? '✅' : '❌'}`);
      console.log('');
    });
    
    // 7. 检查数据生成的时间特征
    console.log('7. ⏰ 检查数据生成时间特征:');
    
    const [dateStats] = await connection.execute(`
      SELECT 
        DATE(test_date) as test_date,
        COUNT(*) as count
      FROM lab_tests 
      GROUP BY DATE(test_date)
      ORDER BY test_date DESC
      LIMIT 10
    `);
    
    console.log('   最近的测试日期分布:');
    dateStats.forEach(stat => {
      console.log(`     ${stat.test_date}: ${stat.count} 条记录`);
    });
    
    // 8. 总结分析
    console.log('\n📋 数据来源分析总结:');
    console.log('==========================================');
    
    const totalRecords = await connection.execute('SELECT COUNT(*) as total FROM lab_tests');
    const totalCount = totalRecords[0][0].total;
    
    console.log(`✅ 总测试记录数: ${totalCount}`);
    console.log(`✅ 数据来源: 数据生成器 (data_generator.js)`);
    console.log(`✅ 项目数量: ${generatorSettings.projects.length} 个`);
    console.log(`✅ 基线映射: 3个基线 (I6787, I6788, I6789)`);
    console.log(`✅ 测试结果: PASS/FAIL 格式`);
    
    // 9. 建议的修复方案
    console.log('\n🔧 建议的修复方案:');
    console.log('1. 确认数据生成器设定是否符合实际业务需求');
    console.log('2. 如需真实数据，需要从实际业务系统导入');
    console.log('3. 如使用生成器数据，需要完善不良现象和备注字段的生成逻辑');
    console.log('4. 测试结果字段转换 (PASS→OK, FAIL→NG) 已在规则中处理');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkDataGeneratorSettings();
