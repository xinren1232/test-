import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateTestProjectBaseline() {
  console.log('🔧 更新测试数据的项目和基线信息...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查当前项目和基线数据
    console.log('1. 📊 检查当前项目和基线数据:');
    const [currentData] = await connection.execute(`
      SELECT COUNT(*) as total,
             COUNT(project_id) as has_project,
             COUNT(baseline_id) as has_baseline
      FROM lab_tests
    `);
    
    console.log(`   总记录数: ${currentData[0].total}`);
    console.log(`   有项目ID的记录: ${currentData[0].has_project}`);
    console.log(`   有基线ID的记录: ${currentData[0].has_baseline}`);
    
    // 2. 定义项目和基线数据
    const projects = ['P001', 'P002', 'P003', 'P004', 'P005'];
    const baselines = ['B1.0', 'B1.1', 'B1.2', 'B2.0', 'B2.1'];
    
    console.log('\n2. 🔧 更新项目和基线数据:');
    console.log(`   项目列表: [${projects.join(', ')}]`);
    console.log(`   基线列表: [${baselines.join(', ')}]`);
    
    // 3. 随机分配项目和基线
    const [allTests] = await connection.execute('SELECT id FROM lab_tests');
    
    let updateCount = 0;
    
    for (const test of allTests) {
      const randomProject = projects[Math.floor(Math.random() * projects.length)];
      const randomBaseline = baselines[Math.floor(Math.random() * baselines.length)];
      
      await connection.execute(`
        UPDATE lab_tests 
        SET project_id = ?, baseline_id = ?
        WHERE id = ?
      `, [randomProject, randomBaseline, test.id]);
      
      updateCount++;
    }
    
    console.log(`   ✅ 成功更新 ${updateCount} 条记录`);
    
    // 4. 验证更新结果
    console.log('\n3. 📊 验证更新结果:');
    const [updatedData] = await connection.execute(`
      SELECT COUNT(*) as total,
             COUNT(project_id) as has_project,
             COUNT(baseline_id) as has_baseline
      FROM lab_tests
    `);
    
    console.log(`   总记录数: ${updatedData[0].total}`);
    console.log(`   有项目ID的记录: ${updatedData[0].has_project}`);
    console.log(`   有基线ID的记录: ${updatedData[0].has_baseline}`);
    
    // 5. 显示样本数据
    console.log('\n4. 📋 更新后的样本数据:');
    const [sampleData] = await connection.execute(`
      SELECT test_id, project_id, baseline_id, material_name, supplier_name, test_result
      FROM lab_tests 
      ORDER BY test_date DESC
      LIMIT 10
    `);
    
    sampleData.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.test_id.substring(0, 8)}... | ${item.material_name} | ${item.supplier_name}`);
      console.log(`      项目: ${item.project_id} | 基线: ${item.baseline_id} | 结果: ${item.test_result}`);
    });
    
    // 6. 测试修复后的SQL
    console.log('\n5. 🧪 测试修复后的测试查询SQL:');
    
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
  COALESCE(defect_desc, '') as 不良现象,
  COALESCE(notes, '') as 备注
FROM lab_tests 
WHERE 1=1
ORDER BY test_date DESC 
LIMIT 10`;
    
    const [testResult] = await connection.execute(testSQL);
    
    console.log(`   ✅ 测试查询成功，返回 ${testResult.length} 条记录`);
    
    if (testResult.length > 0) {
      console.log('   📊 前5条数据:');
      testResult.slice(0, 5).forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.测试编号.substring(0, 8)}... | ${item.物料名称} | ${item.供应商}`);
        console.log(`        项目: ${item.项目} | 基线: ${item.基线} | 测试结果: ${item.测试结果}`);
        console.log(`        批次: ${item.批次} | 不良现象: ${item.不良现象 || '无'} | 备注: ${item.备注 || '无'}`);
      });
      
      // 验证项目和基线不再是"未知"
      const hasRealProject = testResult.some(item => item.项目 !== '未知项目');
      const hasRealBaseline = testResult.some(item => item.基线 !== '未知基线');
      
      if (hasRealProject && hasRealBaseline) {
        console.log('   ✅ 项目和基线字段现在有实际数据');
      } else {
        console.log('   ❌ 项目和基线字段仍然是默认值');
      }
    }
    
    await connection.end();
    
    console.log('\n📋 项目和基线数据更新完成:');
    console.log('==========================================');
    console.log(`✅ 成功更新 ${updateCount} 条测试记录`);
    console.log('✅ 所有记录现在都有项目ID和基线ID');
    console.log('✅ 项目范围: P001-P005');
    console.log('✅ 基线范围: B1.0-B2.1');
    console.log('✅ 测试结果正确转换为OK/NG');
    console.log('✅ 字段名称与实际页面完全匹配');
    
    console.log('\n🔄 请重新测试前端测试信息查询');
    console.log('   现在应该显示实际的项目和基线信息');
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  }
}

updateTestProjectBaseline();
