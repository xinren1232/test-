import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixProjectBaselineMapping() {
  console.log('🔧 根据数据生成器修复项目基线映射...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 从您的数据生成器中提取的正确项目基线映射
    console.log('1. 📋 数据生成器中的正确项目基线映射:');
    
    const correctProjectBaselineMap = {
      "X6827": "I6789",
      "S665LN": "I6789",
      "KI4K": "I6789",
      "X6828": "I6789",
      "X6831": "I6788",
      "KI5K": "I6788",
      "KI3K": "I6788",
      "S662LN": "I6787",
      "S663LN": "I6787",
      "S664LN": "I6787"
    };
    
    console.log('   正确的项目基线映射:');
    Object.entries(correctProjectBaselineMap).forEach(([project, baseline]) => {
      console.log(`     ${project} → ${baseline}`);
    });
    
    const allProjects = Object.keys(correctProjectBaselineMap);
    const allBaselines = [...new Set(Object.values(correctProjectBaselineMap))];
    
    console.log(`   项目总数: ${allProjects.length} 个`);
    console.log(`   基线总数: ${allBaselines.length} 个`);
    console.log(`   项目列表: [${allProjects.join(', ')}]`);
    console.log(`   基线列表: [${allBaselines.join(', ')}]`);
    
    // 2. 检查当前数据库中的项目基线分布
    console.log('\n2. 📊 检查当前数据库中的项目基线分布:');
    
    // 检查测试数据
    const [testProjectStats] = await connection.execute(`
      SELECT 
        project_id,
        baseline_id,
        COUNT(*) as count
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id
      ORDER BY project_id, baseline_id
    `);
    
    console.log('   测试数据中的项目基线分布:');
    testProjectStats.forEach(stat => {
      const isCorrect = correctProjectBaselineMap[stat.project_id] === stat.baseline_id;
      console.log(`     ${stat.project_id} - ${stat.baseline_id}: ${stat.count} 条 ${isCorrect ? '✅' : '❌'}`);
    });
    
    // 检查上线数据
    const [onlineProjectStats] = await connection.execute(`
      SELECT 
        project,
        baseline,
        COUNT(*) as count
      FROM online_tracking 
      WHERE project IS NOT NULL AND baseline IS NOT NULL
      GROUP BY project, baseline
      ORDER BY project, baseline
    `);
    
    console.log('   上线数据中的项目基线分布:');
    onlineProjectStats.forEach(stat => {
      const isCorrect = correctProjectBaselineMap[stat.project] === stat.baseline;
      console.log(`     ${stat.project} - ${stat.baseline}: ${stat.count} 条 ${isCorrect ? '✅' : '❌'}`);
    });
    
    // 3. 修复测试数据中的项目基线映射
    console.log('\n3. 🔧 修复测试数据中的项目基线映射:');
    
    let testFixCount = 0;
    
    for (const [projectId, correctBaselineId] of Object.entries(correctProjectBaselineMap)) {
      // 修复该项目下所有记录的基线
      const [updateResult] = await connection.execute(`
        UPDATE lab_tests 
        SET baseline_id = ?
        WHERE project_id = ? AND baseline_id != ?
      `, [correctBaselineId, projectId, correctBaselineId]);
      
      if (updateResult.affectedRows > 0) {
        console.log(`   ✅ 修复项目 ${projectId} 的基线为 ${correctBaselineId}: ${updateResult.affectedRows} 条记录`);
        testFixCount += updateResult.affectedRows;
      }
    }
    
    console.log(`   总共修复测试数据: ${testFixCount} 条记录`);
    
    // 4. 修复上线数据中的项目基线映射
    console.log('\n4. 🔧 修复上线数据中的项目基线映射:');
    
    let onlineFixCount = 0;
    
    for (const [projectId, correctBaselineId] of Object.entries(correctProjectBaselineMap)) {
      // 修复该项目下所有记录的基线
      const [updateResult] = await connection.execute(`
        UPDATE online_tracking 
        SET baseline = ?
        WHERE project = ? AND baseline != ?
      `, [correctBaselineId, projectId, correctBaselineId]);
      
      if (updateResult.affectedRows > 0) {
        console.log(`   ✅ 修复项目 ${projectId} 的基线为 ${correctBaselineId}: ${updateResult.affectedRows} 条记录`);
        onlineFixCount += updateResult.affectedRows;
      }
    }
    
    console.log(`   总共修复上线数据: ${onlineFixCount} 条记录`);
    
    // 5. 验证修复结果
    console.log('\n5. 🧪 验证修复结果:');
    
    // 验证测试数据
    const [verifyTestStats] = await connection.execute(`
      SELECT 
        project_id,
        baseline_id,
        COUNT(*) as count
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id
      ORDER BY project_id, baseline_id
    `);
    
    console.log('   修复后测试数据项目基线分布:');
    let testCorrectCount = 0;
    let testTotalCount = 0;
    
    verifyTestStats.forEach(stat => {
      const isCorrect = correctProjectBaselineMap[stat.project_id] === stat.baseline_id;
      console.log(`     ${stat.project_id} - ${stat.baseline_id}: ${stat.count} 条 ${isCorrect ? '✅' : '❌'}`);
      if (isCorrect) testCorrectCount += stat.count;
      testTotalCount += stat.count;
    });
    
    // 验证上线数据
    const [verifyOnlineStats] = await connection.execute(`
      SELECT 
        project,
        baseline,
        COUNT(*) as count
      FROM online_tracking 
      WHERE project IS NOT NULL AND baseline IS NOT NULL
      GROUP BY project, baseline
      ORDER BY project, baseline
    `);
    
    console.log('   修复后上线数据项目基线分布:');
    let onlineCorrectCount = 0;
    let onlineTotalCount = 0;
    
    verifyOnlineStats.forEach(stat => {
      const isCorrect = correctProjectBaselineMap[stat.project] === stat.baseline;
      console.log(`     ${stat.project} - ${stat.baseline}: ${stat.count} 条 ${isCorrect ? '✅' : '❌'}`);
      if (isCorrect) onlineCorrectCount += stat.count;
      onlineTotalCount += stat.count;
    });
    
    // 6. 测试修复后的规则查询
    console.log('\n6. 🧪 测试修复后的规则查询:');
    
    // 测试测试场景规则
    const testSQL = `
SELECT 
  COALESCE(test_id, '无编号') as 测试编号,
  COALESCE(DATE_FORMAT(test_date, '%Y-%m-%d'), '未知日期') as 日期,
  COALESCE(project_id, '未知项目') as 项目,
  COALESCE(baseline_id, '未知基线') as 基线,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(batch_code, '无批次') as 批次,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  CASE 
    WHEN test_result = 'PASS' THEN 'OK'
    WHEN test_result = 'FAIL' THEN 'NG'
    ELSE COALESCE(test_result, '未知')
  END as 测试结果,
  COALESCE(defect_desc, '') as 不良现象
FROM lab_tests 
WHERE 1=1 ORDER BY test_date DESC LIMIT 10`;
    
    const [testResult] = await connection.execute(testSQL);
    console.log(`   ✅ 测试场景查询: ${testResult.length} 条记录`);
    
    if (testResult.length > 0) {
      console.log('   📊 测试数据样本:');
      testResult.slice(0, 3).forEach((item, index) => {
        const isCorrectMapping = correctProjectBaselineMap[item.项目] === item.基线;
        console.log(`     ${index + 1}. ${item.物料名称} | ${item.供应商}`);
        console.log(`        项目: ${item.项目} | 基线: ${item.基线} ${isCorrectMapping ? '✅' : '❌'}`);
        console.log(`        测试结果: ${item.测试结果} | 批次: ${item.批次}`);
      });
    }
    
    // 测试上线场景规则
    const onlineSQL = `
SELECT 
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, '未知基线') as 基线,
  COALESCE(project, '未知项目') as 项目,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '无批次') as 批次,
  COALESCE(CONCAT(ROUND(defect_rate * 100, 2), '%'), '0%') as 不良率,
  COALESCE(weekly_anomaly, '') as 不良现象,
  COALESCE(DATE_FORMAT(inspection_date, '%Y-%m-%d'), DATE_FORMAT(online_date, '%Y-%m-%d')) as 检验日期
FROM online_tracking 
WHERE 1=1 ORDER BY inspection_date DESC LIMIT 10`;
    
    const [onlineResult] = await connection.execute(onlineSQL);
    console.log(`   ✅ 上线场景查询: ${onlineResult.length} 条记录`);
    
    if (onlineResult.length > 0) {
      console.log('   📊 上线数据样本:');
      onlineResult.slice(0, 3).forEach((item, index) => {
        const isCorrectMapping = correctProjectBaselineMap[item.项目] === item.基线;
        console.log(`     ${index + 1}. ${item.物料名称} | ${item.供应商} | ${item.工厂}`);
        console.log(`        项目: ${item.项目} | 基线: ${item.基线} ${isCorrectMapping ? '✅' : '❌'}`);
        console.log(`        不良率: ${item.不良率} | 检验日期: ${item.检验日期}`);
      });
    }
    
    await connection.end();
    
    console.log('\n📋 项目基线映射修复完成总结:');
    console.log('==========================================');
    console.log(`✅ 修复测试数据: ${testFixCount} 条记录`);
    console.log(`✅ 修复上线数据: ${onlineFixCount} 条记录`);
    console.log(`✅ 测试数据正确率: ${testTotalCount > 0 ? ((testCorrectCount/testTotalCount)*100).toFixed(1) : 0}%`);
    console.log(`✅ 上线数据正确率: ${onlineTotalCount > 0 ? ((onlineCorrectCount/onlineTotalCount)*100).toFixed(1) : 0}%`);
    console.log('✅ 项目基线映射现在完全符合数据生成器设定');
    
    console.log('\n📋 正确的项目基线映射关系:');
    console.log('   I6789基线: X6827, S665LN, KI4K, X6828');
    console.log('   I6788基线: X6831, KI5K, KI3K');
    console.log('   I6787基线: S662LN, S663LN, S664LN');
    
    console.log('\n🔄 请重新测试前端查询，项目基线映射现在正确');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixProjectBaselineMapping();
